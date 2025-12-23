# Quick Start Guide - Enhanced Prediction Engine

## 🚀 Getting Started

### 1. Include Required Files

Add these scripts to your HTML:

```html
<!-- TensorFlow.js (for ML models) -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js"></script>

<!-- Prediction Engine Modules (ES6 Modules) -->
<script type="module">
  import AdvancedPredictionEngine from './js/advanced_prediction_engine.js';
  
  // Initialize the engine
  const predictionEngine = new AdvancedPredictionEngine();
  
  // Make it globally available
  window.predictionEngine = predictionEngine;
</script>
```

### 2. Basic Usage

```javascript
// Prepare your data
const formData = {
  region: 'southern_africa',
  crop: 'maize',
  soil: 'loam',
  rainfall: 550,
  plantingDate: new Date('2024-10-15')
};

// Load crop data (from your existing data files)
const cropRules = cropData[formData.region][formData.crop][formData.soil];
const cropProfile = cropProfiles[formData.crop];
const regionInfo = regionData[formData.region];

// Generate prediction
const prediction = await predictionEngine.generateAdvancedPrediction(
  formData,
  cropRules,
  cropProfile,
  regionInfo
);

// Use the prediction
console.log(`Predicted Yield: ${prediction.yieldEstimate} tons/ha`);
console.log(`Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
console.log(`Method: ${prediction.method}`);
console.log(`Tracking ID: ${prediction.trackingId}`);
```

### 3. Track Actual Results

```javascript
// When harvest results come in, record the actual yield
const actualYield = 5.5; // tons per hectare

predictionEngine.recordActualYield(
  prediction.trackingId,
  actualYield,
  {
    harvestDate: new Date(),
    weather: 'favorable',
    notes: 'Good growing season'
  }
);
```

### 4. Monitor Performance

```javascript
// Get performance report
const report = predictionEngine.getPerformanceReport();

console.log('Total Predictions:', report.totalPredictions);
console.log('Verified:', report.verifiedPredictions);
console.log('Model Accuracy:', report.modelAccuracy);

// Get specific model accuracy
const accuracy = predictionEngine.getModelAccuracy('neural_network');
console.log('Neural Network MAPE:', accuracy.mape.toFixed(2) + '%');
```

### 5. Save and Load Models

```javascript
// Save your trained models
await predictionEngine.saveModels();

// Models are automatically loaded on next initialization
// No need to retrain every time!
```

## 🔧 Advanced Features

### Feature Inspection

```javascript
// Access the Feature Store directly
const featureStore = predictionEngine.getFeatureStore();

// Get features for inspection
const features = await featureStore.getFeatures(
  formData,
  cropRules,
  cropProfile,
  regionInfo
);

console.log('Feature Count:', Object.keys(features).length);
console.log('Rainfall Score:', features.rainfall_score);
console.log('Timing Score:', features.timing_score);
console.log('Climate Match:', features.climate_match_score);

// Convert to array for ML models
const featureArray = featureStore.toArray(features);
console.log('Feature Array:', featureArray);
```

### Model Validation

```javascript
// Prepare test data
const testData = {
  X: [ /* your feature arrays */ ],
  y: [ /* actual yields */ ]
};

// Validate models
const validation = await predictionEngine.validateModels(testData);

console.log('Validation Results:');
validation.results.forEach(result => {
  console.log(`${result.modelName}:`);
  console.log(`  R² Score: ${result.metrics.r2.toFixed(4)}`);
  console.log(`  RMSE: ${result.metrics.rmse.toFixed(4)}`);
  console.log(`  MAE: ${result.metrics.mae.toFixed(4)}`);
});

// Compare models
const comparison = validation.comparison;
console.log('Best Model:', comparison[0].modelName);
```

### Custom Feature Engineering

```javascript
// Add custom feature rules
featureStore.featureValidator.addRule('custom_feature', {
  min: 0,
  max: 100,
  required: false
});

// Extend feature extraction
const customFeatures = {
  ...features,
  my_custom_metric: calculateCustomMetric(formData)
};
```

### Export/Import Data

```javascript
// Export prediction history
const monitorData = predictionEngine.getPredictionMonitor().exportData();

// Save to file or send to server
localStorage.setItem('prediction_backup', JSON.stringify(monitorData));

// Import data later
const backupData = JSON.parse(localStorage.getItem('prediction_backup'));
predictionEngine.getPredictionMonitor().importData(backupData);
```

## 🎯 Integration with Existing Code

### Update Your Existing Prediction Function

```javascript
// OLD CODE
async calculateEnhancedYield(cropRules, cropProfile, regionInfo, rainfall, plantingDate, region, crop) {
  const baseYield = (cropRules.yield_range[0] + cropRules.yield_range[1]) / 2;
  const rainfallFactor = this.calculateRainfallFactor(rainfall, cropProfile);
  return baseYield * rainfallFactor;
}

// NEW CODE - Just add this!
async calculateEnhancedYield(cropRules, cropProfile, regionInfo, rainfall, plantingDate, region, crop) {
  const formData = {
    region, crop, soil: this.currentSoil, rainfall, plantingDate
  };
  
  try {
    // Use the advanced engine
    if (window.predictionEngine) {
      const prediction = await window.predictionEngine.generateAdvancedPrediction(
        formData, cropRules, cropProfile, regionInfo
      );
      return {
        yieldEstimate: prediction.yieldEstimate,
        confidence: prediction.confidence,
        method: prediction.method
      };
    }
  } catch (error) {
    console.warn('Advanced prediction failed, using fallback:', error);
  }
  
  // Fallback to original method
  const baseYield = (cropRules.yield_range[0] + cropRules.yield_range[1]) / 2;
  const rainfallFactor = this.calculateRainfallFactor(rainfall, cropProfile);
  return { yieldEstimate: baseYield * rainfallFactor, confidence: 0.7 };
}
```

## 📊 Dashboard Integration

```html
<!-- Add to your dashboard -->
<div class="prediction-stats">
  <h3>Prediction Performance</h3>
  <div id="performance-metrics"></div>
  <button onclick="updatePerformanceMetrics()">Refresh Stats</button>
</div>

<script>
function updatePerformanceMetrics() {
  const report = predictionEngine.getPerformanceReport();
  const stats = predictionEngine.getPredictionMonitor().getStatistics();
  
  document.getElementById('performance-metrics').innerHTML = `
    <p>Total Predictions: ${stats.totalPredictions}</p>
    <p>Verified: ${stats.verifiedPredictions} (${stats.verificationRate})</p>
    <p>Average Error: ${stats.averageError}</p>
    <p>Best Model: ${stats.bestModel}</p>
  `;
}

// Update every 5 minutes
setInterval(updatePerformanceMetrics, 5 * 60 * 1000);
</script>
```

## 🧪 Testing Your Integration

1. **Open the Test Suite**
   ```bash
   # In your browser
   open test-suite-improvements.html
   ```

2. **Run All Tests**
   - Click "▶️ Run All Tests"
   - Verify all tests pass ✅

3. **Test Your Integration**
   ```javascript
   // Make a test prediction
   const testPrediction = await predictionEngine.generateAdvancedPrediction(
     testFormData,
     testCropRules,
     testCropProfile,
     testRegionInfo
   );
   
   console.log('Test Prediction:', testPrediction);
   // Should see: yieldEstimate, confidence, method, trackingId
   ```

## ⚠️ Troubleshooting

### Issue: TensorFlow.js not loading
```javascript
// Check if TF is loaded
if (typeof tf === 'undefined') {
  console.error('TensorFlow.js not loaded!');
  // Add script tag or check network
}
```

### Issue: Module import errors
```javascript
// Make sure using type="module"
<script type="module">
  import Engine from './js/advanced_prediction_engine.js';
</script>

// Or use dynamic import
const { default: Engine } = await import('./js/advanced_prediction_engine.js');
```

### Issue: Feature extraction fails
```javascript
// Check your data structure
console.log('FormData:', formData);
console.log('CropRules:', cropRules);
console.log('CropProfile:', cropProfile);
console.log('RegionInfo:', regionInfo);

// Make sure all required fields are present
```

### Issue: Predictions not being tracked
```javascript
// Verify monitor is initialized
const monitor = predictionEngine.getPredictionMonitor();
console.log('Monitor initialized:', !!monitor);
console.log('Predictions:', monitor.predictions.length);
```

## 📚 API Reference

### Main Engine Methods

```javascript
// Prediction
generateAdvancedPrediction(formData, cropRules, cropProfile, regionInfo)
generateOnlinePrediction(features, formData)
generateOfflinePrediction(features, formData)
generateFallbackPrediction(formData, cropRules, cropProfile, regionInfo, error)

// Monitoring
recordActualYield(trackingId, actualYield, additionalData)
getPerformanceReport()
getModelAccuracy(method)

// Model Management
saveModels()
validateModels(testData)

// Accessors
getFeatureStore()
getPredictionMonitor()
getModelValidator()
```

### Feature Store Methods

```javascript
getFeatures(formData, cropRules, cropProfile, regionInfo)
toArray(features, featureNames)
clearCache()
getCacheSize()
```

### Model Validator Methods

```javascript
validateModel(model, testData, modelName)
crossValidate(model, data, kFolds)
compareModels(modelNames)
generateReport(modelName)
```

### Prediction Monitor Methods

```javascript
trackPrediction(prediction, metadata)
recordActualYield(predictionId, actualYield, additionalData)
generatePerformanceReport()
getModelAccuracy(method)
getStatistics()
exportData()
importData(data)
```

## 🎓 Best Practices

1. **Always track predictions** for continuous improvement
2. **Record actual yields** whenever possible
3. **Save models regularly** to preserve training
4. **Monitor performance** and retrain if accuracy drops
5. **Use fallbacks** for graceful error handling
6. **Cache features** for better performance
7. **Validate models** before production deployment

## 🚀 Next Steps

1. ✅ Integrate with your existing form handlers
2. ✅ Add prediction tracking to your results display
3. ✅ Set up periodic model validation
4. ✅ Create a performance dashboard
5. ✅ Collect actual yield data for model improvement
6. ✅ Configure automated model saving
7. ✅ Set up monitoring alerts

---

**Need Help?** Check the comprehensive documentation in `PREDICTION_ENGINE_IMPROVEMENTS.md`

**Want to Contribute?** The codebase is modular and well-documented!
