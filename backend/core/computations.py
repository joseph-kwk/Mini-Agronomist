import numpy as np

def calculate_gdd(t_min, t_max, base_temp=10.0):
    """
    Calculate Growing Degree Days (GDD).
    """
    avg_temp = (t_min + t_max) / 2
    gdd = max(avg_temp - base_temp, 0)
    return gdd

def calculate_water_balance(rainfall, et, soil_capacity=100.0):
    """
    Calculate simple water balance.
    """
    # Simple bucket model
    # moisture = rainfall - evapotranspiration
    # constrained by soil capacity
    
    # Assuming starting at 50% capacity for a single snapshot calculation
    initial_moisture = soil_capacity * 0.5 
    
    final_moisture = initial_moisture + rainfall - et
    final_moisture = max(0, min(final_moisture, soil_capacity))
    
    deficit = max(0, soil_capacity - final_moisture)
    water_stress = 1.0 - (final_moisture / soil_capacity)
    
    return {
        "soil_moisture": final_moisture,
        "water_stress": water_stress,
        "deficit": deficit
    }

def assess_climate_risk(hist_temps, hist_rain, factor=1.02):
    """
    Assess climate risk based on historical data and climate change factor.
    """
    temps = np.array(hist_temps)
    rains = np.array(hist_rain)
    
    # Project future
    future_temps = temps * factor
    future_rains = rains * (1.0 + (1.0 - factor)) # Inverse for rain (rough approx)
    
    temp_volatility = np.std(future_temps)
    rain_volatility = np.std(future_rains)
    
    # Simple risk score 0-1
    risk_score = min(1.0, (temp_volatility + rain_volatility) / 20.0)
    
    return {
        "risk_score": risk_score,
        "temperature_projection": np.mean(future_temps),
        "rainfall_projection": np.mean(future_rains)
    }
