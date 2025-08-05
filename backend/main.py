# Mini Agronomist Python Backend API
# FastAPI server providing advanced agricultural computing services

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
import joblib
import json
import math
import os
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Mini Agronomist API",
    description="Advanced agricultural computing and prediction services",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# ==========================================
# PYDANTIC MODELS
# ==========================================

class PredictionRequest(BaseModel):
    crop: str = Field(..., description="Crop type")
    region: str = Field(..., description="Region name")
    soil_type: str = Field(..., description="Soil type")
    temperature_min: float = Field(..., ge=-50, le=60, description="Minimum temperature (°C)")
    temperature_max: float = Field(..., ge=-50, le=60, description="Maximum temperature (°C)")
    rainfall: float = Field(..., ge=0, le=5000, description="Rainfall (mm)")
    soil_ph: Optional[float] = Field(7.0, ge=3.0, le=11.0, description="Soil pH")
    planting_date: Optional[str] = Field(None, description="Planned planting date (YYYY-MM-DD)")

class GrowingDegreeDaysRequest(BaseModel):
    temperature_min: float = Field(..., description="Minimum temperature (°C)")
    temperature_max: float = Field(..., description="Maximum temperature (°C)")
    base_temperature: Optional[float] = Field(10.0, description="Base temperature for crop")

class WaterBalanceRequest(BaseModel):
    rainfall: float = Field(..., ge=0, description="Rainfall (mm)")
    evapotranspiration: float = Field(..., ge=0, description="Evapotranspiration (mm)")
    soil_capacity: Optional[float] = Field(100.0, ge=0, description="Soil water holding capacity")

class ClimateRiskRequest(BaseModel):
    historical_temperatures: List[float] = Field(..., description="Historical temperature data")
    historical_rainfall: List[float] = Field(..., description="Historical rainfall data")
    climate_change_factor: Optional[float] = Field(1.02, description="Climate change factor")

class MLTrainingRequest(BaseModel):
    features: List[List[float]] = Field(..., description="Training features")
    target_yields: List[float] = Field(..., description="Target yield values")
    model_name: Optional[str] = Field("default", description="Model identifier")

class MLPredictionRequest(BaseModel):
    features: List[float] = Field(..., description="Features for prediction")
    model_name: Optional[str] = Field("default", description="Model identifier")

# ==========================================
# AGRICULTURAL COMPUTING CLASS
# ==========================================

class AgriculturalComputer:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_metadata = {}
        
    def growing_degree_days(self, temp_min: float, temp_max: float, base_temp: float = 10.0) -> float:
        """Calculate Growing Degree Days using standard formula"""
        avg_temp = (temp_min + temp_max) / 2
        gdd = max(0, avg_temp - base_temp)
        return gdd
    
    def accumulated_gdd(self, daily_temps: List[tuple], base_temp: float = 10.0) -> float:
        """Calculate accumulated GDD over a season"""
        total_gdd = 0
        for temp_min, temp_max in daily_temps:
            total_gdd += self.growing_degree_days(temp_min, temp_max, base_temp)
        return total_gdd
    
    def evapotranspiration_penman(self, temp: float, humidity: float, wind_speed: float, radiation: float) -> float:
        """Penman-Monteith evapotranspiration calculation (simplified)"""
        # Slope of saturation vapor pressure curve
        delta = 4098 * (0.6108 * math.exp(17.27 * temp / (temp + 237.3))) / ((temp + 237.3) ** 2)
        
        # Psychrometric constant
        gamma = 0.665
        
        # Wind speed at 2m height
        u2 = wind_speed * 4.87 / math.log(67.8 * 10 - 5.42)
        
        # Simplified Penman equation
        et0 = (0.408 * delta * radiation + gamma * 900 / (temp + 273) * u2 * (0.01 * humidity)) / \
              (delta + gamma * (1 + 0.34 * u2))
        
        return max(0, et0)
    
    def water_balance(self, rainfall: float, evapotranspiration: float, soil_capacity: float = 100.0) -> Dict:
        """Calculate soil water balance"""
        water_available = rainfall - evapotranspiration
        soil_moisture = min(soil_capacity, max(0, water_available))
        water_stress = max(0, evapotranspiration - rainfall) / evapotranspiration if evapotranspiration > 0 else 0
        
        return {
            'soil_moisture': soil_moisture,
            'water_stress': water_stress,
            'deficit': max(0, evapotranspiration - rainfall),
            'surplus': max(0, rainfall - evapotranspiration - soil_capacity)
        }
    
    def train_yield_model(self, features: List[List[float]], target_yields: List[float], model_name: str = "default") -> Dict:
        """Train machine learning model for yield prediction"""
        features_array = np.array(features)
        target_array = np.array(target_yields)
        
        # Scale features
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features_array)
        
        # Train Random Forest model
        model = RandomForestRegressor(
            n_estimators=100,
            random_state=42,
            max_depth=10,
            min_samples_split=5
        )
        model.fit(features_scaled, target_array)
        
        # Cross-validation
        cv_scores = cross_val_score(model, features_scaled, target_array, cv=5)
        
        # Store model and scaler
        self.models[model_name] = model
        self.scalers[model_name] = scaler
        self.model_metadata[model_name] = {
            'trained_at': datetime.now().isoformat(),
            'n_samples': len(features),
            'n_features': features_array.shape[1],
            'cv_mean': np.mean(cv_scores),
            'cv_std': np.std(cv_scores)
        }
        
        # Save model to disk
        os.makedirs('models', exist_ok=True)
        joblib.dump(model, f'models/{model_name}_model.pkl')
        joblib.dump(scaler, f'models/{model_name}_scaler.pkl')
        
        return {
            'model_accuracy': np.mean(cv_scores),
            'cv_std': np.std(cv_scores),
            'feature_importance': model.feature_importances_.tolist(),
            'model_name': model_name,
            'training_samples': len(features)
        }
    
    def predict_yield(self, features: List[float], model_name: str = "default") -> Dict:
        """Predict yield using trained model"""
        if model_name not in self.models:
            # Try to load from disk
            try:
                self.models[model_name] = joblib.load(f'models/{model_name}_model.pkl')
                self.scalers[model_name] = joblib.load(f'models/{model_name}_scaler.pkl')
            except FileNotFoundError:
                raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")
        
        model = self.models[model_name]
        scaler = self.scalers[model_name]
        
        # Prepare features
        features_array = np.array(features).reshape(1, -1)
        features_scaled = scaler.transform(features_array)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        
        # Calculate prediction interval
        tree_predictions = [tree.predict(features_scaled)[0] for tree in model.estimators_]
        prediction_std = np.std(tree_predictions)
        confidence = max(0, 1 - (prediction_std / prediction)) if prediction > 0 else 0
        
        return {
            'predicted_yield': float(prediction),
            'confidence': float(confidence),
            'prediction_interval': [
                float(prediction - 2 * prediction_std),
                float(prediction + 2 * prediction_std)
            ],
            'model_name': model_name,
            'prediction_std': float(prediction_std)
        }
    
    def climate_risk_assessment(self, temperatures: List[float], rainfall: List[float], 
                               climate_change_factor: float = 1.02) -> Dict:
        """Assess climate risks and future projections"""
        temps = np.array(temperatures)
        rain = np.array(rainfall)
        
        # Current climate statistics
        current_stats = {
            'mean_temp': float(np.mean(temps)),
            'temp_std': float(np.std(temps)),
            'mean_rainfall': float(np.mean(rain)),
            'rainfall_std': float(np.std(rain)),
            'extreme_heat_days': int(np.sum(temps > 35)),
            'drought_risk': float(np.sum(rain < 50) / len(rain))
        }
        
        # Future projections
        future_temp = temps * climate_change_factor
        future_rainfall = rain * (2 - climate_change_factor)
        
        future_stats = {
            'projected_mean_temp': float(np.mean(future_temp)),
            'projected_rainfall': float(np.mean(future_rainfall)),
            'projected_extreme_heat': int(np.sum(future_temp > 35)),
            'projected_drought_risk': float(np.sum(future_rainfall < 50) / len(future_rainfall))
        }
        
        # Risk calculations
        heat_risk_increase = (future_stats['projected_extreme_heat'] - current_stats['extreme_heat_days']) / max(1, current_stats['extreme_heat_days'])
        drought_risk_increase = future_stats['projected_drought_risk'] - current_stats['drought_risk']
        
        return {
            'current': current_stats,
            'projected': future_stats,
            'risk_changes': {
                'heat_stress_increase': float(heat_risk_increase),
                'drought_risk_increase': float(drought_risk_increase),
                'temperature_increase': float(np.mean(future_temp) - np.mean(temps)),
                'rainfall_change': float(np.mean(future_rainfall) - np.mean(rain))
            }
        }

# Initialize agricultural computer
agri_computer = AgriculturalComputer()

# ==========================================
# API ENDPOINTS
# ==========================================

@app.get("/")
async def root():
    return {
        "service": "Mini Agronomist API",
        "version": "2.0.0",
        "status": "running",
        "description": "Advanced agricultural computing and prediction services"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": len(agri_computer.models)
    }

@app.post("/compute/gdd")
async def compute_growing_degree_days(request: GrowingDegreeDaysRequest):
    """Calculate Growing Degree Days"""
    try:
        gdd = agri_computer.growing_degree_days(
            request.temperature_min,
            request.temperature_max,
            request.base_temperature
        )
        
        return {
            "gdd": gdd,
            "temperature_min": request.temperature_min,
            "temperature_max": request.temperature_max,
            "base_temperature": request.base_temperature,
            "computed_at": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"GDD computation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compute/water-balance")
async def compute_water_balance(request: WaterBalanceRequest):
    """Calculate water balance"""
    try:
        balance = agri_computer.water_balance(
            request.rainfall,
            request.evapotranspiration,
            request.soil_capacity
        )
        
        return {
            **balance,
            "inputs": {
                "rainfall": request.rainfall,
                "evapotranspiration": request.evapotranspiration,
                "soil_capacity": request.soil_capacity
            },
            "computed_at": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Water balance computation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ml/train")
async def train_model(request: MLTrainingRequest):
    """Train machine learning model"""
    try:
        result = agri_computer.train_yield_model(
            request.features,
            request.target_yields,
            request.model_name
        )
        
        logger.info(f"Model '{request.model_name}' trained successfully")
        return result
        
    except Exception as e:
        logger.error(f"Model training error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ml/predict")
async def predict_yield(request: MLPredictionRequest):
    """Predict yield using trained model"""
    try:
        result = agri_computer.predict_yield(
            request.features,
            request.model_name
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compute/climate-risk")
async def assess_climate_risk(request: ClimateRiskRequest):
    """Assess climate risks"""
    try:
        result = agri_computer.climate_risk_assessment(
            request.historical_temperatures,
            request.historical_rainfall,
            request.climate_change_factor
        )
        
        return {
            **result,
            "computed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Climate risk assessment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/comprehensive")
async def comprehensive_prediction(request: PredictionRequest):
    """Comprehensive agricultural prediction"""
    try:
        # Calculate GDD
        gdd = agri_computer.growing_degree_days(
            request.temperature_min,
            request.temperature_max,
            10.0  # Default base temperature
        )
        
        # Calculate water balance (simplified ET calculation)
        avg_temp = (request.temperature_min + request.temperature_max) / 2
        estimated_et = max(0, avg_temp * 0.15)  # Simplified ET estimation
        
        water_balance = agri_computer.water_balance(
            request.rainfall,
            estimated_et
        )
        
        # Prepare features for ML prediction if model exists
        features = [
            avg_temp,
            request.rainfall,
            request.soil_ph,
            gdd,
            water_balance['soil_moisture']
        ]
        
        ml_prediction = None
        try:
            ml_prediction = agri_computer.predict_yield(features, "default")
        except:
            # ML prediction not available
            pass
        
        return {
            "request": request.dict(),
            "gdd": gdd,
            "water_balance": water_balance,
            "ml_prediction": ml_prediction,
            "estimated_et": estimated_et,
            "computed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Comprehensive prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
async def list_models():
    """List available models"""
    return {
        "models": list(agri_computer.models.keys()),
        "metadata": agri_computer.model_metadata
    }

# ==========================================
# STARTUP EVENT
# ==========================================

@app.on_event("startup")
async def startup_event():
    logger.info("🌾 Mini Agronomist API starting up...")
    
    # Load existing models
    try:
        if os.path.exists('models'):
            for file in os.listdir('models'):
                if file.endswith('_model.pkl'):
                    model_name = file.replace('_model.pkl', '')
                    try:
                        agri_computer.models[model_name] = joblib.load(f'models/{file}')
                        agri_computer.scalers[model_name] = joblib.load(f'models/{model_name}_scaler.pkl')
                        logger.info(f"✅ Loaded model: {model_name}")
                    except Exception as e:
                        logger.warning(f"⚠️ Failed to load model {model_name}: {e}")
    except Exception as e:
        logger.warning(f"⚠️ Model loading error: {e}")
    
    logger.info("🚀 Mini Agronomist API ready!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
