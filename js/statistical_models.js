// Statistical Models for Advanced Agricultural Prediction
// Supporting classes for the Advanced Prediction Engine

// Multiple Linear Regression for yield prediction
class MultipleLinearRegression {
  constructor() {
    this.coefficients = null;
    this.intercept = null;
    this.rSquared = 0;
  }

  fit(X, y) {
    // Calculate coefficients using normal equation: θ = (X^T X)^(-1) X^T y
    const XMatrix = this.addInterceptColumn(X);
    const XTranspose = this.transpose(XMatrix);
    const XTX = this.multiply(XTranspose, XMatrix);
    const XTXInverse = this.inverse(XTX);
    const XTy = this.multiply(XTranspose, y);
    
    this.coefficients = this.multiply(XTXInverse, XTy);
    this.calculateRSquared(X, y);
    
    return this;
  }

  predict(X) {
    if (!this.coefficients) throw new Error('Model not trained');
    
    const XMatrix = this.addInterceptColumn(X);
    return this.multiply(XMatrix, this.coefficients);
  }

  calculateRSquared(X, y) {
    const predictions = this.predict(X);
    const yMean = y.reduce((a, b) => a + b) / y.length;
    
    const ssRes = y.reduce((sum, actual, i) => sum + Math.pow(actual - predictions[i], 2), 0);
    const ssTot = y.reduce((sum, actual) => sum + Math.pow(actual - yMean, 2), 0);
    
    this.rSquared = 1 - (ssRes / ssTot);
  }

  // Matrix operations
  addInterceptColumn(X) {
    return X.map(row => [1, ...row]);
  }

  transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

  multiply(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  inverse(matrix) {
    // Gauss-Jordan elimination for matrix inversion
    const n = matrix.length;
    const augmented = matrix.map((row, i) => [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]);
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      
      // Make diagonal 1
      const pivot = augmented[i][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }
      
      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }
    
    return augmented.map(row => row.slice(n));
  }
}

// Bayesian Inference for uncertainty quantification
class BayesianInference {
  constructor() {
    this.priors = new Map();
    this.likelihoods = new Map();
    this.posteriors = new Map();
  }

  setPrior(parameter, distribution) {
    this.priors.set(parameter, distribution);
  }

  updatePosterior(parameter, evidence) {
    const prior = this.priors.get(parameter);
    const likelihood = this.calculateLikelihood(evidence);
    
    // Bayesian update: P(θ|D) ∝ P(D|θ) * P(θ)
    const posterior = this.bayesianUpdate(prior, likelihood);
    this.posteriors.set(parameter, posterior);
    
    return posterior;
  }

  calculateLikelihood(evidence) {
    // Calculate likelihood based on evidence
    return evidence.map(e => this.gaussianPDF(e.value, e.mean, e.std));
  }

  bayesianUpdate(prior, likelihood) {
    // Simplified Bayesian update
    const numerator = prior.map((p, i) => p * likelihood[i]);
    const evidence = numerator.reduce((a, b) => a + b, 0);
    
    return numerator.map(n => n / evidence);
  }

  gaussianPDF(x, mean, std) {
    return (1 / (std * Math.sqrt(2 * Math.PI))) * 
           Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
  }
}

// Time Series Analysis for seasonal patterns
class TimeSeriesAnalysis {
  constructor() {
    this.seasonalPatterns = new Map();
    this.trends = new Map();
  }

  analyzeSeasonality(data, period = 12) {
    const seasonal = this.extractSeasonalComponent(data, period);
    const trend = this.extractTrend(data);
    const residual = this.calculateResidual(data, seasonal, trend);
    
    return { seasonal, trend, residual };
  }

  extractSeasonalComponent(data, period) {
    const seasonal = new Array(data.length);
    const seasonalAverages = new Array(period).fill(0);
    
    // Calculate seasonal averages
    for (let i = 0; i < data.length; i++) {
      seasonalAverages[i % period] += data[i];
    }
    
    const counts = new Array(period).fill(0);
    for (let i = 0; i < data.length; i++) {
      counts[i % period]++;
    }
    
    for (let i = 0; i < period; i++) {
      seasonalAverages[i] /= counts[i];
    }
    
    // Apply seasonal pattern
    for (let i = 0; i < data.length; i++) {
      seasonal[i] = seasonalAverages[i % period];
    }
    
    return seasonal;
  }

  extractTrend(data) {
    const trend = new Array(data.length);
    const windowSize = Math.min(12, Math.floor(data.length / 4));
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.floor(windowSize / 2) + 1);
      
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += data[j];
      }
      trend[i] = sum / (end - start);
    }
    
    return trend;
  }

  calculateResidual(data, seasonal, trend) {
    return data.map((value, i) => value - seasonal[i] - trend[i]);
  }

  forecast(data, steps = 1) {
    const analysis = this.analyzeSeasonality(data);
    const lastTrend = analysis.trend[analysis.trend.length - 1];
    const forecast = [];
    
    for (let i = 1; i <= steps; i++) {
      const seasonalIndex = (data.length + i - 1) % 12;
      const seasonalValue = analysis.seasonal[seasonalIndex];
      const trendValue = lastTrend; // Simplified trend continuation
      
      forecast.push(seasonalValue + trendValue);
    }
    
    return forecast;
  }
}

// Monte Carlo Simulation for risk assessment
class MonteCarloSimulation {
  constructor() {
    this.iterations = 10000;
  }

  runSimulation(parameters, iterations = this.iterations) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const scenario = this.generateScenario(parameters);
      const outcome = this.calculateOutcome(scenario);
      results.push(outcome);
    }
    
    return this.analyzeResults(results);
  }

  generateScenario(parameters) {
    const scenario = {};
    
    for (const [key, param] of Object.entries(parameters)) {
      if (param.distribution === 'normal') {
        scenario[key] = this.normalRandom(param.mean, param.std);
      } else if (param.distribution === 'uniform') {
        scenario[key] = this.uniformRandom(param.min, param.max);
      } else if (param.distribution === 'triangular') {
        scenario[key] = this.triangularRandom(param.min, param.mode, param.max);
      }
    }
    
    return scenario;
  }

  calculateOutcome(scenario) {
    // Implement your yield calculation logic here
    // This is a simplified example
    const baseYield = scenario.baseYield || 3.5;
    const rainfallFactor = scenario.rainfall / 100;
    const temperatureFactor = 1 - Math.abs(scenario.temperature - 25) / 50;
    const soilFactor = scenario.soilQuality || 0.8;
    
    return baseYield * rainfallFactor * temperatureFactor * soilFactor;
  }

  analyzeResults(results) {
    const sorted = results.sort((a, b) => a - b);
    const mean = results.reduce((a, b) => a + b) / results.length;
    const std = Math.sqrt(results.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / results.length);
    
    return {
      mean,
      std,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      percentiles: {
        p5: sorted[Math.floor(0.05 * results.length)],
        p25: sorted[Math.floor(0.25 * results.length)],
        p50: sorted[Math.floor(0.50 * results.length)],
        p75: sorted[Math.floor(0.75 * results.length)],
        p95: sorted[Math.floor(0.95 * results.length)]
      },
      riskMetrics: {
        probabilityOfLoss: results.filter(r => r < 0).length / results.length,
        valueAtRisk: sorted[Math.floor(0.05 * results.length)],
        expectedShortfall: sorted.slice(0, Math.floor(0.05 * results.length)).reduce((a, b) => a + b) / Math.floor(0.05 * results.length)
      }
    };
  }

  normalRandom(mean = 0, std = 1) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * std + mean;
  }

  uniformRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  triangularRandom(min, mode, max) {
    const u = Math.random();
    const c = (mode - min) / (max - min);
    
    if (u < c) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }
}

// K-Means Clustering for crop similarity analysis
class KMeansClustering {
  constructor(k = 3) {
    this.k = k;
    this.centroids = null;
    this.clusters = null;
  }

  fit(data, maxIterations = 100) {
    // Initialize centroids randomly
    this.centroids = this.initializeCentroids(data);
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const oldCentroids = this.centroids.map(c => [...c]);
      
      // Assign points to clusters
      this.clusters = this.assignClusters(data);
      
      // Update centroids
      this.updateCentroids(data);
      
      // Check for convergence
      if (this.centroidsConverged(oldCentroids, this.centroids)) {
        break;
      }
    }
    
    return this;
  }

  initializeCentroids(data) {
    const centroids = [];
    const dimensions = data[0].length;
    
    for (let i = 0; i < this.k; i++) {
      const centroid = [];
      for (let j = 0; j < dimensions; j++) {
        const values = data.map(point => point[j]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        centroid.push(Math.random() * (max - min) + min);
      }
      centroids.push(centroid);
    }
    
    return centroids;
  }

  assignClusters(data) {
    return data.map(point => {
      const distances = this.centroids.map(centroid => 
        this.euclideanDistance(point, centroid)
      );
      return distances.indexOf(Math.min(...distances));
    });
  }

  updateCentroids(data) {
    for (let i = 0; i < this.k; i++) {
      const clusterPoints = data.filter((_, index) => this.clusters[index] === i);
      
      if (clusterPoints.length > 0) {
        const dimensions = data[0].length;
        for (let j = 0; j < dimensions; j++) {
          this.centroids[i][j] = clusterPoints.reduce((sum, point) => sum + point[j], 0) / clusterPoints.length;
        }
      }
    }
  }

  euclideanDistance(point1, point2) {
    return Math.sqrt(
      point1.reduce((sum, value, index) => sum + Math.pow(value - point2[index], 2), 0)
    );
  }

  centroidsConverged(oldCentroids, newCentroids, threshold = 1e-6) {
    for (let i = 0; i < oldCentroids.length; i++) {
      const distance = this.euclideanDistance(oldCentroids[i], newCentroids[i]);
      if (distance > threshold) return false;
    }
    return true;
  }

  predict(data) {
    return this.assignClusters(data);
  }
}

// Export classes for use
// Export classes for ES module usage
export {
  MultipleLinearRegression,
  BayesianInference,
  TimeSeriesAnalysis,
  MonteCarloSimulation,
  KMeansClustering
};
