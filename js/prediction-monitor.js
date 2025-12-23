// Prediction Monitoring and Tracking System
// Tracks prediction accuracy, model performance, and provides feedback loops

class PredictionMonitor {
  constructor() {
    this.predictions = [];
    this.actualResults = [];
    this.performanceHistory = [];
    this.modelAccuracy = new Map();
    this.errorAnalysis = new Map();
    
    this.loadFromStorage();
  }

  // ========================================
  // PREDICTION TRACKING
  // ========================================

  trackPrediction(prediction, metadata = {}) {
    const predictionRecord = {
      id: this.generatePredictionId(),
      timestamp: new Date(),
      prediction: prediction.yieldEstimate,
      confidence: prediction.confidence,
      method: prediction.method,
      features: prediction.features,
      inputs: metadata.inputs,
      cropType: metadata.crop,
      region: metadata.region,
      season: metadata.season,
      verified: false
    };

    this.predictions.push(predictionRecord);
    this.saveToStorage();
    
    console.log(`📊 Prediction tracked: ID ${predictionRecord.id}`);
    return predictionRecord.id;
  }

  // ========================================
  // ACTUAL RESULTS TRACKING
  // ========================================

  recordActualYield(predictionId, actualYield, additionalData = {}) {
    const predictionIndex = this.predictions.findIndex(p => p.id === predictionId);
    
    if (predictionIndex === -1) {
      console.error(`Prediction ID ${predictionId} not found`);
      return null;
    }

    const prediction = this.predictions[predictionIndex];
    const error = Math.abs(prediction.prediction - actualYield);
    const percentError = (error / actualYield) * 100;

    const actualRecord = {
      predictionId,
      actualYield,
      predictedYield: prediction.prediction,
      error,
      percentError,
      method: prediction.method,
      timestamp: new Date(),
      ...additionalData
    };

    this.actualResults.push(actualRecord);
    this.predictions[predictionIndex].verified = true;
    this.predictions[predictionIndex].actualYield = actualYield;

    // Update model accuracy
    this.updateModelAccuracy(prediction.method, error, percentError);

    // Analyze errors
    this.analyzeError(actualRecord);

    this.saveToStorage();
    
    console.log(`✅ Actual yield recorded for prediction ${predictionId}`);
    console.log(`   Predicted: ${prediction.prediction.toFixed(2)}, Actual: ${actualYield.toFixed(2)}`);
    console.log(`   Error: ${error.toFixed(2)} (${percentError.toFixed(1)}%)`);

    return actualRecord;
  }

  // ========================================
  // MODEL ACCURACY TRACKING
  // ========================================

  updateModelAccuracy(method, error, percentError) {
    if (!this.modelAccuracy.has(method)) {
      this.modelAccuracy.set(method, {
        method,
        count: 0,
        totalError: 0,
        totalPercentError: 0,
        errors: [],
        rmse: 0,
        mae: 0,
        mape: 0
      });
    }

    const accuracy = this.modelAccuracy.get(method);
    accuracy.count += 1;
    accuracy.totalError += error;
    accuracy.totalPercentError += percentError;
    accuracy.errors.push(error);

    // Calculate metrics
    accuracy.mae = accuracy.totalError / accuracy.count;
    accuracy.mape = accuracy.totalPercentError / accuracy.count;
    accuracy.rmse = Math.sqrt(
      accuracy.errors.reduce((sum, e) => sum + e * e, 0) / accuracy.count
    );

    this.modelAccuracy.set(method, accuracy);
  }

  getModelAccuracy(method = null) {
    if (method) {
      return this.modelAccuracy.get(method);
    }
    return Array.from(this.modelAccuracy.values());
  }

  // ========================================
  // ERROR ANALYSIS
  // ========================================

  analyzeError(actualRecord) {
    const errorCategory = this.categorizeError(actualRecord.percentError);
    
    if (!this.errorAnalysis.has(errorCategory)) {
      this.errorAnalysis.set(errorCategory, {
        category: errorCategory,
        count: 0,
        records: []
      });
    }

    const analysis = this.errorAnalysis.get(errorCategory);
    analysis.count += 1;
    analysis.records.push(actualRecord);
    
    this.errorAnalysis.set(errorCategory, analysis);

    // Identify patterns
    if (actualRecord.percentError > 30) {
      this.flagHighError(actualRecord);
    }
  }

  categorizeError(percentError) {
    if (percentError <= 5) return 'excellent';
    if (percentError <= 10) return 'good';
    if (percentError <= 20) return 'acceptable';
    if (percentError <= 30) return 'poor';
    return 'very_poor';
  }

  flagHighError(record) {
    console.warn(`⚠️ High prediction error detected:`);
    console.warn(`   Prediction ID: ${record.predictionId}`);
    console.warn(`   Predicted: ${record.predictedYield}, Actual: ${record.actualYield}`);
    console.warn(`   Error: ${record.percentError.toFixed(1)}%`);
    
    // Store for further analysis
    if (!this.highErrorFlags) {
      this.highErrorFlags = [];
    }
    this.highErrorFlags.push(record);
  }

  // ========================================
  // PERFORMANCE ANALYSIS
  // ========================================

  generatePerformanceReport() {
    const report = {
      timestamp: new Date(),
      totalPredictions: this.predictions.length,
      verifiedPredictions: this.predictions.filter(p => p.verified).length,
      modelAccuracy: this.getModelAccuracyReport(),
      errorDistribution: this.getErrorDistribution(),
      trends: this.analyzeTrends(),
      recommendations: this.generateRecommendations()
    };

    this.performanceHistory.push(report);
    return report;
  }

  getModelAccuracyReport() {
    const report = {};
    
    for (const [method, accuracy] of this.modelAccuracy) {
      report[method] = {
        predictions: accuracy.count,
        mae: accuracy.mae.toFixed(2),
        rmse: accuracy.rmse.toFixed(2),
        mape: accuracy.mape.toFixed(2) + '%',
        rating: this.rateAccuracy(accuracy.mape)
      };
    }

    return report;
  }

  rateAccuracy(mape) {
    if (mape <= 10) return 'Excellent';
    if (mape <= 20) return 'Good';
    if (mape <= 30) return 'Acceptable';
    return 'Needs Improvement';
  }

  getErrorDistribution() {
    const distribution = {};
    
    for (const [category, analysis] of this.errorAnalysis) {
      distribution[category] = {
        count: analysis.count,
        percentage: (analysis.count / this.actualResults.length * 100).toFixed(1) + '%'
      };
    }

    return distribution;
  }

  analyzeTrends() {
    if (this.actualResults.length < 5) {
      return { status: 'insufficient_data', message: 'Need more verified predictions for trend analysis' };
    }

    // Analyze recent predictions
    const recent = this.actualResults.slice(-10);
    const recentErrors = recent.map(r => r.percentError);
    const avgRecentError = recentErrors.reduce((a, b) => a + b, 0) / recentErrors.length;

    // Compare with older predictions
    const older = this.actualResults.slice(0, Math.max(1, this.actualResults.length - 10));
    const olderErrors = older.map(r => r.percentError);
    const avgOlderError = olderErrors.reduce((a, b) => a + b, 0) / olderErrors.length;

    const improvement = avgOlderError - avgRecentError;
    
    return {
      recentAvgError: avgRecentError.toFixed(2) + '%',
      olderAvgError: avgOlderError.toFixed(2) + '%',
      improvement: improvement.toFixed(2) + '%',
      trend: improvement > 0 ? 'improving' : 'declining',
      status: avgRecentError < 15 ? 'good' : 'needs_attention'
    };
  }

  generateRecommendations() {
    const recommendations = [];

    // Analyze model performance
    for (const [method, accuracy] of this.modelAccuracy) {
      if (accuracy.mape > 25) {
        recommendations.push({
          type: 'model_improvement',
          method,
          message: `${method} model has high error (${accuracy.mape.toFixed(1)}%) - consider retraining or tuning`
        });
      }
    }

    // Check verification rate
    const verificationRate = this.predictions.filter(p => p.verified).length / this.predictions.length;
    if (verificationRate < 0.3) {
      recommendations.push({
        type: 'data_collection',
        message: `Low verification rate (${(verificationRate * 100).toFixed(1)}%) - collect more actual yield data`
      });
    }

    // Check error patterns
    const highErrorCount = this.highErrorFlags?.length || 0;
    if (highErrorCount > 5) {
      recommendations.push({
        type: 'error_investigation',
        message: `${highErrorCount} high-error cases detected - investigate common patterns`
      });
    }

    return recommendations;
  }

  // ========================================
  // COMPARISON AND INSIGHTS
  // ========================================

  compareMethodPerformance() {
    const methods = Array.from(this.modelAccuracy.values());
    
    if (methods.length === 0) {
      return { status: 'no_data', message: 'No verified predictions available' };
    }

    methods.sort((a, b) => a.mape - b.mape);

    console.log('📊 Method Performance Comparison:');
    console.table(methods.map(m => ({
      Method: m.method,
      Predictions: m.count,
      MAE: m.mae.toFixed(2),
      RMSE: m.rmse.toFixed(2),
      MAPE: m.mape.toFixed(2) + '%',
      Rating: this.rateAccuracy(m.mape)
    })));

    return {
      bestMethod: methods[0],
      worstMethod: methods[methods.length - 1],
      allMethods: methods
    };
  }

  getBestModel() {
    const methods = Array.from(this.modelAccuracy.values());
    if (methods.length === 0) return null;
    
    methods.sort((a, b) => a.mape - b.mape);
    return methods[0];
  }

  // ========================================
  // PREDICTION INSIGHTS
  // ========================================

  getPredictionInsights(predictionId) {
    const prediction = this.predictions.find(p => p.id === predictionId);
    if (!prediction) return null;

    const actualRecord = this.actualResults.find(r => r.predictionId === predictionId);
    
    const insights = {
      prediction: prediction.prediction,
      confidence: prediction.confidence,
      method: prediction.method,
      verified: prediction.verified
    };

    if (actualRecord) {
      insights.actual = actualRecord.actualYield;
      insights.error = actualRecord.error;
      insights.percentError = actualRecord.percentError;
      insights.accuracy = 100 - actualRecord.percentError;
      insights.rating = this.categorizeError(actualRecord.percentError);
    }

    return insights;
  }

  // ========================================
  // DATA MANAGEMENT
  // ========================================

  generatePredictionId() {
    return `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  exportData() {
    return {
      predictions: this.predictions,
      actualResults: this.actualResults,
      modelAccuracy: Array.from(this.modelAccuracy.entries()),
      errorAnalysis: Array.from(this.errorAnalysis.entries()),
      performanceHistory: this.performanceHistory,
      exportDate: new Date()
    };
  }

  importData(data) {
    this.predictions = data.predictions || [];
    this.actualResults = data.actualResults || [];
    this.modelAccuracy = new Map(data.modelAccuracy || []);
    this.errorAnalysis = new Map(data.errorAnalysis || []);
    this.performanceHistory = data.performanceHistory || [];
    
    this.saveToStorage();
    console.log('✅ Data imported successfully');
  }

  clearAllData() {
    this.predictions = [];
    this.actualResults = [];
    this.modelAccuracy.clear();
    this.errorAnalysis.clear();
    this.performanceHistory = [];
    this.highErrorFlags = [];
    
    this.saveToStorage();
    console.log('✅ All monitoring data cleared');
  }

  // ========================================
  // STORAGE MANAGEMENT
  // ========================================

  saveToStorage() {
    try {
      const data = this.exportData();
      localStorage.setItem('predictionMonitorData', JSON.stringify(data));
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('predictionMonitorData');
      if (stored) {
        const data = JSON.parse(stored);
        this.importData(data);
        console.log('✅ Monitoring data loaded from storage');
      }
    } catch (error) {
      console.warn('Could not load from localStorage:', error);
    }
  }

  // ========================================
  // STATISTICS
  // ========================================

  getStatistics() {
    const verified = this.predictions.filter(p => p.verified);
    
    return {
      totalPredictions: this.predictions.length,
      verifiedPredictions: verified.length,
      verificationRate: (verified.length / this.predictions.length * 100).toFixed(1) + '%',
      averageError: this.calculateAverageError(),
      bestModel: this.getBestModel()?.method || 'N/A',
      dateRange: {
        first: this.predictions[0]?.timestamp || null,
        last: this.predictions[this.predictions.length - 1]?.timestamp || null
      }
    };
  }

  calculateAverageError() {
    if (this.actualResults.length === 0) return 'N/A';
    
    const avgError = this.actualResults.reduce((sum, r) => sum + r.percentError, 0) / this.actualResults.length;
    return avgError.toFixed(2) + '%';
  }
}

// Export for use in other modules
export default PredictionMonitor;
