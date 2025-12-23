// Feature Store - Centralized Feature Management
// Ensures consistent feature engineering across all prediction methods

class FeatureStore {
  constructor() {
    this.featureCache = new Map();
    this.featureScaler = new FeatureScaler();
    this.featureValidator = new FeatureValidator();
    this.featureHistory = [];
  }

  // ========================================
  // MAIN FEATURE EXTRACTION
  // ========================================

  async getFeatures(formData, cropRules, cropProfile, regionInfo) {
    const cacheKey = this.generateCacheKey(formData);
    
    // Check cache first
    if (this.featureCache.has(cacheKey)) {
      console.log('✅ Using cached features');
      return this.featureCache.get(cacheKey);
    }

    // Extract base features
    const baseFeatures = this.extractBaseFeatures(formData, cropRules, cropProfile, regionInfo);
    
    // Engineer advanced features
    const engineeredFeatures = this.engineerFeatures(baseFeatures, formData, cropProfile, regionInfo);
    
    // Validate features
    const validatedFeatures = this.featureValidator.validate(engineeredFeatures);
    
    // Scale features for ML models
    const scaledFeatures = this.featureScaler.transform(validatedFeatures);
    
    // Cache for future use
    this.featureCache.set(cacheKey, scaledFeatures);
    
    // Track feature history
    this.featureHistory.push({
      timestamp: new Date(),
      features: scaledFeatures,
      formData: formData
    });
    
    return scaledFeatures;
  }

  // ========================================
  // BASE FEATURE EXTRACTION
  // ========================================

  extractBaseFeatures(formData, cropRules, cropProfile, regionInfo) {
    return {
      // Temporal features
      planting_month: formData.plantingDate.getMonth(),
      planting_day_of_year: this.getDayOfYear(formData.plantingDate),
      planting_season: this.getSeasonCode(formData.plantingDate),
      
      // Crop features
      crop_type: formData.crop,
      crop_type_encoded: this.encodeCropType(formData.crop),
      photosynthesis_type: cropProfile.photosynthesis_type,
      photosynthesis_c4: cropProfile.photosynthesis_type === 'C4' ? 1 : 0,
      maturity_days_min: cropProfile.days_to_maturity[0],
      maturity_days_max: cropProfile.days_to_maturity[1],
      maturity_days_avg: (cropProfile.days_to_maturity[0] + cropProfile.days_to_maturity[1]) / 2,
      water_requirement_min: cropProfile.water_requirement_mm[0],
      water_requirement_max: cropProfile.water_requirement_mm[1],
      water_requirement_avg: (cropProfile.water_requirement_mm[0] + cropProfile.water_requirement_mm[1]) / 2,
      optimal_temp_min: cropProfile.optimal_temp_c[0],
      optimal_temp_max: cropProfile.optimal_temp_c[1],
      optimal_temp_avg: (cropProfile.optimal_temp_c[0] + cropProfile.optimal_temp_c[1]) / 2,
      
      // Soil features
      soil_type: formData.soil,
      soil_type_encoded: this.encodeSoilType(formData.soil),
      soil_ph_min: this.getSoilPHRange(regionInfo, formData.soil).min,
      soil_ph_max: this.getSoilPHRange(regionInfo, formData.soil).max,
      soil_ph_mid: this.getSoilPHRange(regionInfo, formData.soil).mid,
      
      // Climate features
      region: formData.region,
      region_encoded: this.encodeRegion(formData.region),
      annual_rainfall: regionInfo.annual_rainfall_mm,
      avg_temperature: this.getAverageTemperature(regionInfo),
      
      // Input features
      rainfall: formData.rainfall,
      
      // Yield expectations from rules
      yield_min: cropRules.yield_range[0],
      yield_max: cropRules.yield_range[1],
      yield_avg: (cropRules.yield_range[0] + cropRules.yield_range[1]) / 2
    };
  }

  // ========================================
  // FEATURE ENGINEERING
  // ========================================

  engineerFeatures(baseFeatures, formData, cropProfile, regionInfo) {
    const engineered = { ...baseFeatures };

    // Polynomial features
    engineered.rainfall_squared = Math.pow(baseFeatures.rainfall, 2);
    engineered.rainfall_cubed = Math.pow(baseFeatures.rainfall, 3);
    engineered.temperature_squared = Math.pow(baseFeatures.avg_temperature, 2);

    // Interaction features
    engineered.rainfall_temperature = baseFeatures.rainfall * baseFeatures.avg_temperature;
    engineered.rainfall_soil_ph = baseFeatures.rainfall * baseFeatures.soil_ph_mid;
    engineered.temperature_soil_ph = baseFeatures.avg_temperature * baseFeatures.soil_ph_mid;

    // Ratio features
    engineered.water_match_ratio = baseFeatures.rainfall / baseFeatures.water_requirement_avg;
    engineered.rainfall_annual_ratio = baseFeatures.rainfall / baseFeatures.annual_rainfall;
    engineered.temp_optimal_distance = Math.abs(baseFeatures.avg_temperature - baseFeatures.optimal_temp_avg);

    // Score features
    engineered.rainfall_score = this.calculateRainfallScore(
      baseFeatures.rainfall, 
      baseFeatures.water_requirement_min, 
      baseFeatures.water_requirement_max
    );
    
    engineered.timing_score = this.calculateTimingScore(
      formData.plantingDate, 
      regionInfo
    );
    
    engineered.soil_compatibility_score = this.calculateSoilCompatibility(
      baseFeatures.soil_type, 
      cropProfile
    );
    
    engineered.climate_match_score = this.calculateClimateMatch(
      regionInfo, 
      cropProfile
    );

    // Seasonal features
    engineered.seasonal_index = this.calculateSeasonalIndex(
      formData.plantingDate, 
      regionInfo
    );
    
    engineered.seasonal_rainfall = this.getSeasonalRainfall(
      formData.plantingDate.getMonth(), 
      regionInfo
    );

    // Historical features
    engineered.historical_yield_avg = this.getHistoricalAverage(
      formData.crop, 
      formData.region
    );
    
    engineered.yield_volatility = this.getYieldVolatility(
      formData.crop, 
      formData.region
    );

    // Risk features
    engineered.drought_risk = this.calculateDroughtRisk(
      regionInfo, 
      formData.plantingDate
    );
    
    engineered.pest_risk = this.calculatePestRisk(
      regionInfo, 
      formData.crop, 
      formData.plantingDate
    );
    
    engineered.disease_risk = this.calculateDiseaseRisk(
      regionInfo, 
      formData.crop
    );

    // Climate features
    engineered.el_nino_index = this.getElNinoIndex(formData.plantingDate);
    engineered.climate_anomaly = 0; // Placeholder for real-time climate data

    // Soil health
    engineered.soil_health_index = this.calculateSoilHealthIndex(
      baseFeatures.soil_type, 
      baseFeatures.soil_ph_mid
    );

    // Market features
    engineered.price_trend = this.getPriceTrend(formData.crop);
    engineered.demand_index = this.getDemandIndex(formData.crop, formData.region);
    engineered.market_pressure = 0; // Placeholder for real-time market data

    return engineered;
  }

  // ========================================
  // FEATURE CALCULATION METHODS
  // ========================================

  calculateRainfallScore(rainfall, minRequired, maxRequired) {
    if (rainfall < minRequired) {
      return Math.max(0, rainfall / minRequired);
    } else if (rainfall > maxRequired) {
      return Math.max(0, 1 - (rainfall - maxRequired) / maxRequired);
    }
    return 1.0;
  }

  calculateTimingScore(plantingDate, regionInfo) {
    const month = plantingDate.getMonth();
    const optimalMonths = [9, 10, 11]; // Oct, Nov, Dec for Southern Hemisphere
    return optimalMonths.includes(month) ? 1.0 : 0.7;
  }

  calculateSoilCompatibility(soilType, cropProfile) {
    const compatibility = {
      'loam': { 'cereal': 0.9, 'legume': 0.85, 'vegetable': 0.8 },
      'clay': { 'cereal': 0.7, 'legume': 0.65, 'vegetable': 0.9 },
      'sandy loam': { 'cereal': 0.75, 'legume': 0.9, 'vegetable': 0.7 }
    };
    return compatibility[soilType]?.[cropProfile.category] || 0.7;
  }

  calculateClimateMatch(regionInfo, cropProfile) {
    const avgTemp = this.getAverageTemperature(regionInfo);
    const optimalTemp = (cropProfile.optimal_temp_c[0] + cropProfile.optimal_temp_c[1]) / 2;
    const tempMatch = 1 - Math.abs(avgTemp - optimalTemp) / 20;
    
    const rainMatch = Math.min(1, regionInfo.annual_rainfall_mm / 
      ((cropProfile.water_requirement_mm[0] + cropProfile.water_requirement_mm[1]) / 2));
    
    return (tempMatch + rainMatch) / 2;
  }

  calculateSeasonalIndex(plantingDate, regionInfo) {
    const month = plantingDate.getMonth();
    if (regionInfo.monthly_rainfall_mm && regionInfo.monthly_rainfall_mm[month]) {
      return regionInfo.monthly_rainfall_mm[month] / (regionInfo.annual_rainfall_mm / 12);
    }
    return 1.0;
  }

  getSeasonalRainfall(month, regionInfo) {
    return regionInfo.monthly_rainfall_mm?.[month] || regionInfo.annual_rainfall_mm / 12;
  }

  calculateDroughtRisk(regionInfo, plantingDate) {
    const month = plantingDate.getMonth();
    if (regionInfo.monthly_rainfall_mm && regionInfo.monthly_rainfall_mm.length > month) {
      const monthlyRain = regionInfo.monthly_rainfall_mm[month];
      return monthlyRain < 30 ? 0.8 : monthlyRain < 50 ? 0.4 : 0.1;
    }
    return 0.3;
  }

  calculatePestRisk(regionInfo, crop, plantingDate) {
    const pestRiskData = regionInfo.pest_disease_risks || [];
    const seasonalRisk = this.getSeasonalPestRisk(plantingDate);
    return Math.min(1.0, pestRiskData.length * 0.1 + seasonalRisk);
  }

  calculateDiseaseRisk(regionInfo, crop) {
    const diseaseRiskData = regionInfo.pest_disease_risks || [];
    return diseaseRiskData.length > 3 ? 0.6 : diseaseRiskData.length > 1 ? 0.4 : 0.2;
  }

  getSeasonalPestRisk(date) {
    const month = date.getMonth();
    const riskPattern = [0.3, 0.4, 0.6, 0.7, 0.5, 0.4, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4];
    return riskPattern[month];
  }

  calculateSoilHealthIndex(soilType, soilPH) {
    const optimalPH = { 'loam': 6.5, 'clay': 7.0, 'sandy loam': 6.0 };
    const optimal = optimalPH[soilType] || 6.5;
    return Math.max(0.5, 1 - Math.abs(soilPH - optimal) / 3);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  encodeCropType(crop) {
    const cropCodes = { 
      maize: 1, groundnuts: 2, sorghum: 3, rice: 4, 
      soybeans: 5, wheat: 6, cotton: 7, beans: 8 
    };
    return cropCodes[crop] || 0;
  }

  encodeSoilType(soil) {
    const soilCodes = { 
      loam: 1, 'sandy loam': 2, clay: 3, sand: 4, 
      'clay loam': 5, 'silty loam': 6 
    };
    return soilCodes[soil] || 0;
  }

  encodeRegion(region) {
    const regionCodes = { 
      southern_africa: 1, east_african_highlands: 2, northern_sahel: 3,
      north_america_midwest: 4, north_america_pacific: 5, south_america_cerrado: 6
    };
    return regionCodes[region] || 0;
  }

  getSeasonCode(date) {
    const month = date.getMonth();
    // Southern Hemisphere seasons
    if (month >= 9 || month <= 2) return 1; // Spring/Summer
    if (month >= 3 && month <= 5) return 2; // Autumn
    return 3; // Winter
  }

  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getSoilPHRange(regionInfo, soilType) {
    const soilProfile = regionInfo.soil_profiles?.find(s => s.type === soilType);
    if (soilProfile) {
      return {
        min: soilProfile.ph_range[0],
        max: soilProfile.ph_range[1],
        mid: (soilProfile.ph_range[0] + soilProfile.ph_range[1]) / 2
      };
    }
    return { min: 5.5, max: 7.5, mid: 6.5 };
  }

  getAverageTemperature(regionInfo) {
    if (regionInfo.avg_monthly_temp_c) {
      return regionInfo.avg_monthly_temp_c.reduce((a, b) => a + b) / regionInfo.avg_monthly_temp_c.length;
    }
    return 25;
  }

  getHistoricalAverage(crop, region) {
    const historicalData = this.getHistoricalYields(crop, region);
    if (historicalData.length > 0) {
      return historicalData.reduce((a, b) => a + b) / historicalData.length;
    }
    return 3.5;
  }

  getYieldVolatility(crop, region) {
    const historicalData = this.getHistoricalYields(crop, region);
    if (historicalData.length > 1) {
      const mean = this.getHistoricalAverage(crop, region);
      const variance = historicalData.reduce((sum, yield) => 
        sum + Math.pow(yield - mean, 2), 0) / historicalData.length;
      return Math.sqrt(variance);
    }
    return 0.8;
  }

  getHistoricalYields(crop, region) {
    const mockData = {
      'southern_africa': {
        'maize': [3.2, 3.8, 2.9, 4.1, 3.5, 3.7, 2.8, 4.2, 3.6, 3.9],
        'groundnuts': [1.8, 2.1, 1.9, 2.3, 2.0, 1.7, 2.2, 2.4, 1.9, 2.0],
        'sorghum': [2.5, 2.8, 2.3, 3.0, 2.7, 2.6, 2.4, 2.9, 2.5, 2.7]
      }
    };
    return mockData[region]?.[crop] || [];
  }

  getElNinoIndex(date) {
    const month = date.getMonth();
    const elNinoPattern = [0.2, 0.1, -0.1, -0.3, -0.2, 0.0, 0.1, 0.3, 0.2, 0.0, -0.1, 0.1];
    return elNinoPattern[month];
  }

  getPriceTrend(crop) {
    const trends = { 
      maize: 0.05, groundnuts: -0.02, sorghum: 0.03, 
      rice: 0.01, soybeans: 0.04, wheat: 0.02 
    };
    return trends[crop] || 0;
  }

  getDemandIndex(crop, region) {
    return 0.8; // Default moderate demand
  }

  // ========================================
  // CACHE MANAGEMENT
  // ========================================

  generateCacheKey(formData) {
    return `${formData.region}_${formData.crop}_${formData.soil}_${formData.rainfall}_${formData.plantingDate.toISOString()}`;
  }

  clearCache() {
    this.featureCache.clear();
    console.log('✅ Feature cache cleared');
  }

  getCacheSize() {
    return this.featureCache.size;
  }

  // ========================================
  // FEATURE ARRAY CONVERSION
  // ========================================

  toArray(features, featureNames = null) {
    const defaultFeatures = [
      'crop_type_encoded', 'region_encoded', 'soil_type_encoded',
      'rainfall', 'rainfall_squared', 'planting_month',
      'maturity_days_avg', 'water_requirement_avg', 'soil_ph_mid',
      'avg_temperature', 'seasonal_index', 'historical_yield_avg',
      'timing_score', 'rainfall_score', 'climate_match_score',
      'drought_risk', 'pest_risk', 'soil_health_index'
    ];

    const names = featureNames || defaultFeatures;
    return names.map(name => features[name] || 0);
  }
}

// ========================================
// FEATURE SCALER
// ========================================

class FeatureScaler {
  constructor() {
    this.scalers = new Map();
    this.fitted = false;
  }

  fit(features) {
    // Calculate mean and std for each numeric feature
    for (const [key, value] of Object.entries(features)) {
      if (typeof value === 'number') {
        if (!this.scalers.has(key)) {
          this.scalers.set(key, { mean: value, std: 1, min: value, max: value, count: 1, sum: value, sumSq: value * value });
        } else {
          const scaler = this.scalers.get(key);
          scaler.count += 1;
          scaler.sum += value;
          scaler.sumSq += value * value;
          scaler.min = Math.min(scaler.min, value);
          scaler.max = Math.max(scaler.max, value);
          scaler.mean = scaler.sum / scaler.count;
          scaler.std = Math.sqrt((scaler.sumSq / scaler.count) - (scaler.mean * scaler.mean));
        }
      }
    }
    this.fitted = true;
    return this;
  }

  transform(features) {
    // For now, return normalized features (0-1 scaling)
    const scaled = { ...features };
    
    for (const [key, value] of Object.entries(features)) {
      if (typeof value === 'number' && this.scalers.has(key)) {
        const scaler = this.scalers.get(key);
        // Min-max scaling
        if (scaler.max > scaler.min) {
          scaled[key] = (value - scaler.min) / (scaler.max - scaler.min);
        }
      }
    }
    
    return scaled;
  }

  fitTransform(features) {
    this.fit(features);
    return this.transform(features);
  }
}

// ========================================
// FEATURE VALIDATOR
// ========================================

class FeatureValidator {
  constructor() {
    this.validationRules = this.defineValidationRules();
  }

  defineValidationRules() {
    return {
      rainfall: { min: 0, max: 2000, required: true },
      temperature: { min: -10, max: 50, required: false },
      soil_ph_mid: { min: 3, max: 10, required: false },
      planting_month: { min: 0, max: 11, required: true },
      maturity_days_avg: { min: 30, max: 365, required: false }
    };
  }

  validate(features) {
    const validated = { ...features };
    const warnings = [];

    for (const [key, rule] of Object.entries(this.validationRules)) {
      if (key in features) {
        const value = features[key];
        
        // Check min/max bounds
        if (rule.min !== undefined && value < rule.min) {
          warnings.push(`${key} (${value}) below minimum (${rule.min})`);
          validated[key] = rule.min;
        }
        
        if (rule.max !== undefined && value > rule.max) {
          warnings.push(`${key} (${value}) above maximum (${rule.max})`);
          validated[key] = rule.max;
        }
      } else if (rule.required) {
        warnings.push(`Required feature '${key}' is missing`);
      }
    }

    if (warnings.length > 0) {
      console.warn('⚠️ Feature validation warnings:', warnings);
    }

    return validated;
  }

  addRule(featureName, rule) {
    this.validationRules[featureName] = rule;
  }
}

// Export for use in other modules
export { FeatureStore, FeatureScaler, FeatureValidator };
export default FeatureStore;
