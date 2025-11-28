// Python Integration Manager for Mini Agronomist
// Provides advanced scientific computing using Pyodide (Python in browser)

class PythonIntegration {
  constructor() {
    this.pyodide = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.loadingProgress = 0;
    
    // Python packages to load
    this.packages = [
      'numpy',
      'pandas', 
      'scipy',
      'matplotlib',
      'scikit-learn'
    ];
    
    this.init();
  }

  async init() {
    // Auto-load if user has Pro access
    if (window.authManager?.hasAccess('pro')) {
      await this.loadPython();
    }
  }

  // ==========================================
  // PYTHON ENVIRONMENT SETUP
  // ==========================================

  async loadPython() {
    if (this.isLoaded || this.isLoading) return;
    
    this.isLoading = true;
    this.showLoadingIndicator();
    
    try {
      // Load Pyodide
      console.log('🐍 Loading Python environment...');
      this.updateLoadingProgress(10, 'Loading Pyodide core...');
      
      // Load from CDN
      const pyodideScript = document.createElement('script');
      pyodideScript.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      
      await new Promise((resolve, reject) => {
        pyodideScript.onload = resolve;
        pyodideScript.onerror = reject;
        document.head.appendChild(pyodideScript);
      });

      this.updateLoadingProgress(30, 'Initializing Python runtime...');
      
      // Initialize Pyodide
      this.pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      });

      this.updateLoadingProgress(50, 'Installing scientific packages...');
      
      // Install required packages
      await this.installPackages();
      
      this.updateLoadingProgress(80, 'Setting up agricultural models...');
      
      // Setup agricultural computing environment
      await this.setupAgriculturalEnvironment();
      
      this.updateLoadingProgress(100, 'Python environment ready! 🎉');
      
      this.isLoaded = true;
      this.isLoading = false;
      
      // Hide loading indicator after a moment
      setTimeout(() => this.hideLoadingIndicator(), 1500);
      
      console.log('✅ Python environment loaded successfully!');
      
      // Notify the main app
      if (window.miniAgronomist) {
        window.miniAgronomist.onPythonReady();
      }
      
    } catch (error) {
      console.error('❌ Failed to load Python environment:', error);
      this.showError('Failed to load Python environment. Some advanced features may not be available.');
      this.isLoading = false;
      this.hideLoadingIndicator();
    }
  }

  async installPackages() {
    const totalPackages = this.packages.length;
    
    for (let i = 0; i < totalPackages; i++) {
      const pkg = this.packages[i];
      const progress = 50 + (25 * (i + 1) / totalPackages);
      
      this.updateLoadingProgress(progress, `Installing ${pkg}...`);
      
      try {
        await this.pyodide.loadPackage(pkg);
        console.log(`✅ Installed ${pkg}`);
      } catch (error) {
        console.warn(`⚠️ Failed to install ${pkg}:`, error);
      }
    }
  }

  async setupAgriculturalEnvironment() {
    if (!this.pyodide) return;
    
    // Load agricultural computing modules
    await this.pyodide.runPython(`
import numpy as np
import pandas as pd
from scipy import stats
from scipy.optimize import minimize
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
import json
import math

# Agricultural Computing Library
class AgriculturalComputing:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        
    def growing_degree_days(self, temp_min, temp_max, base_temp=10):
        """Calculate Growing Degree Days using standard formula"""
        avg_temp = (temp_min + temp_max) / 2
        gdd = max(0, avg_temp - base_temp)
        return gdd
    
    def accumulated_gdd(self, daily_temps, base_temp=10):
        """Calculate accumulated GDD over a season"""
        total_gdd = 0
        for temp_min, temp_max in daily_temps:
            total_gdd += self.growing_degree_days(temp_min, temp_max, base_temp)
        return total_gdd
    
    def evapotranspiration_penman(self, temp, humidity, wind_speed, radiation):
        """Penman-Monteith evapotranspiration calculation"""
        # Simplified Penman equation for demo
        # In production, use full Penman-Monteith with all parameters
        delta = 4098 * (0.6108 * math.exp(17.27 * temp / (temp + 237.3))) / ((temp + 237.3) ** 2)
        gamma = 0.665  # psychrometric constant
        u2 = wind_speed * 4.87 / math.log(67.8 * 10 - 5.42)  # wind speed at 2m
        
        et0 = (0.408 * delta * radiation + gamma * 900 / (temp + 273) * u2 * (0.01 * humidity)) / (delta + gamma * (1 + 0.34 * u2))
        return et0
    
    def water_balance(self, rainfall, evapotranspiration, soil_capacity=100):
        """Calculate soil water balance"""
        water_available = rainfall - evapotranspiration
        soil_moisture = min(soil_capacity, max(0, water_available))
        water_stress = max(0, evapotranspiration - rainfall) / evapotranspiration if evapotranspiration > 0 else 0
        
        return {
            'soil_moisture': soil_moisture,
            'water_stress': water_stress,
            'deficit': max(0, evapotranspiration - rainfall)
        }
    
    def yield_prediction_ml(self, features, target_yields=None, predict_features=None):
        """Machine learning-based yield prediction"""
        if target_yields is not None:
            # Training mode
            features_array = np.array(features)
            target_array = np.array(target_yields)
            
            # Scale features
            scaler = StandardScaler()
            features_scaled = scaler.fit_transform(features_array)
            
            # Train Random Forest model
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(features_scaled, target_array)
            
            # Cross-validation score
            cv_scores = cross_val_score(model, features_scaled, target_array, cv=5)
            
            # Store model and scaler
            self.models['yield_prediction'] = model
            self.scalers['yield_prediction'] = scaler
            
            return {
                'model_accuracy': np.mean(cv_scores),
                'cv_std': np.std(cv_scores),
                'feature_importance': model.feature_importances_.tolist()
            }
        else:
            # Prediction mode
            if 'yield_prediction' not in self.models:
                raise ValueError("Model not trained yet")
            
            model = self.models['yield_prediction']
            scaler = self.scalers['yield_prediction']
            
            predict_array = np.array(predict_features).reshape(1, -1)
            predict_scaled = scaler.transform(predict_array)
            
            prediction = model.predict(predict_scaled)[0]
            
            # Get prediction confidence (simplified)
            tree_predictions = [tree.predict(predict_scaled)[0] for tree in model.estimators_]
            confidence = 1 - (np.std(tree_predictions) / np.mean(tree_predictions))
            
            return {
                'predicted_yield': prediction,
                'confidence': confidence,
                'prediction_interval': [
                    prediction - 2 * np.std(tree_predictions),
                    prediction + 2 * np.std(tree_predictions)
                ]
            }
    
    def optimize_planting_date(self, temp_data, rainfall_data, crop_requirements):
        """Optimize planting date based on weather and crop requirements"""
        best_score = -1
        best_date = None
        
        for start_day in range(len(temp_data) - crop_requirements['growing_days']):
            end_day = start_day + crop_requirements['growing_days']
            
            # Calculate season metrics
            season_temps = temp_data[start_day:end_day]
            season_rainfall = sum(rainfall_data[start_day:end_day])
            
            avg_temp = np.mean(season_temps)
            temp_variance = np.var(season_temps)
            
            # Score based on crop requirements
            temp_score = 1 - min(1, abs(avg_temp - crop_requirements['optimal_temp']) / 10)
            rainfall_score = 1 - min(1, abs(season_rainfall - crop_requirements['water_need']) / crop_requirements['water_need'])
            variance_penalty = min(1, temp_variance / 25)  # Penalize high temperature variance
            
            total_score = (temp_score + rainfall_score - variance_penalty) / 2
            
            if total_score > best_score:
                best_score = total_score
                best_date = start_day
        
        return {
            'optimal_planting_day': best_date,
            'score': best_score,
            'harvest_day': best_date + crop_requirements['growing_days']
        }
    
    def climate_risk_assessment(self, historical_data, climate_change_factor=1.02):
        """Assess climate risks and future projections"""
        temps = np.array(historical_data['temperatures'])
        rainfall = np.array(historical_data['rainfall'])
        
        # Current climate statistics
        current_stats = {
            'mean_temp': np.mean(temps),
            'temp_std': np.std(temps),
            'mean_rainfall': np.mean(rainfall),
            'rainfall_std': np.std(rainfall),
            'extreme_heat_days': np.sum(temps > 35),
            'drought_risk': np.sum(rainfall < 50) / len(rainfall)
        }
        
        # Future projections (simplified climate change model)
        future_temp = temps * climate_change_factor
        future_rainfall = rainfall * (2 - climate_change_factor)  # Inverse relationship
        
        future_stats = {
            'projected_mean_temp': np.mean(future_temp),
            'projected_rainfall': np.mean(future_rainfall),
            'projected_extreme_heat': np.sum(future_temp > 35),
            'projected_drought_risk': np.sum(future_rainfall < 50) / len(future_rainfall)
        }
        
        return {
            'current': current_stats,
            'projected': future_stats,
            'risk_increase': {
                'heat_stress': (future_stats['projected_extreme_heat'] - current_stats['extreme_heat_days']) / max(1, current_stats['extreme_heat_days']),
                'drought_risk': future_stats['projected_drought_risk'] - current_stats['drought_risk']
            }
        }

# Initialize global agricultural computing instance
agri_compute = AgriculturalComputing()

# Helper function to interface with JavaScript
def compute_agricultural_metrics(data_json):
    """Main interface function for JavaScript"""
    data = json.loads(data_json)
    computation_type = data.get('type')
    
    if computation_type == 'gdd':
        return agri_compute.growing_degree_days(
            data['temp_min'], 
            data['temp_max'], 
            data.get('base_temp', 10)
        )
    
    elif computation_type == 'water_balance':
        return agri_compute.water_balance(
            data['rainfall'],
            data['evapotranspiration'],
            data.get('soil_capacity', 100)
        )
    
    elif computation_type == 'yield_prediction':
        if 'target_yields' in data:
            # Training mode
            return agri_compute.yield_prediction_ml(
                data['features'],
                data['target_yields']
            )
        else:
            # Prediction mode
            return agri_compute.yield_prediction_ml(
                data['features'],
                predict_features=data['predict_features']
            )
    
    elif computation_type == 'optimize_planting':
        return agri_compute.optimize_planting_date(
            data['temp_data'],
            data['rainfall_data'],
            data['crop_requirements']
        )
    
    elif computation_type == 'climate_risk':
        return agri_compute.climate_risk_assessment(
            data['historical_data'],
            data.get('climate_change_factor', 1.02)
        )
    
    else:
        raise ValueError(f"Unknown computation type: {computation_type}")

print("🌾 Agricultural Computing Environment Ready!")
`);
    
    console.log('✅ Agricultural computing environment setup complete');
  }

  // ==========================================
  // PYTHON COMPUTATION INTERFACE
  // ==========================================

  async computeGrowingDegreeDays(tempMin, tempMax, baseTemp = 10) {
    if (!this.isLoaded) {
      await this.loadPython();
    }
    
    const data = {
      type: 'gdd',
      temp_min: tempMin,
      temp_max: tempMax,
      base_temp: baseTemp
    };
    
    try {
      const result = this.pyodide.runPython(`
import json
result = compute_agricultural_metrics('${JSON.stringify(data)}')
json.dumps(result)
      `);
      
      return JSON.parse(result);
    } catch (error) {
      console.error('Python GDD calculation error:', error);
      throw error;
    }
  }

  async computeWaterBalance(rainfall, evapotranspiration, soilCapacity = 100) {
    if (!this.isLoaded) {
      await this.loadPython();
    }
    
    const data = {
      type: 'water_balance',
      rainfall,
      evapotranspiration,
      soil_capacity: soilCapacity
    };
    
    try {
      const result = this.pyodide.runPython(`
import json
result = compute_agricultural_metrics('${JSON.stringify(data)}')
json.dumps(result)
      `);
      
      return JSON.parse(result);
    } catch (error) {
      console.error('Python water balance calculation error:', error);
      throw error;
    }
  }

  async predictYieldML(features, targetYields = null, predictFeatures = null) {
    if (!this.isLoaded) {
      await this.loadPython();
    }
    
    const data = {
      type: 'yield_prediction',
      features,
      ...(targetYields && { target_yields: targetYields }),
      ...(predictFeatures && { predict_features: predictFeatures })
    };
    
    try {
      const result = this.pyodide.runPython(`
import json
result = compute_agricultural_metrics('${JSON.stringify(data)}')
json.dumps(result)
      `);
      
      return JSON.parse(result);
    } catch (error) {
      console.error('Python ML prediction error:', error);
      throw error;
    }
  }

  async optimizePlantingDate(tempData, rainfallData, cropRequirements) {
    if (!this.isLoaded) {
      await this.loadPython();
    }
    
    const data = {
      type: 'optimize_planting',
      temp_data: tempData,
      rainfall_data: rainfallData,
      crop_requirements: cropRequirements
    };
    
    try {
      const result = this.pyodide.runPython(`
import json
result = compute_agricultural_metrics('${JSON.stringify(data)}')
json.dumps(result)
      `);
      
      return JSON.parse(result);
    } catch (error) {
      console.error('Python planting optimization error:', error);
      throw error;
    }
  }

  async assessClimateRisk(historicalData, climateChangeFactor = 1.02) {
    if (!this.isLoaded) {
      await this.loadPython();
    }
    
    const data = {
      type: 'climate_risk',
      historical_data: historicalData,
      climate_change_factor: climateChangeFactor
    };
    
    try {
      const result = this.pyodide.runPython(`
import json
result = compute_agricultural_metrics('${JSON.stringify(data)}')
json.dumps(result)
      `);
      
      return JSON.parse(result);
    } catch (error) {
      console.error('Python climate risk assessment error:', error);
      throw error;
    }
  }

  // ==========================================
  // UI AND LOADING MANAGEMENT
  // ==========================================

  showLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'python-loading';
    indicator.className = 'python-loading-overlay';
    indicator.innerHTML = `
      <div class="loading-content">
        <div class="loading-header">
          <div class="python-logo">🐍</div>
          <h3>Loading Python Environment</h3>
          <p>Setting up advanced scientific computing...</p>
        </div>
        <div class="loading-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="progress-text">Initializing...</div>
        </div>
        <div class="loading-details">
          <p>This enables advanced features like:</p>
          <ul>
            <li>🧮 Scientific yield predictions</li>
            <li>📊 Machine learning models</li>
            <li>🌡️ Climate risk analysis</li>
            <li>💧 Water balance calculations</li>
          </ul>
        </div>
      </div>
    `;
    
    document.body.appendChild(indicator);
  }

  updateLoadingProgress(percent, message) {
    const indicator = document.getElementById('python-loading');
    if (!indicator) return;
    
    const progressFill = indicator.querySelector('.progress-fill');
    const progressText = indicator.querySelector('.progress-text');
    
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }
    
    if (progressText) {
      progressText.textContent = message;
    }
    
    this.loadingProgress = percent;
  }

  hideLoadingIndicator() {
    const indicator = document.getElementById('python-loading');
    if (indicator) {
      indicator.style.opacity = '0';
      setTimeout(() => indicator.remove(), 300);
    }
  }

  showError(message) {
    if (window.miniAgronomist?.showMessage) {
      window.miniAgronomist.showMessage(message, 'warning');
    } else {
      console.warn(message);
    }
  }

  // ==========================================
  // INTEGRATION HELPERS
  // ==========================================

  isReady() {
    return this.isLoaded && this.pyodide;
  }

  getLoadingProgress() {
    return this.loadingProgress;
  }

  // Enhanced prediction with Python backend
  async enhancedPrediction(predictionData) {
    if (!this.isReady()) {
      throw new Error('Python environment not ready');
    }
    
    const {
      temperature,
      rainfall,
      soilType,
      cropData,
      regionData
    } = predictionData;
    
    try {
      // Calculate advanced metrics using Python
      const gdd = await this.computeGrowingDegreeDays(
        temperature.min,
        temperature.max,
        cropData.baseTemp || 10
      );
      
      const waterBalance = await this.computeWaterBalance(
        rainfall,
        cropData.waterRequirement || 500
      );
      
      // Prepare features for ML prediction
      const features = [
        temperature.avg,
        rainfall,
        soilType.ph || 7,
        gdd,
        waterBalance.soil_moisture,
        regionData.elevation || 0
      ];
      
      // Use ML model if trained data is available
      let mlPrediction = null;
      if (this.hasTrainingData()) {
        mlPrediction = await this.predictYieldML(
          null, // features for training
          null, // target yields
          features // features to predict
        );
      }
      
      return {
        gdd: gdd,
        waterBalance: waterBalance,
        mlPrediction: mlPrediction,
        enhanced: true,
        computedBy: 'python'
      };
      
    } catch (error) {
      console.error('Enhanced prediction error:', error);
      throw error;
    }
  }

  hasTrainingData() {
    // Check if we have training data available
    // This would be expanded based on your data availability
    return false; // For now, return false
  }
}

// Initialize Python integration
let pythonIntegration;
document.addEventListener('DOMContentLoaded', () => {
  pythonIntegration = new PythonIntegration();
  window.pythonIntegration = pythonIntegration;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PythonIntegration;
}
