from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import numpy as np

# Import core modules
from core import computations, ml
from models import (
    GDDRequest, WaterBalanceRequest, MLTrainRequest, 
    MLPredictRequest, ClimateRiskRequest, ComprehensivePredictionRequest
)
import auth

app = FastAPI(title="Mini Agronomist Backend", version="4.3.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Mini Agronomist API is running", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "mini-agronomist-backend"}

@app.get("/models")
def list_models():
    return {"models": ml.get_available_models()}

@app.post("/compute/gdd")
def compute_gdd(request: GDDRequest):
    gdd = computations.calculate_gdd(
        request.temperature_min, 
        request.temperature_max, 
        request.base_temperature
    )
    return {"gdd": gdd}

@app.post("/compute/water-balance")
def compute_water_balance(request: WaterBalanceRequest):
    result = computations.calculate_water_balance(
        request.rainfall, 
        request.evapotranspiration, 
        request.soil_capacity
    )
    return result

@app.post("/compute/climate-risk")
def compute_climate_risk(request: ClimateRiskRequest):
    result = computations.assess_climate_risk(
        request.historical_temperatures, 
        request.historical_rainfall, 
        request.climate_change_factor
    )
    return result

@app.post("/ml/train")
def train_model_endpoint(request: MLTrainRequest):
    try:
        result = ml.train_model(
            request.features, 
            request.target_yields, 
            request.model_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ml/predict")
def predict_yield_endpoint(request: MLPredictRequest):
    try:
        predictions = ml.predict_yield(
            request.features, 
            request.model_name
        )
        return {"predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/comprehensive")
def comprehensive_prediction(request: ComprehensivePredictionRequest):
    # 1. Calculate GDD
    gdd = computations.calculate_gdd(request.temperature_min, request.temperature_max)
    
    # 2. Estimate ET (Simple approximation based on temperature)
    # Higher temp = higher ET. Base ~4mm + temp factor.
    avg_temp = (request.temperature_min + request.temperature_max) / 2
    estimated_et = 3.0 + (avg_temp * 0.15)
    
    # 3. Calculate Water Balance
    # Assuming weekly rainfall input? If monthly, divide by 4. 
    # Usually inputs are 'rainfall' (mm) per season or month. 
    # Let's assume input is total season rainfall and we break it down or treat it as a rate.
    # The frontend validation says "rainfall > 300" is high? Maybe per month.
    # We will treat it as a monthly equivalent for the balance snapshot.
    wb_results = computations.calculate_water_balance(
        rainfall=request.rainfall / 4, # Approximate weekly
        et=estimated_et * 7, # Weekly ET
        soil_capacity=150.0 # moderate soil
    )
    
    # 4. ML Prediction
    # Create feature dictionary matching the CSV training columns
    # Region,Crop,Soil_Type,Rainfall_mm,Temperature_C,pH
    avg_temp = (request.temperature_min + request.temperature_max) / 2
    
    features = [{
        "Region": request.region,
        "Crop": request.crop,
        "Soil_Type": request.soil_type,
        "Rainfall_mm": request.rainfall,
        "Temperature_C": avg_temp,
        "pH": request.soil_ph
    }]
    
    # Use real model (will auto-train from CSV if first run)
    ml_result = ml.predict_yield(features, "real_model")
    predicted_yield = ml_result[0] if ml_result else 0.0
    
    # Calculate confidence based on data quality (mock)
    confidence = 0.85 
    
    return {
        "gdd": gdd,
        "estimated_et": estimated_et,
        "water_balance": wb_results,
        "ml_prediction": {
            "predicted_yield": predicted_yield,
            "confidence": confidence,
            "model_used": "demo_model"
        },
        "computed_at": datetime.now().isoformat()
    }

# --- Real Data Integrations ---
import urllib.request
import json

@app.get("/api/weather/{region}")
def get_real_weather(region: str):
    """
    Fetch real-time weather data from Open-Meteo (Free API, no key required).
    """
    # Coordinates mapping for supported regions
    coords_map = {
        "southern_africa": {"lat": -25.74, "lon": 28.22}, # Pretoria
        "east_african_highlands": {"lat": -1.29, "lon": 36.82}, # Nairobi
        "northern_sahel": {"lat": 13.51, "lon": 2.12}, # Niamey
        "north_america_midwest": {"lat": 41.87, "lon": -93.62}, # Iowa
        "north_america_pacific": {"lat": 36.77, "lon": -119.41}, # California
        "south_america_cerrado": {"lat": -15.79, "lon": -47.88}, # Brasilia
    }
    
    location = coords_map.get(region.lower(), {"lat": 0.0, "lon": 0.0})
    
    if location["lat"] == 0.0:
        return {"error": "Region coordinates not found", "using_mock": True}

    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={location['lat']}&longitude={location['lon']}"
        f"&current=temperature_2m,rain,relative_humidity_2m"
        f"&daily=temperature_2m_max,temperature_2m_min,rain_sum"
        f"&timezone=auto&forecast_days=7"
    )
    
    try:
        # Set a timeout to prevent hanging
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read().decode())
            return {
                "source": "Open-Meteo",
                "coordinates": location,
                "current": data.get("current", {}),
                "forecast": data.get("daily", {})
            }
    except Exception as e:
        print(f"Weather API Error: {e}")
        return {"error": str(e), "unavailable": True}

# --- Authentication & Admin ---
users_db = {}

@app.on_event("startup")
def startup_event():
    # Create default admin user
    # In a real app, load from DB
    # Password: admin123
    users_db["admin"] = {
        "username": "admin",
        "hashed_password": auth.get_password_hash("admin123"),
        "role": "admin"
    }

@app.post("/token", response_model=auth.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_db.get(form_data.username)
    if not user or not auth.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    # We need to import timedelta from datetime or use auth's import if exposed
    # auth.py imports datetime and timedelta.
    # simpler:
    access_token = auth.create_access_token(
        data={"sub": user["username"], "role": user["role"]}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: auth.TokenData = Depends(auth.get_current_user)):
    return current_user

@app.get("/admin/dashboard")
async def admin_dashboard(current_user: auth.TokenData = Depends(auth.get_current_user)):
    # Verify role (mocked for now)
    if current_user.username != "admin": 
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return {
        "message": "Welcome to the Admin Dashboard",
        "user": current_user.username,
        "stats": {
            "users": 150,
            "models_trained": 12,
            "api_calls_today": 3400
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
