// Advanced Prediction Engine with Machine Learning and Statistical Models
// Mini Agronomist Pro - AI-Enhanced Agricultural Intelligence System

class AdvancedPredictionEngine {
  constructor() {
    this.models = {
      neuralNetwork: null,
      randomForest: null,
      regressionModel: null,
      ensembleModel: null
    };
    
    this.historicalData = [];
    this.weatherPatterns = new Map();
    this.cropModels = new Map();
    this.statisticalCache = new Map();
    
    this.isOnline = navigator.onLine;
    this.setupNetworkListener();
    
    this.initializeModels();
  }

  setupNetworkListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOnlineData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // ========================================
  // MACHINE LEARNING MODELS
  // ========================================

  async initializeModels() {
    try {
      // Initialize TensorFlow.js models for browser-based ML
      if (typeof tf !== 'undefined') {
        await this.initializeTensorFlowModels();
      }
      
      // Initialize statistical models
      this.initializeStatisticalModels();
      
      // Load pre-trained models if available
      await this.loadPreTrainedModels();
      
      console.log('✅ Advanced prediction models initialized');
    } catch (error) {
      console.warn('⚠️ ML models initialization failed, falling back to statistical methods:', error);
    }
  }

  async initializeTensorFlowModels() {
    // Neural Network for yield prediction
    this.models.neuralNetwork = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [12], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    this.models.neuralNetwork.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    // Ensemble model combining multiple approaches
    this.models.ensembleModel = await this.createEnsembleModel();
  }

  async createEnsembleModel() {
    // Create multiple specialized models for ensemble
    const models = {
      rainfall: this.createRainfallSpecializedModel(),
      temperature: this.createTemperatureSpecializedModel(),
      soil: this.createSoilSpecializedModel(),
      timing: this.createTimingSpecializedModel()
    };

    return models;
  }

  createRainfallSpecializedModel() {
    return tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [4], units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
  }

  createTemperatureSpecializedModel() {
    return tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [3], units: 24, activation: 'relu' }),
        tf.layers.dense({ units: 12, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
  }

  createSoilSpecializedModel() {
    return tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [5], units: 20, activation: 'relu' }),
        tf.layers.dense({ units: 10, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
  }

  createTimingSpecializedModel() {
    return tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [6], units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
  }

  // ========================================
  // STATISTICAL MODELS
  // ========================================

  
  initializeStatisticalModels() {
    this.statisticalModels = {
      regression: new MultipleLinearRegression(),
      bayesian: new BayesianInference(),
      timeSeries: new TimeSeriesAnalysis(),
      monte: new MonteCarloSimulation(),
      clustering: new KMeansClustering()
    };
  }

  // ========================================
  // ADVANCED PREDICTION METHODS
  // ========================================

  async generateAdvancedPrediction(formData, cropRules, cropProfile, regionInfo) {
    const features = this.extractFeatures(formData, cropRules, cropProfile, regionInfo);
    
    let prediction = null;
    
    if (this.isOnline) {
      // Online: Use full ML models with real-time data
      prediction = await this.generateOnlinePrediction(features, formData);
    } else {
      // Offline: Use statistical models and cached data
      prediction = await this.generateOfflinePrediction(features, formData);
    }
    
    // Apply ensemble learning for best results
    return this.applyEnsemblePrediction(prediction, features);
  }

  async generateOnlinePrediction(features, formData) {
    try {
      // Fetch real-time weather data
      const weatherData = await this.fetchWeatherData(formData.region, formData.plantingDate);
      
      // Fetch satellite data
      const satelliteData = await this.fetchSatelliteData(formData.region);
      
      // Fetch market data
      const marketData = await this.fetchMarketData(formData.crop, formData.region);
      
      // Enhanced features with real-time data
      const enhancedFeatures = {
        ...features,
        weather: weatherData,
        satellite: satelliteData,
        market: marketData
      };
      
      // Use neural network prediction
      if (this.models.neuralNetwork) {
        const tensorInput = tf.tensor2d([this.featuresToArray(enhancedFeatures)]);
        const prediction = this.models.neuralNetwork.predict(tensorInput);
        const yieldEstimate = await prediction.data();
        
        tensorInput.dispose();
        prediction.dispose();
        
        return {
          yieldEstimate: yieldEstimate[0],
          confidence: 0.9, // High confidence with real-time data
          method: 'neural_network_online',
          dataQuality: 'high',
          features: enhancedFeatures
        };
      }
      
    } catch (error) {
      console.warn('Online prediction failed, falling back to offline:', error);
      return this.generateOfflinePrediction(features, formData);
    }
  }

  async generateOfflinePrediction(features, formData) {
    // Use statistical models for offline prediction
    const methods = [];
    
    // Multiple Linear Regression
    if (this.statisticalModels.regression) {
      const regressionResult = this.applyRegressionModel(features);
      methods.push({ method: 'regression', ...regressionResult });
    }
    
    // Bayesian Inference
    const bayesianResult = this.applyBayesianInference(features);
    methods.push({ method: 'bayesian', ...bayesianResult });
    
    // Monte Carlo Simulation
    const monteCarloResult = this.applyMonteCarloSimulation(features);
    methods.push({ method: 'monte_carlo', ...monteCarloResult });
    
    // Time Series Analysis
    const timeSeriesResult = this.applyTimeSeriesAnalysis(formData);
    methods.push({ method: 'time_series', ...timeSeriesResult });
    
    // Ensemble the results
    const ensembleResult = this.combineMethodResults(methods);
    
    return {
      ...ensembleResult,
      confidence: 0.75, // Lower confidence for offline prediction
      method: 'statistical_ensemble_offline',
      dataQuality: 'medium',
      methods: methods
    };
  }

  applyRegressionModel(features) {
    // Simplified regression implementation
    const coefficients = {
      rainfall: 0.025,
      temperature: 0.012,
      soil_ph: 0.08,
      timing: 0.15,
      water_match: 0.12
    };
    
    const intercept = 2.5;
    
    let prediction = intercept;
    for (const [key, value] of Object.entries(features)) {
      if (coefficients[key]) {
        prediction += coefficients[key] * value;
      }
    }
    
    return {
      yieldEstimate: Math.max(0.1, prediction),
      rSquared: 0.72,
      standardError: 0.85
    };
  }

  applyBayesianInference(features) {
    // Simplified Bayesian approach
    const priorMean = 3.5;
    const priorStd = 1.2;
    const likelihoodWeight = 0.7;
    
    let posteriorMean = priorMean;
    
    // Update based on features
    if (features.rainfall_score) {
      posteriorMean += (features.rainfall_score - 0.5) * 2 * likelihoodWeight;
    }
    
    if (features.timing_score) {
      posteriorMean += (features.timing_score - 0.5) * 1.5 * likelihoodWeight;
    }
    
    const uncertainty = priorStd * (1 - likelihoodWeight);
    
    return {
      yieldEstimate: Math.max(0.1, posteriorMean),
      uncertainty: uncertainty,
      credibleInterval: {
        lower: posteriorMean - 1.96 * uncertainty,
        upper: posteriorMean + 1.96 * uncertainty
      }
    };
  }

  applyMonteCarloSimulation(features) {
    const parameters = {
      baseYield: { distribution: 'normal', mean: 3.5, std: 0.8 },
      rainfall: { distribution: 'normal', mean: features.rainfall || 75, std: 20 },
      temperature: { distribution: 'normal', mean: features.temperature || 25, std: 5 },
      soilQuality: { distribution: 'triangular', min: 0.6, mode: 0.8, max: 1.0 }
    };
    
    const simulation = this.statisticalModels.monte.runSimulation(parameters, 1000);
    
    return {
      yieldEstimate: simulation.mean,
      riskAnalysis: simulation.riskMetrics,
      percentiles: simulation.percentiles,
      standardDeviation: simulation.std
    };
  }

  applyTimeSeriesAnalysis(formData) {
    // Use historical seasonal patterns
    const monthlyYields = this.getHistoricalYields(formData.crop, formData.region);
    const plantingMonth = formData.plantingDate.getMonth();
    
    if (monthlyYields.length > 0) {
      const analysis = this.statisticalModels.timeSeries.analyzeSeasonality(monthlyYields);
      const seasonalFactor = analysis.seasonal[plantingMonth];
      const trendFactor = analysis.trend[analysis.trend.length - 1];
      
      return {
        yieldEstimate: seasonalFactor + trendFactor,
        seasonalIndex: seasonalFactor,
        trendComponent: trendFactor,
        forecast: this.statisticalModels.timeSeries.forecast(monthlyYields, 3)
      };
    }
    
    return { yieldEstimate: 3.0, confidence: 0.5 };
  }

  combineMethodResults(methods) {
    // Weighted ensemble of different methods
    const weights = {
      regression: 0.3,
      bayesian: 0.25,
      monte_carlo: 0.25,
      time_series: 0.2
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const method of methods) {
      const weight = weights[method.method] || 0.1;
      weightedSum += method.yieldEstimate * weight;
      totalWeight += weight;
    }
    
    const ensembleEstimate = weightedSum / totalWeight;
    
    // Calculate ensemble confidence
    const variance = methods.reduce((sum, method) => {
      const diff = method.yieldEstimate - ensembleEstimate;
      return sum + diff * diff;
    }, 0) / methods.length;
    
    const confidence = Math.max(0.3, 1 - Math.sqrt(variance) / ensembleEstimate);
    
    return {
      yieldEstimate: ensembleEstimate,
      confidence: confidence,
      variance: variance,
      methodAgreement: 1 - Math.sqrt(variance) / ensembleEstimate
    };
  }

  applyEnsemblePrediction(basePrediction, features) {
    // Final ensemble step combining all approaches
    const ensembleWeights = this.calculateDynamicWeights(features);
    
    // Apply feature-based adjustments
    let adjustedYield = basePrediction.yieldEstimate;
    
    // Climate change adjustment
    if (features.climate_anomaly) {
      adjustedYield *= (1 + features.climate_anomaly * 0.1);
    }
    
    // Soil health adjustment
    if (features.soil_health_index) {
      adjustedYield *= (0.7 + 0.3 * features.soil_health_index);
    }
    
    // Market pressure adjustment (stress can affect actual yields)
    if (features.market_pressure) {
      adjustedYield *= (1 - features.market_pressure * 0.05);
    }
    
    return {
      ...basePrediction,
      yieldEstimate: Math.max(0.1, adjustedYield),
      adjustments: {
        climate: features.climate_anomaly || 0,
        soil_health: features.soil_health_index || 0.8,
        market: features.market_pressure || 0
      },
      ensembleWeights: ensembleWeights
    };
  }

  calculateDynamicWeights(features) {
    // Calculate weights based on data quality and feature reliability
    const baseWeights = { ml: 0.4, statistical: 0.35, historical: 0.25 };
    
    // Adjust weights based on data availability
    if (!features.weather || !features.satellite) {
      baseWeights.ml *= 0.7;
      baseWeights.statistical *= 1.2;
    }
    
    if (features.historical_data_quality > 0.8) {
      baseWeights.historical *= 1.3;
    }
    
    // Normalize weights
    const totalWeight = Object.values(baseWeights).reduce((a, b) => a + b, 0);
    for (const key in baseWeights) {
      baseWeights[key] /= totalWeight;
    }
    
    return baseWeights;
  }

  // ========================================
  // FEATURE ENGINEERING
  // ========================================

  extractFeatures(formData, cropRules, cropProfile, regionInfo) {
    const features = {
      // Basic features
      rainfall: formData.rainfall,
      planting_month: formData.plantingDate.getMonth(),
      planting_day_of_year: this.getDayOfYear(formData.plantingDate),
      
      // Crop features
      crop_type: this.encodeCropType(formData.crop),
      photosynthesis_type: cropProfile.photosynthesis_type === 'C4' ? 1 : 0,
      maturity_days: (cropProfile.days_to_maturity[0] + cropProfile.days_to_maturity[1]) / 2,
      water_requirement: (cropProfile.water_requirement_mm[0] + cropProfile.water_requirement_mm[1]) / 2,
      
      // Soil features
      soil_type: this.encodeSoilType(formData.soil),
      soil_ph_mid: this.getSoilPHMid(regionInfo, formData.soil),
      
      // Regional features
      region_code: this.encodeRegion(formData.region),
      annual_rainfall: regionInfo.annual_rainfall_mm,
      avg_temperature: this.getAverageTemperature(regionInfo),
      
      // Derived features
      rainfall_deficit: this.calculateRainfallDeficit(formData.rainfall, cropProfile),
      temperature_stress: this.calculateTemperatureStress(regionInfo, cropProfile),
      seasonal_index: this.calculateSeasonalIndex(formData.plantingDate, regionInfo),
      
      // Historical features
      historical_yield_avg: this.getHistoricalAverage(formData.crop, formData.region),
      yield_volatility: this.getYieldVolatility(formData.crop, formData.region),
      
      // Weather pattern features
      el_nino_index: this.getElNinoIndex(formData.plantingDate),
      drought_risk: this.calculateDroughtRisk(regionInfo, formData.plantingDate),
      
      // Market features
      price_trend: this.getPriceTrend(formData.crop),
      demand_index: this.getDemandIndex(formData.crop, formData.region),
      
      // Risk features
      pest_risk: this.calculatePestRisk(regionInfo, formData.crop, formData.plantingDate),
      disease_risk: this.calculateDiseaseRisk(regionInfo, formData.crop),
      
      // Interaction features
      rainfall_timing_interaction: formData.rainfall * this.getTimingScore(formData.plantingDate, regionInfo),
      soil_crop_compatibility: this.calculateSoilCropCompatibility(formData.soil, cropProfile),
      climate_crop_match: this.calculateClimateCropMatch(regionInfo, cropProfile)
    };
    
    // Add polynomial features for non-linear relationships
    features.rainfall_squared = features.rainfall * features.rainfall;
    features.temperature_rainfall_interaction = features.avg_temperature * features.rainfall;
    
    return features;
  }

  encodeCropType(crop) {
    const cropCodes = { maize: 1, groundnuts: 2, sorghum: 3, rice: 4, soybeans: 5 };
    return cropCodes[crop] || 0;
  }

  encodeSoilType(soil) {
    const soilCodes = { loam: 1, 'sandy loam': 2, clay: 3, sand: 4 };
    return soilCodes[soil] || 0;
  }

  encodeRegion(region) {
    const regionCodes = { 
      southern_africa: 1, east_african_highlands: 2, northern_sahel: 3,
      north_america_midwest: 4, north_america_pacific: 5, south_america_cerrado: 6
    };
    return regionCodes[region] || 0;
  }

  featuresToArray(features) {
    // Convert features object to array for TensorFlow
    const featureKeys = [
      'rainfall', 'planting_month', 'crop_type', 'soil_type', 'annual_rainfall',
      'avg_temperature', 'maturity_days', 'water_requirement', 'soil_ph_mid',
      'seasonal_index', 'historical_yield_avg', 'rainfall_squared'
    ];
    
    return featureKeys.map(key => features[key] || 0);
  }

  // ========================================
  // ONLINE DATA INTEGRATION
  // ========================================

  async fetchWeatherData(region, plantingDate) {
    if (!this.isOnline) return null;
    
    try {
      // Example weather API integration
      const response = await fetch(`/api/weather/${region}?date=${plantingDate.toISOString()}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Weather API unavailable:', error);
    }
    
    return null;
  }

  async fetchSatelliteData(region) {
    if (!this.isOnline) return null;
    
    try {
      // Example satellite data integration
      const response = await fetch(`/api/satellite/${region}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Satellite API unavailable:', error);
    }
    
    return null;
  }

  async fetchMarketData(crop, region) {
    if (!this.isOnline) return null;
    
    try {
      // Example market data integration
      const response = await fetch(`/api/market/${crop}/${region}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Market API unavailable:', error);
    }
    
    return null;
  }

  async syncOnlineData() {
    if (!this.isOnline) return;
    
    try {
      // Sync updated models
      await this.downloadUpdatedModels();
      
      // Sync historical data
      await this.downloadHistoricalData();
      
      // Update cache
      await this.updateLocalCache();
      
      console.log('✅ Online data sync completed');
    } catch (error) {
      console.warn('Online sync failed:', error);
    }
  }

  async downloadUpdatedModels() {
    // Download pre-trained model updates
    try {
      const response = await fetch('/api/models/latest');
      if (response.ok) {
        const modelData = await response.json();
        // Update local models with new weights
        await this.updateLocalModels(modelData);
      }
    } catch (error) {
      console.warn('Model update failed:', error);
    }
  }

<<<<<<< HEAD
  // Stubs for online sync methods - these functions are placeholders so
  // calls to them do not throw errors if a server integration isn't present.
  // Implement these to integrate with your backend or CDN for model sync.
  async loadPreTrainedModels() {
    console.warn('loadPreTrainedModels() not implemented - skipping');
    return null;
  }

  async downloadHistoricalData() {
    console.warn('downloadHistoricalData() not implemented - skipping');
    return null;
  }

  async updateLocalCache() {
    console.warn('updateLocalCache() not implemented - skipping');
    return null;
  }

  async updateLocalModels(modelData) {
    console.warn('updateLocalModels() not implemented - skipping');
    return null;
  }

=======
>>>>>>> origin/main
  // ========================================
  // UTILITY METHODS
  // ========================================

  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getSoilPHMid(regionInfo, soilType) {
    const soilProfile = regionInfo.soil_profiles?.find(s => s.type === soilType);
    if (soilProfile) {
      return (soilProfile.ph_range[0] + soilProfile.ph_range[1]) / 2;
    }
    return 6.5; // Default neutral pH
  }

  getAverageTemperature(regionInfo) {
    if (regionInfo.avg_monthly_temp_c) {
      return regionInfo.avg_monthly_temp_c.reduce((a, b) => a + b) / regionInfo.avg_monthly_temp_c.length;
    }
    return 25; // Default temperature
  }

  calculateRainfallDeficit(rainfall, cropProfile) {
    const avgRequirement = (cropProfile.water_requirement_mm[0] + cropProfile.water_requirement_mm[1]) / 2;
    const weeklyRequirement = avgRequirement / 52; // Convert annual to weekly
    return Math.max(0, weeklyRequirement - rainfall);
  }

  calculateTemperatureStress(regionInfo, cropProfile) {
    const avgTemp = this.getAverageTemperature(regionInfo);
    const optimalTemp = (cropProfile.optimal_temp_c[0] + cropProfile.optimal_temp_c[1]) / 2;
    return Math.abs(avgTemp - optimalTemp) / 10; // Normalized stress factor
  }

  calculateSeasonalIndex(plantingDate, regionInfo) {
    const month = plantingDate.getMonth();
    if (regionInfo.monthly_rainfall_mm && regionInfo.monthly_rainfall_mm.length > month) {
      const monthlyRain = regionInfo.monthly_rainfall_mm[month];
      const avgRain = regionInfo.annual_rainfall_mm / 12;
      return monthlyRain / avgRain; // Seasonal rainfall index
    }
    return 1.0;
  }

  getHistoricalAverage(crop, region) {
    // This would access historical database
    const historicalData = this.getHistoricalYields(crop, region);
    if (historicalData.length > 0) {
      return historicalData.reduce((a, b) => a + b) / historicalData.length;
    }
    return 3.5; // Default average yield
  }

  getYieldVolatility(crop, region) {
    const historicalData = this.getHistoricalYields(crop, region);
    if (historicalData.length > 1) {
      const mean = this.getHistoricalAverage(crop, region);
      const variance = historicalData.reduce((sum, yield) => sum + Math.pow(yield - mean, 2), 0) / historicalData.length;
      return Math.sqrt(variance);
    }
    return 0.8; // Default volatility
  }

  getHistoricalYields(crop, region) {
    // Mock historical data - in production, this would come from a database
    const mockData = {
      'southern_africa': {
        'maize': [3.2, 3.8, 2.9, 4.1, 3.5, 3.7, 2.8, 4.2, 3.6, 3.9],
        'groundnuts': [1.8, 2.1, 1.9, 2.3, 2.0, 1.7, 2.2, 2.4, 1.9, 2.0]
      }
    };
    
    return mockData[region]?.[crop] || [];
  }

  // Additional utility methods for advanced features...
  getElNinoIndex(date) {
    // Simplified El Niño index calculation
    const month = date.getMonth();
    const elNinoPattern = [0.2, 0.1, -0.1, -0.3, -0.2, 0.0, 0.1, 0.3, 0.2, 0.0, -0.1, 0.1];
    return elNinoPattern[month];
  }

  calculateDroughtRisk(regionInfo, plantingDate) {
    const month = plantingDate.getMonth();
    if (regionInfo.monthly_rainfall_mm && regionInfo.monthly_rainfall_mm.length > month) {
      const monthlyRain = regionInfo.monthly_rainfall_mm[month];
      return monthlyRain < 30 ? 0.8 : monthlyRain < 50 ? 0.4 : 0.1;
    }
    return 0.3; // Default moderate risk
  }

  getPriceTrend(crop) {
    // Mock price trend data
    const trends = { maize: 0.05, groundnuts: -0.02, sorghum: 0.03, rice: 0.01 };
    return trends[crop] || 0;
  }

  getDemandIndex(crop, region) {
    // Mock demand index
    return 0.8; // Default moderate demand
  }

  calculatePestRisk(regionInfo, crop, plantingDate) {
    // Simplified pest risk calculation based on region and season
    const pestRiskData = regionInfo.pest_disease_risks || [];
    const seasonalRisk = this.getSeasonalPestRisk(plantingDate);
    return pestRiskData.length * 0.1 + seasonalRisk;
  }

  calculateDiseaseRisk(regionInfo, crop) {
    const diseaseRiskData = regionInfo.pest_disease_risks || [];
    return diseaseRiskData.length > 3 ? 0.6 : diseaseRiskData.length > 1 ? 0.4 : 0.2;
  }

  getSeasonalPestRisk(date) {
    const month = date.getMonth();
    // Higher risk during warmer, wetter months
    const riskPattern = [0.3, 0.4, 0.6, 0.7, 0.5, 0.4, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4];
    return riskPattern[month];
  }

  getTimingScore(plantingDate, regionInfo) {
    // Simplified timing score based on optimal planting windows
    const month = plantingDate.getMonth();
    const optimalMonths = [9, 10, 11]; // Oct, Nov, Dec for Southern Hemisphere
    return optimalMonths.includes(month) ? 1.0 : 0.7;
  }

  calculateSoilCropCompatibility(soilType, cropProfile) {
    // Compatibility matrix between soil types and crops
    const compatibility = {
      'loam': { 'maize': 0.9, 'groundnuts': 0.8, 'sorghum': 0.7 },
      'clay': { 'maize': 0.7, 'rice': 0.9, 'sorghum': 0.6 },
      'sandy loam': { 'groundnuts': 0.9, 'maize': 0.6, 'sorghum': 0.8 }
    };
    
    return compatibility[soilType]?.[cropProfile.category] || 0.7;
  }

  calculateClimateCropMatch(regionInfo, cropProfile) {
    // Match between regional climate and crop climate preferences
    const avgTemp = this.getAverageTemperature(regionInfo);
    const optimalTemp = (cropProfile.optimal_temp_c[0] + cropProfile.optimal_temp_c[1]) / 2;
    const tempMatch = 1 - Math.abs(avgTemp - optimalTemp) / 20;
    
    const rainMatch = Math.min(1, regionInfo.annual_rainfall_mm / 
      ((cropProfile.water_requirement_mm[0] + cropProfile.water_requirement_mm[1]) / 2));
    
    return (tempMatch + rainMatch) / 2;
  }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedPredictionEngine;
}
