from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class GDDRequest(BaseModel):
    temperature_min: float
    temperature_max: float
    base_temperature: float = 10.0

class WaterBalanceRequest(BaseModel):
    rainfall: float
    evapotranspiration: float
    soil_capacity: float = 100.0

class MLTrainRequest(BaseModel):
    features: List[Any]
    target_yields: List[float]
    model_name: str = "default"

class MLPredictRequest(BaseModel):
    features: List[Any]
    model_name: str = "default"

class ClimateRiskRequest(BaseModel):
    historical_temperatures: List[float]
    historical_rainfall: List[float]
    climate_change_factor: float = 1.02

class ComprehensivePredictionRequest(BaseModel):
    crop: str
    region: str
    soil_type: str
    temperature_min: float
    temperature_max: float
    rainfall: float
    soil_ph: float = 7.0
    planting_date: str  # ISO date string
