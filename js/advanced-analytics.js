// Mini Agronomist Pro - Advanced Analytics Engine
// Comprehensive agricultural analytics and insights

class AdvancedAnalytics {
  constructor(proFeatureManager, fieldManager) {
    this.proManager = proFeatureManager;
    this.fieldManager = fieldManager;
    this.analyticsData = this.initializeAnalytics();
    this.insights = [];
    this.benchmarks = this.loadBenchmarks();
    this.init();
  }

  // Initialize analytics system
  init() {
    if (!this.proManager.hasFeature('advancedAnalytics')) {
      console.log('Advanced Analytics requires Pro/Enterprise subscription');
      return;
    }

    this.setupAnalyticsUI();
    this.loadHistoricalData();
    console.log('📊 Advanced Analytics Engine initialized');
  }

  // Initialize analytics data structure
  initializeAnalytics() {
    return {
      yield_analysis: {},
      profitability_analysis: {},
      risk_assessment: {},
      sustainability_metrics: {},
      comparative_analysis: {},
      predictive_models: {},
      market_intelligence: {}
    };
  }

  // Load industry benchmarks
  loadBenchmarks() {
    return {
      yield_benchmarks: {
        "maize": { "low": 2.5, "average": 4.5, "high": 7.0, "excellent": 9.5 },
        "groundnuts": { "low": 1.0, "average": 1.8, "high": 2.8, "excellent": 3.5 },
        "soybeans": { "low": 1.5, "average": 2.2, "high": 3.2, "excellent": 4.0 },
        "sorghum": { "low": 1.8, "average": 3.0, "high": 4.5, "excellent": 6.0 },
        "avocado": { "low": 8.0, "average": 15.0, "high": 25.0, "excellent": 35.0 },
        "coffee_arabica": { "low": 0.8, "average": 1.5, "high": 2.5, "excellent": 3.5 }
      },
      profitability_benchmarks: {
        "roi_targets": { "minimum": 15, "good": 25, "excellent": 40 },
        "cost_ratios": { "seeds": 0.15, "fertilizers": 0.25, "labor": 0.35, "equipment": 0.15, "other": 0.10 }
      },
      sustainability_scores: {
        "poor": 30, "fair": 50, "good": 70, "excellent": 90
      }
    };
  }

  // Comprehensive Yield Analysis
  performYieldAnalysis(fieldId = null, timeframe = 'all') {
    const fields = fieldId ? [this.fieldManager.getField(fieldId)] : Object.values(this.fieldManager.fields);
    const analysis = {
      summary: {},
      trends: {},
      variability: {},
      benchmarking: {},
      factors_impact: {}
    };

    fields.forEach(field => {
      if (!field || !field.crops_history.length) return;

      const crops = this.filterByTimeframe(field.crops_history, timeframe);
      const completedCrops = crops.filter(crop => crop.actual_yield);

      if (!completedCrops.length) return;

      // Yield summary by crop
      const cropSummary = {};
      completedCrops.forEach(crop => {
        if (!cropSummary[crop.crop]) {
          cropSummary[crop.crop] = { yields: [], seasons: [] };
        }
        cropSummary[crop.crop].yields.push(crop.actual_yield);
        cropSummary[crop.crop].seasons.push(crop.season);
      });

      // Calculate statistics for each crop
      Object.keys(cropSummary).forEach(cropType => {
        const yields = cropSummary[cropType].yields;
        const stats = this.calculateStatistics(yields);
        const benchmark = this.benchmarks.yield_benchmarks[cropType];

        analysis.summary[cropType] = {
          field_id: field.id,
          field_name: field.name,
          total_seasons: yields.length,
          ...stats,
          benchmark_comparison: benchmark ? this.compareToBenchmark(stats.average, benchmark) : null,
          trend: this.calculateTrend(yields),
          variability: this.calculateVariability(yields),
          best_season: this.findBestSeason(cropSummary[cropType]),
          yield_stability: this.calculateStability(yields)
        };
      });
    });

    this.analyticsData.yield_analysis = analysis;
    return analysis;
  }

  // Profitability Analysis
  performProfitabilityAnalysis(fieldId = null, timeframe = 'all') {
    const fields = fieldId ? [this.fieldManager.getField(fieldId)] : Object.values(this.fieldManager.fields);
    const analysis = {
      roi_analysis: {},
      cost_breakdown: {},
      revenue_trends: {},
      profitability_by_crop: {},
      efficiency_metrics: {}
    };

    fields.forEach(field => {
      if (!field || !field.crops_history.length) return;

      const crops = this.filterByTimeframe(field.crops_history, timeframe);
      const completedCrops = crops.filter(crop => crop.actual_yield && crop.costs.total > 0);

      if (!completedCrops.length) return;

      // Calculate profitability metrics
      const profitabilityData = completedCrops.map(crop => ({
        crop: crop.crop,
        season: crop.season,
        revenue: crop.revenue || (crop.actual_yield * this.getMarketPrice(crop.crop)),
        costs: crop.costs.total,
        profit: (crop.revenue || (crop.actual_yield * this.getMarketPrice(crop.crop))) - crop.costs.total,
        roi: ((crop.revenue || (crop.actual_yield * this.getMarketPrice(crop.crop))) - crop.costs.total) / crop.costs.total * 100,
        yield_per_hectare: crop.actual_yield,
        cost_per_hectare: crop.costs.total / field.size_hectares,
        revenue_per_hectare: (crop.revenue || (crop.actual_yield * this.getMarketPrice(crop.crop))) / field.size_hectares
      }));

      // ROI Analysis
      const roiStats = this.calculateStatistics(profitabilityData.map(d => d.roi));
      analysis.roi_analysis[field.id] = {
        field_name: field.name,
        ...roiStats,
        benchmark_comparison: this.compareROIToBenchmark(roiStats.average),
        consistency: this.calculateROIConsistency(profitabilityData.map(d => d.roi))
      };

      // Cost Breakdown Analysis
      const costBreakdown = this.analyzeCostBreakdown(completedCrops);
      analysis.cost_breakdown[field.id] = costBreakdown;

      // Profitability by Crop
      const cropProfitability = {};
      profitabilityData.forEach(data => {
        if (!cropProfitability[data.crop]) {
          cropProfitability[data.crop] = { profits: [], rois: [], revenues: [] };
        }
        cropProfitability[data.crop].profits.push(data.profit);
        cropProfitability[data.crop].rois.push(data.roi);
        cropProfitability[data.crop].revenues.push(data.revenue);
      });

      Object.keys(cropProfitability).forEach(crop => {
        const data = cropProfitability[crop];
        analysis.profitability_by_crop[`${field.id}_${crop}`] = {
          crop: crop,
          field_name: field.name,
          avg_profit: this.calculateAverage(data.profits),
          avg_roi: this.calculateAverage(data.rois),
          avg_revenue: this.calculateAverage(data.revenues),
          profitability_score: this.calculateProfitabilityScore(data.rois),
          recommendation: this.generateProfitabilityRecommendation(crop, data.rois)
        };
      });
    });

    this.analyticsData.profitability_analysis = analysis;
    return analysis;
  }

  // Risk Assessment Analysis
  performRiskAssessment(fieldId = null) {
    const fields = fieldId ? [this.fieldManager.getField(fieldId)] : Object.values(this.fieldManager.fields);
    const assessment = {
      overall_risk_score: 0,
      risk_factors: {},
      mitigation_strategies: [],
      risk_by_crop: {},
      environmental_risks: {},
      financial_risks: {}
    };

    fields.forEach(field => {
      if (!field) return;

      const fieldRisk = {
        field_id: field.id,
        field_name: field.name,
        production_risk: this.assessProductionRisk(field),
        market_risk: this.assessMarketRisk(field),
        environmental_risk: this.assessEnvironmentalRisk(field),
        financial_risk: this.assessFinancialRisk(field),
        overall_score: 0
      };

      // Calculate weighted overall risk score
      fieldRisk.overall_score = (
        fieldRisk.production_risk * 0.3 +
        fieldRisk.market_risk * 0.25 +
        fieldRisk.environmental_risk * 0.25 +
        fieldRisk.financial_risk * 0.2
      );

      assessment.risk_factors[field.id] = fieldRisk;
      
      // Generate mitigation strategies
      assessment.mitigation_strategies.push(...this.generateMitigationStrategies(fieldRisk));
    });

    // Calculate overall portfolio risk
    const fieldRiskScores = Object.values(assessment.risk_factors).map(r => r.overall_score);
    assessment.overall_risk_score = this.calculateAverage(fieldRiskScores);

    this.analyticsData.risk_assessment = assessment;
    return assessment;
  }

  // Sustainability Metrics Analysis
  performSustainabilityAnalysis(fieldId = null) {
    const fields = fieldId ? [this.fieldManager.getField(fieldId)] : Object.values(this.fieldManager.fields);
    const analysis = {
      sustainability_scores: {},
      environmental_impact: {},
      resource_efficiency: {},
      biodiversity_metrics: {},
      carbon_footprint: {},
      recommendations: []
    };

    fields.forEach(field => {
      if (!field) return;

      const sustainability = {
        field_id: field.id,
        field_name: field.name,
        overall_score: this.fieldManager.calculateSustainabilityScore(field),
        crop_diversity: this.calculateCropDiversity(field),
        soil_health: this.assessSoilHealth(field),
        water_efficiency: this.calculateWaterEfficiency(field),
        input_efficiency: this.calculateInputEfficiency(field),
        carbon_sequestration: this.estimateCarbonSequestration(field)
      };

      analysis.sustainability_scores[field.id] = sustainability;
      
      // Generate sustainability recommendations
      analysis.recommendations.push(...this.generateSustainabilityRecommendations(sustainability));
    });

    this.analyticsData.sustainability_metrics = analysis;
    return analysis;
  }

  // Comparative Analysis
  performComparativeAnalysis(fields, metrics = ['yield', 'profitability', 'sustainability']) {
    if (!this.proManager.hasFeature('advancedAnalytics')) return null;

    const comparison = {
      field_rankings: {},
      peer_comparison: {},
      regional_benchmarks: {},
      improvement_opportunities: {}
    };

    // Rank fields by different metrics
    metrics.forEach(metric => {
      comparison.field_rankings[metric] = this.rankFieldsByMetric(fields, metric);
    });

    // Generate improvement opportunities
    comparison.improvement_opportunities = this.identifyImprovementOpportunities(fields);

    this.analyticsData.comparative_analysis = comparison;
    return comparison;
  }

  // Generate Insights and Recommendations
  generateInsights(analysisResults) {
    const insights = [];

    // Yield insights
    if (analysisResults.yield_analysis) {
      insights.push(...this.generateYieldInsights(analysisResults.yield_analysis));
    }

    // Profitability insights
    if (analysisResults.profitability_analysis) {
      insights.push(...this.generateProfitabilityInsights(analysisResults.profitability_analysis));
    }

    // Risk insights
    if (analysisResults.risk_assessment) {
      insights.push(...this.generateRiskInsights(analysisResults.risk_assessment));
    }

    // Sustainability insights
    if (analysisResults.sustainability_metrics) {
      insights.push(...this.generateSustainabilityInsights(analysisResults.sustainability_metrics));
    }

    this.insights = insights;
    return insights;
  }

  // Utility Functions
  calculateStatistics(values) {
    if (!values.length) return { average: 0, min: 0, max: 0, median: 0, std_dev: 0 };

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      average: Math.round(avg * 100) / 100,
      min: Math.min(...values),
      max: Math.max(...values),
      median: sorted[Math.floor(sorted.length / 2)],
      std_dev: Math.round(stdDev * 100) / 100,
      count: values.length
    };
  }

  calculateAverage(values) {
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  filterByTimeframe(data, timeframe) {
    if (timeframe === 'all') return data;
    
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeframe) {
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      case '2years':
        cutoff.setFullYear(now.getFullYear() - 2);
        break;
      case '5years':
        cutoff.setFullYear(now.getFullYear() - 5);
        break;
      default:
        return data;
    }

    return data.filter(item => new Date(item.planting_date) >= cutoff);
  }

  compareToBenchmark(value, benchmark) {
    if (value >= benchmark.excellent) return { level: 'excellent', percentile: 95 };
    if (value >= benchmark.high) return { level: 'high', percentile: 80 };
    if (value >= benchmark.average) return { level: 'average', percentile: 50 };
    if (value >= benchmark.low) return { level: 'below_average', percentile: 25 };
    return { level: 'poor', percentile: 10 };
  }

  getMarketPrice(crop) {
    // This would integrate with real market data in production
    const prices = {
      maize: 0.35, groundnuts: 1.20, sorghum: 0.28, soybeans: 0.45,
      avocado: 5.50, coffee_arabica: 8.00, cocoa: 3.20, vanilla: 400
    };
    return prices[crop] || 0.30;
  }

  // Setup Analytics UI
  setupAnalyticsUI() {
    // Create analytics dashboard
    const dashboard = document.createElement('div');
    dashboard.id = 'analyticsDashboard';
    dashboard.className = 'analytics-dashboard pro-feature';
    dashboard.innerHTML = `
      <div class="analytics-header">
        <h3>📊 Advanced Analytics</h3>
        <div class="analytics-controls">
          <select id="analyticsTimeframe">
            <option value="all">All Time</option>
            <option value="year">Last Year</option>
            <option value="2years">Last 2 Years</option>
            <option value="5years">Last 5 Years</option>
          </select>
          <button id="runAnalytics" class="btn btn-primary">Run Analysis</button>
          <button id="exportAnalytics" class="btn btn-secondary">📊 Export Report</button>
        </div>
      </div>
      <div class="analytics-content" id="analyticsContent">
        <!-- Analytics results will be displayed here -->
      </div>
    `;

    // Insert after field dashboard
    const fieldDashboard = document.getElementById('fieldDashboard');
    if (fieldDashboard) {
      fieldDashboard.insertAdjacentElement('afterend', dashboard);
    }

    this.setupAnalyticsEvents();
  }

  setupAnalyticsEvents() {
    document.getElementById('runAnalytics')?.addEventListener('click', () => {
      this.runFullAnalysis();
    });

    document.getElementById('exportAnalytics')?.addEventListener('click', () => {
      this.exportAnalyticsReport();
    });
  }

  runFullAnalysis() {
    const timeframe = document.getElementById('analyticsTimeframe')?.value || 'all';
    
    const results = {
      yield_analysis: this.performYieldAnalysis(null, timeframe),
      profitability_analysis: this.performProfitabilityAnalysis(null, timeframe),
      risk_assessment: this.performRiskAssessment(),
      sustainability_metrics: this.performSustainabilityAnalysis()
    };

    const insights = this.generateInsights(results);
    this.displayAnalyticsResults(results, insights);
  }

  displayAnalyticsResults(results, insights) {
    const content = document.getElementById('analyticsContent');
    if (!content) return;

    content.innerHTML = `
      <div class="analytics-summary">
        <div class="insight-cards">
          ${insights.slice(0, 6).map(insight => `
            <div class="insight-card ${insight.type}">
              <div class="insight-icon">${insight.icon}</div>
              <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
                ${insight.action ? `<small><strong>Action:</strong> ${insight.action}</small>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="analytics-charts">
        <!-- Charts would be rendered here -->
        <div class="chart-placeholder">
          📈 Interactive charts and visualizations will be displayed here
        </div>
      </div>
    `;
  }

  exportAnalyticsReport() {
    if (!this.proManager.trackUsage('exports')) return;

    const report = {
      generated_date: new Date().toISOString(),
      analytics_data: this.analyticsData,
      insights: this.insights,
      summary: this.generateExecutiveSummary()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agricultural-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  generateExecutiveSummary() {
    return {
      total_fields: Object.keys(this.fieldManager.fields).length,
      avg_sustainability_score: this.calculateAverage(
        Object.values(this.analyticsData.sustainability_metrics?.sustainability_scores || {})
          .map(s => s.overall_score)
      ),
      top_performing_crop: this.identifyTopPerformingCrop(),
      key_recommendations: this.insights.slice(0, 3).map(i => i.title)
    };
  }

  // Placeholder methods for complex calculations
  assessProductionRisk(field) { return Math.random() * 30 + 20; }
  assessMarketRisk(field) { return Math.random() * 25 + 15; }
  assessEnvironmentalRisk(field) { return Math.random() * 35 + 25; }
  assessFinancialRisk(field) { return Math.random() * 30 + 20; }
  
  generateYieldInsights(analysis) { return []; }
  generateProfitabilityInsights(analysis) { return []; }
  generateRiskInsights(analysis) { return []; }
  generateSustainabilityInsights(analysis) { return []; }
  
  identifyTopPerformingCrop() { return 'maize'; }
}

// Export for use in main application
window.AdvancedAnalytics = AdvancedAnalytics;
