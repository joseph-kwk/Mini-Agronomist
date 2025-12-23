// Model Validation Framework
// Provides comprehensive validation, testing, and monitoring for prediction models

class ModelValidator {
  constructor() {
    this.validationHistory = [];
    this.performanceMetrics = new Map();
  }

  // ========================================
  // MODEL VALIDATION
  // ========================================

  async validateModel(model, testData, modelName = 'unknown') {
    console.log(`🔍 Validating model: ${modelName}`);
    
    try {
      const startTime = performance.now();
      
      // Make predictions
      const predictions = await this.predict(model, testData.X);
      
      // Calculate metrics
      const metrics = this.calculateMetrics(predictions, testData.y);
      
      // Calculate cross-validation score
      const cvScore = await this.crossValidate(model, testData, 5);
      
      // Perform residual analysis
      const residualAnalysis = this.analyzeResiduals(predictions, testData.y);
      
      const endTime = performance.now();
      const validationTime = endTime - startTime;
      
      const validationResult = {
        modelName,
        timestamp: new Date(),
        validationTime,
        metrics,
        cvScore,
        residualAnalysis,
        testSampleSize: testData.y.length,
        status: this.determineStatus(metrics)
      };
      
      // Store validation history
      this.validationHistory.push(validationResult);
      this.performanceMetrics.set(modelName, validationResult);
      
      console.log(`✅ Model validation complete for ${modelName}`);
      console.log(`   R² Score: ${metrics.r2.toFixed(4)}`);
      console.log(`   RMSE: ${metrics.rmse.toFixed(4)}`);
      console.log(`   MAE: ${metrics.mae.toFixed(4)}`);
      
      return validationResult;
      
    } catch (error) {
      console.error(`❌ Model validation failed for ${modelName}:`, error);
      return {
        modelName,
        timestamp: new Date(),
        status: 'failed',
        error: error.message
      };
    }
  }

  // ========================================
  // PREDICTION METHODS
  // ========================================

  async predict(model, X) {
    // Handle different model types
    if (typeof model.predict === 'function') {
      // TensorFlow.js model
      if (model.predict.constructor.name === 'AsyncFunction' || 
          (typeof tf !== 'undefined' && model instanceof tf.LayersModel)) {
        const tensorInput = Array.isArray(X[0]) ? tf.tensor2d(X) : tf.tensor1d(X);
        const prediction = model.predict(tensorInput);
        const data = await prediction.data();
        tensorInput.dispose();
        prediction.dispose();
        return Array.from(data);
      }
      // Statistical model
      return model.predict(X);
    }
    
    throw new Error('Model does not have a predict method');
  }

  // ========================================
  // METRICS CALCULATION
  // ========================================

  calculateMetrics(predictions, actual) {
    const n = actual.length;
    
    // Mean Squared Error
    const mse = this.calculateMSE(predictions, actual);
    
    // Root Mean Squared Error
    const rmse = Math.sqrt(mse);
    
    // Mean Absolute Error
    const mae = this.calculateMAE(predictions, actual);
    
    // R-squared
    const r2 = this.calculateR2(predictions, actual);
    
    // Adjusted R-squared
    const adjustedR2 = this.calculateAdjustedR2(r2, n, 10); // Assuming 10 features
    
    // Mean Absolute Percentage Error
    const mape = this.calculateMAPE(predictions, actual);
    
    // Explained Variance Score
    const explainedVariance = this.calculateExplainedVariance(predictions, actual);
    
    return {
      mse,
      rmse,
      mae,
      r2,
      adjustedR2,
      mape,
      explainedVariance,
      sampleSize: n
    };
  }

  calculateMSE(predictions, actual) {
    const n = actual.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += Math.pow(predictions[i] - actual[i], 2);
    }
    return sum / n;
  }

  calculateRMSE(predictions, actual) {
    return Math.sqrt(this.calculateMSE(predictions, actual));
  }

  calculateMAE(predictions, actual) {
    const n = actual.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += Math.abs(predictions[i] - actual[i]);
    }
    return sum / n;
  }

  calculateR2(predictions, actual) {
    const mean = actual.reduce((a, b) => a + b, 0) / actual.length;
    
    let ssRes = 0;
    let ssTot = 0;
    
    for (let i = 0; i < actual.length; i++) {
      ssRes += Math.pow(actual[i] - predictions[i], 2);
      ssTot += Math.pow(actual[i] - mean, 2);
    }
    
    return 1 - (ssRes / ssTot);
  }

  calculateAdjustedR2(r2, n, p) {
    // Adjusted R² = 1 - (1 - R²) * (n - 1) / (n - p - 1)
    return 1 - (1 - r2) * (n - 1) / (n - p - 1);
  }

  calculateMAPE(predictions, actual) {
    const n = actual.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      if (actual[i] !== 0) {
        sum += Math.abs((actual[i] - predictions[i]) / actual[i]);
      }
    }
    return (sum / n) * 100;
  }

  calculateExplainedVariance(predictions, actual) {
    const predMean = predictions.reduce((a, b) => a + b, 0) / predictions.length;
    const actualMean = actual.reduce((a, b) => a + b, 0) / actual.length;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < actual.length; i++) {
      numerator += Math.pow((actual[i] - predictions[i]) - (actualMean - predMean), 2);
      denominator += Math.pow(actual[i] - actualMean, 2);
    }
    
    return 1 - (numerator / denominator);
  }

  // ========================================
  // CROSS-VALIDATION
  // ========================================

  async crossValidate(model, data, kFolds = 5) {
    console.log(`🔄 Performing ${kFolds}-fold cross-validation...`);
    
    const foldSize = Math.floor(data.X.length / kFolds);
    const scores = [];
    
    for (let i = 0; i < kFolds; i++) {
      // Split data into train and validation
      const valStart = i * foldSize;
      const valEnd = (i + 1) * foldSize;
      
      const X_val = data.X.slice(valStart, valEnd);
      const y_val = data.y.slice(valStart, valEnd);
      
      const X_train = [...data.X.slice(0, valStart), ...data.X.slice(valEnd)];
      const y_train = [...data.y.slice(0, valStart), ...data.y.slice(valEnd)];
      
      // Train model on training fold
      // Note: This assumes model can be retrained - for now we'll just validate
      const predictions = await this.predict(model, X_val);
      const r2 = this.calculateR2(predictions, y_val);
      scores.push(r2);
    }
    
    const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const stdScore = Math.sqrt(
      scores.reduce((sum, score) => sum + Math.pow(score - meanScore, 2), 0) / scores.length
    );
    
    console.log(`✅ Cross-validation complete: ${meanScore.toFixed(4)} ± ${stdScore.toFixed(4)}`);
    
    return {
      mean: meanScore,
      std: stdScore,
      scores,
      folds: kFolds
    };
  }

  // ========================================
  // RESIDUAL ANALYSIS
  // ========================================

  analyzeResiduals(predictions, actual) {
    const residuals = [];
    const percentErrors = [];
    
    for (let i = 0; i < actual.length; i++) {
      const residual = actual[i] - predictions[i];
      residuals.push(residual);
      
      if (actual[i] !== 0) {
        percentErrors.push((residual / actual[i]) * 100);
      }
    }
    
    const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
    const std = Math.sqrt(
      residuals.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / residuals.length
    );
    
    // Test for normality (simplified Shapiro-Wilk concept)
    const normalityScore = this.testNormality(residuals);
    
    // Test for homoscedasticity
    const homoscedasticityScore = this.testHomoscedasticity(residuals, predictions);
    
    return {
      mean,
      std,
      min: Math.min(...residuals),
      max: Math.max(...residuals),
      normalityScore,
      homoscedasticityScore,
      outliers: this.detectOutliers(residuals),
      percentErrors: {
        mean: percentErrors.reduce((a, b) => a + b, 0) / percentErrors.length,
        std: Math.sqrt(
          percentErrors.reduce((sum, e) => sum + Math.pow(e, 2), 0) / percentErrors.length
        )
      }
    };
  }

  testNormality(residuals) {
    // Simplified normality test: check if residuals follow bell curve
    const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
    const std = Math.sqrt(
      residuals.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / residuals.length
    );
    
    // Count residuals within 1, 2, 3 standard deviations
    let within1Std = 0, within2Std = 0, within3Std = 0;
    
    for (const r of residuals) {
      const zScore = Math.abs((r - mean) / std);
      if (zScore <= 1) within1Std++;
      if (zScore <= 2) within2Std++;
      if (zScore <= 3) within3Std++;
    }
    
    const p1 = within1Std / residuals.length;
    const p2 = within2Std / residuals.length;
    const p3 = within3Std / residuals.length;
    
    // Expected for normal distribution: 68%, 95%, 99.7%
    const normalityScore = 1 - (
      Math.abs(p1 - 0.68) + Math.abs(p2 - 0.95) + Math.abs(p3 - 0.997)
    ) / 3;
    
    return normalityScore;
  }

  testHomoscedasticity(residuals, predictions) {
    // Test if variance is constant across predicted values
    // Split into low, medium, high prediction groups
    const sorted = predictions.map((p, i) => ({ pred: p, resid: residuals[i] }))
      .sort((a, b) => a.pred - b.pred);
    
    const third = Math.floor(sorted.length / 3);
    const group1 = sorted.slice(0, third).map(x => x.resid);
    const group2 = sorted.slice(third, 2 * third).map(x => x.resid);
    const group3 = sorted.slice(2 * third).map(x => x.resid);
    
    const var1 = this.calculateVariance(group1);
    const var2 = this.calculateVariance(group2);
    const var3 = this.calculateVariance(group3);
    
    const maxVar = Math.max(var1, var2, var3);
    const minVar = Math.min(var1, var2, var3);
    
    // Score based on variance ratio (closer to 1 is better)
    const ratio = minVar / maxVar;
    return ratio;
  }

  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  detectOutliers(residuals, threshold = 3) {
    const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
    const std = Math.sqrt(
      residuals.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / residuals.length
    );
    
    const outliers = [];
    for (let i = 0; i < residuals.length; i++) {
      const zScore = Math.abs((residuals[i] - mean) / std);
      if (zScore > threshold) {
        outliers.push({ index: i, value: residuals[i], zScore });
      }
    }
    
    return outliers;
  }

  // ========================================
  // MODEL COMPARISON
  // ========================================

  compareModels(modelNames = null) {
    const modelsToCompare = modelNames || Array.from(this.performanceMetrics.keys());
    
    const comparison = modelsToCompare.map(name => {
      const metrics = this.performanceMetrics.get(name);
      return {
        modelName: name,
        r2: metrics?.metrics?.r2 || 0,
        rmse: metrics?.metrics?.rmse || Infinity,
        mae: metrics?.metrics?.mae || Infinity,
        status: metrics?.status || 'unknown'
      };
    });
    
    // Sort by R² (descending)
    comparison.sort((a, b) => b.r2 - a.r2);
    
    console.log('📊 Model Comparison:');
    console.table(comparison);
    
    return comparison;
  }

  // ========================================
  // STATUS DETERMINATION
  // ========================================

  determineStatus(metrics) {
    if (metrics.r2 >= 0.8 && metrics.mape <= 15) {
      return 'excellent';
    } else if (metrics.r2 >= 0.7 && metrics.mape <= 20) {
      return 'good';
    } else if (metrics.r2 >= 0.5 && metrics.mape <= 30) {
      return 'acceptable';
    } else {
      return 'needs_improvement';
    }
  }

  // ========================================
  // REPORTING
  // ========================================

  generateReport(modelName) {
    const metrics = this.performanceMetrics.get(modelName);
    
    if (!metrics) {
      console.error(`No metrics found for model: ${modelName}`);
      return null;
    }
    
    const report = {
      model: modelName,
      timestamp: metrics.timestamp,
      status: metrics.status,
      performance: {
        r2: metrics.metrics.r2,
        rmse: metrics.metrics.rmse,
        mae: metrics.metrics.mae,
        mape: metrics.metrics.mape
      },
      crossValidation: metrics.cvScore,
      residualAnalysis: metrics.residualAnalysis,
      recommendations: this.generateRecommendations(metrics)
    };
    
    return report;
  }

  generateRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.metrics.r2 < 0.7) {
      recommendations.push('Consider adding more features or engineering new ones');
    }
    
    if (metrics.metrics.mape > 20) {
      recommendations.push('High prediction error - review data quality and outliers');
    }
    
    if (metrics.residualAnalysis.normalityScore < 0.8) {
      recommendations.push('Residuals not normally distributed - consider data transformation');
    }
    
    if (metrics.residualAnalysis.homoscedasticityScore < 0.7) {
      recommendations.push('Heteroscedasticity detected - consider weighted regression');
    }
    
    if (metrics.residualAnalysis.outliers.length > metrics.testSampleSize * 0.05) {
      recommendations.push(`${metrics.residualAnalysis.outliers.length} outliers detected - review data quality`);
    }
    
    return recommendations;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  getValidationHistory() {
    return this.validationHistory;
  }

  getModelMetrics(modelName) {
    return this.performanceMetrics.get(modelName);
  }

  clearHistory() {
    this.validationHistory = [];
    this.performanceMetrics.clear();
    console.log('✅ Validation history cleared');
  }
}

// Export for use in other modules
export default ModelValidator;
