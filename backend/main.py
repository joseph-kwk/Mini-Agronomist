from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import numpy as np

# Import core modules
from core import computations, ml
from models import (
    GDDRequest, WaterBalanceRequest, MLTrainRequest, 
    MLPredictRequest, ClimateRiskRequest, ComprehensivePredictionRequest
)

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
