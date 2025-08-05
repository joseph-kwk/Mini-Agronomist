# Simplified Mini Agronomist Backend - Basic Version
# This version works without scientific libraries for initial setup

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
import math
from datetime import datetime

# Initialize FastAPI
app = FastAPI(
    title="Mini Agronomist API - Basic",
    description="Basic agricultural computing services",
    version="2.0.0-basic",
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

# ==========================================
# PYDANTIC MODELS
# ==========================================

class GrowingDegreeDaysRequest(BaseModel):
    temperature_min: float = Field(..., description="Minimum temperature (°C)")
    temperature_max: float = Field(..., description="Maximum temperature (°C)")
    base_temperature: Optional[float] = Field(10.0, description="Base temperature for crop")

class WaterBalanceRequest(BaseModel):
    rainfall: float = Field(..., ge=0, description="Rainfall (mm)")
    evapotranspiration: float = Field(..., ge=0, description="Evapotranspiration (mm)")
    soil_capacity: Optional[float] = Field(100.0, ge=0, description="Soil water holding capacity")

class PredictionRequest(BaseModel):
    crop: str = Field(..., description="Crop type")
    region: str = Field(..., description="Region name")
    soil_type: str = Field(..., description="Soil type")
    temperature_min: float = Field(..., ge=-50, le=60, description="Minimum temperature (°C)")
    temperature_max: float = Field(..., ge=-50, le=60, description="Maximum temperature (°C)")
    rainfall: float = Field(..., ge=0, le=5000, description="Rainfall (mm)")
    soil_ph: Optional[float] = Field(7.0, ge=3.0, le=11.0, description="Soil pH")

# ==========================================
# BASIC AGRICULTURAL COMPUTING
# ==========================================

class BasicAgriculturalComputer:
    def __init__(self):
        pass
        
    def growing_degree_days(self, temp_min: float, temp_max: float, base_temp: float = 10.0) -> float:
        """Calculate Growing Degree Days using standard formula"""
        avg_temp = (temp_min + temp_max) / 2
        gdd = max(0, avg_temp - base_temp)
        return gdd
    
    def water_balance(self, rainfall: float, evapotranspiration: float, soil_capacity: float = 100.0) -> Dict:
        """Calculate basic soil water balance"""
        water_available = rainfall - evapotranspiration
        soil_moisture = min(soil_capacity, max(0, water_available))
        water_stress = max(0, evapotranspiration - rainfall) / evapotranspiration if evapotranspiration > 0 else 0
        
        return {
            'soil_moisture': soil_moisture,
            'water_stress': water_stress,
            'deficit': max(0, evapotranspiration - rainfall),
            'surplus': max(0, rainfall - evapotranspiration - soil_capacity)
        }
    
    def basic_yield_estimate(self, temp_avg: float, rainfall: float, soil_ph: float) -> Dict:
        """Basic yield estimation without ML"""
        # Simplified yield estimation based on basic factors
        temp_score = 1.0 - min(1.0, abs(temp_avg - 25) / 20)  # Optimal around 25°C
        rainfall_score = min(1.0, rainfall / 500)  # Assume 500mm is optimal
        ph_score = 1.0 - min(1.0, abs(soil_ph - 7) / 3)  # Optimal around pH 7
        
        overall_score = (temp_score + rainfall_score + ph_score) / 3
        estimated_yield = overall_score * 5.0  # Scale to reasonable yield (tons/ha)
        
        return {
            'estimated_yield': round(estimated_yield, 2),
            'yield_score': round(overall_score, 3),
            'factor_scores': {
                'temperature': round(temp_score, 3),
                'rainfall': round(rainfall_score, 3),
                'soil_ph': round(ph_score, 3)
            },
            'confidence': round(0.6 + (overall_score * 0.3), 2)  # Basic confidence
        }

# Initialize basic computer
basic_computer = BasicAgriculturalComputer()

# ==========================================
# API ENDPOINTS
# ==========================================

@app.get("/")
async def root():
    return {
        "service": "Mini Agronomist API - Basic",
        "version": "2.0.0-basic",
        "status": "running",
        "description": "Basic agricultural computing services (no ML dependencies)"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "mode": "basic",
        "ml_available": False
    }

@app.post("/compute/gdd")
async def compute_growing_degree_days(request: GrowingDegreeDaysRequest):
    """Calculate Growing Degree Days"""
    try:
        gdd = basic_computer.growing_degree_days(
            request.temperature_min,
            request.temperature_max,
            request.base_temperature
        )
        
        return {
            "gdd": round(gdd, 2),
            "temperature_min": request.temperature_min,
            "temperature_max": request.temperature_max,
            "base_temperature": request.base_temperature,
            "computed_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compute/water-balance")
async def compute_water_balance(request: WaterBalanceRequest):
    """Calculate water balance"""
    try:
        balance = basic_computer.water_balance(
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
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/comprehensive")
async def comprehensive_prediction(request: PredictionRequest):
    """Basic comprehensive agricultural prediction"""
    try:
        # Calculate GDD
        gdd = basic_computer.growing_degree_days(
            request.temperature_min,
            request.temperature_max,
            10.0  # Default base temperature
        )
        
        # Calculate water balance (simplified ET calculation)
        avg_temp = (request.temperature_min + request.temperature_max) / 2
        estimated_et = max(0, avg_temp * 0.15)  # Simplified ET estimation
        
        water_balance = basic_computer.water_balance(
            request.rainfall,
            estimated_et
        )
        
        # Basic yield estimation
        yield_estimate = basic_computer.basic_yield_estimate(
            avg_temp,
            request.rainfall,
            request.soil_ph
        )
        
        return {
            "request": request.dict(),
            "gdd": round(gdd, 2),
            "water_balance": water_balance,
            "yield_estimate": yield_estimate,
            "estimated_et": round(estimated_et, 2),
            "mode": "basic",
            "computed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status")
async def get_status():
    """Get system status"""
    return {
        "mode": "basic",
        "ml_available": False,
        "scientific_computing": False,
        "message": "Running in basic mode. Install numpy, scipy, scikit-learn for advanced features.",
        "timestamp": datetime.now().isoformat()
    }

# ==========================================
# STARTUP EVENT
# ==========================================

@app.on_event("startup")
async def startup_event():
    print("🌾 Mini Agronomist Basic API starting up...")
    print("📊 Running in basic mode (no ML dependencies required)")
    print("🚀 Basic API ready!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
