// Python Backend API Client for Mini Agronomist
// Connects JavaScript frontend to Python FastAPI backend

class PythonBackendClient {
  constructor() {
    this.baseURL = 'http://localhost:8001';
    this.isAvailable = false;
    this.models = [];
    
    this.init();
  }

  async init() {
    await this.checkConnection();
  }

  // ==========================================
  // CONNECTION MANAGEMENT
  // ==========================================

  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.isAvailable = true;
        console.log('🐍 Python backend connected:', data);
        
        // Load available models
        await this.loadAvailableModels();
        
        return true;
      } else {
        this.isAvailable = false;
        console.warn('⚠️ Python backend not available');
        return false;
      }
    } catch (error) {
      this.isAvailable = false;
      console.warn('⚠️ Cannot connect to Python backend:', error.message);
      return false;
    }
  }

  async loadAvailableModels() {
    try {
      const response = await fetch(`${this.baseURL}/models`);
      if (response.ok) {
        const data = await response.json();
        this.models = data.models;
        console.log('📊 Available ML models:', this.models);
      }
    } catch (error) {
      console.warn('Failed to load models:', error);
    }
  }

  // ==========================================
  // API METHODS
  // ==========================================

  async computeGrowingDegreeDays(tempMin, tempMax, baseTemp = 10) {
    if (!this.isAvailable) {
      throw new Error('Python backend not available');
    }

    try {
      const response = await fetch(`${this.baseURL}/compute/gdd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          temperature_min: tempMin,
          temperature_max: tempMax,
          base_temperature: baseTemp
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GDD computation error:', error);
      throw error;
    }
  }

  async computeWaterBalance(rainfall, evapotranspiration, soilCapacity = 100) {
    if (!this.isAvailable) {
      throw new Error('Python backend not available');
    }

    try {
      const response = await fetch(`${this.baseURL}/compute/water-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rainfall: rainfall,
          evapotranspiration: evapotranspiration,
          soil_capacity: soilCapacity
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Water balance computation error:', error);
      throw error;
    }
  }

  async trainModel(features, targetYields, modelName = 'default') {
    if (!this.isAvailable) {
      throw new Error('Python backend not available');
    }

    try {
      const response = await fetch(`${this.baseURL}/ml/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          features: features,
          target_yields: targetYields,
          model_name: modelName
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Update available models
      if (!this.models.includes(modelName)) {
        this.models.push(modelName);
      }
      
      return result;
    } catch (error) {
      console.error('Model training error:', error);
      throw error;
    }
  }

  async predictYield(features, modelName = 'default') {
    if (!this.isAvailable) {
      throw new Error('Python backend not available');
    }

    try {
      const response = await fetch(`${this.baseURL}/ml/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          features: features,
          model_name: modelName
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Yield prediction error:', error);
      throw error;
    }
  }

  async assessClimateRisk(temperatures, rainfall, climateChangeFactor = 1.02) {
    if (!this.isAvailable) {
      throw new Error('Python backend not available');
    }

    try {
      const response = await fetch(`${this.baseURL}/compute/climate-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          historical_temperatures: temperatures,
          historical_rainfall: rainfall,
          climate_change_factor: climateChangeFactor
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Climate risk assessment error:', error);
      throw error;
    }
  }

  async comprehensivePrediction(predictionData) {
    if (!this.isAvailable) {
      throw new Error('Python backend not available');
    }

    try {
      const response = await fetch(`${this.baseURL}/predict/comprehensive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          crop: predictionData.crop,
          region: predictionData.region,
          soil_type: predictionData.soilType,
          temperature_min: predictionData.temperature.min,
          temperature_max: predictionData.temperature.max,
          rainfall: predictionData.rainfall,
          soil_ph: predictionData.soilPh || 7.0,
          planting_date: predictionData.plantingDate
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Comprehensive prediction error:', error);
      throw error;
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  isConnected() {
    return this.isAvailable;
  }

  getAvailableModels() {
    return this.models;
  }

  async reconnect() {
    console.log('🔄 Attempting to reconnect to Python backend...');
    return await this.checkConnection();
  }

  // ==========================================
  // INTEGRATION HELPERS
  // ==========================================

  async enhancedPrediction(predictionData) {
    if (!this.isAvailable) {
      throw new Error('Python backend not available');
    }

    try {
      // Use comprehensive prediction endpoint
      const result = await this.comprehensivePrediction(predictionData);
      
      return {
        gdd: result.gdd,
        waterBalance: result.water_balance,
        mlPrediction: result.ml_prediction,
        estimatedEt: result.estimated_et,
        enhanced: true,
        computedBy: 'python_backend',
        computedAt: result.computed_at
      };
      
    } catch (error) {
      console.error('Enhanced prediction error:', error);
      throw error;
    }
  }

  // Demo data training for testing
  async trainDemoModel() {
    if (!this.isAvailable) {
      throw new Error('Python backend not available');
    }

    // Sample training data for agricultural prediction
    const demoFeatures = [
      [25, 500, 7.0, 15, 80], // [avg_temp, rainfall, soil_ph, gdd, soil_moisture]
      [28, 600, 6.5, 18, 90],
      [22, 400, 7.5, 12, 70],
      [30, 700, 6.0, 20, 95],
      [26, 550, 7.2, 16, 85],
      [24, 450, 7.8, 14, 75],
      [29, 650, 6.8, 19, 88],
      [27, 580, 7.1, 17, 82],
      [23, 420, 7.6, 13, 72],
      [31, 720, 5.8, 21, 98]
    ];

    const demoYields = [
      4.2, 5.1, 3.8, 5.8, 4.6, 
      4.0, 5.5, 4.9, 3.9, 6.0
    ]; // Corresponding yields in tons/hectare

    try {
      console.log('🎓 Training demo ML model...');
      const result = await this.trainModel(demoFeatures, demoYields, 'demo_model');
      console.log('✅ Demo model trained:', result);
      return result;
    } catch (error) {
      console.error('Demo model training failed:', error);
      throw error;
    }
  }
}

// Initialize backend client
let pythonBackendClient;
document.addEventListener('DOMContentLoaded', () => {
  pythonBackendClient = new PythonBackendClient();
  window.pythonBackendClient = pythonBackendClient;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PythonBackendClient;
}
