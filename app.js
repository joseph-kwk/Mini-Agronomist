// Enhanced Mini Agronomist Application
// Version 2.0 - Comprehensive agricultural yield prediction system

class MiniAgronomist {
  constructor() {
    this.cropData = {};
    this.cropProfiles = {};
    this.regionData = {};
    this.currentPrediction = null;
    this.predictionHistory = [];
    this.isLoading = false;
    
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.setupEventListeners();
      this.setupFormValidation();
      this.initializeComponents();
      this.showStatusMessage('Application ready!', 'success');
    } catch (error) {
      this.handleError('Failed to initialize application', error);
    }
  }

  // Enhanced Data Loading with better error handling
  async loadData() {
    this.showLoadingOverlay('Loading agricultural data...');
    
    try {
      const [rules, profiles, regions] = await Promise.all([
        this.fetchJSON("data/crop_rules.json"),
        this.fetchJSON("data/crop_profiles.json"),
        this.fetchJSON("data/regions.json")
      ]);

      this.cropData = rules;
      this.cropProfiles = profiles;
      this.regionData = regions;

      console.log("✅ Data loaded successfully:", {
        regions: Object.keys(this.regionData).length,
        crops: Object.keys(this.cropProfiles).length,
        rules: Object.keys(this.cropData).length
      });

      this.validateDataIntegrity();
      this.populateDropdowns();
      
    } catch (error) {
      throw new Error(`Data loading failed: ${error.message}`);
    } finally {
      this.hideLoadingOverlay();
    }
  }

  async fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Enhanced Event Listeners
  setupEventListeners() {
    // Form submission
    const form = document.getElementById("inputForm");
    form?.addEventListener("submit", (e) => this.handleFormSubmission(e));

    // Real-time validation
    document.getElementById("rainfall")?.addEventListener("input", (e) => this.validateField('rainfall', e.target.value));
    document.getElementById("plantingDate")?.addEventListener("change", (e) => this.validateField('plantingDate', e.target.value));
    document.getElementById("region")?.addEventListener("change", (e) => this.handleRegionChange(e.target.value));
    document.getElementById("crop")?.addEventListener("change", (e) => this.handleCropChange(e.target.value));
    document.getElementById("soil")?.addEventListener("change", (e) => this.validateField('soil', e.target.value));

    // Button actions
    document.getElementById("resetForm")?.addEventListener("click", () => this.resetForm());
    document.getElementById("newPrediction")?.addEventListener("click", () => this.startNewPrediction());
    document.getElementById("clearHistory")?.addEventListener("click", () => this.clearPredictionHistory());
    
    // Tool buttons
    document.getElementById("exportBtn")?.addEventListener("click", () => this.exportResults());
    document.getElementById("compareBtn")?.addEventListener("click", () => this.openComparisonTool());
    document.getElementById("printBtn")?.addEventListener("click", () => this.printReport());
    
    // Help and settings
    document.getElementById("helpBtn")?.addEventListener("click", () => this.showHelpModal());
    document.getElementById("settingsBtn")?.addEventListener("click", () => this.showSettingsModal());
    
    // Modal close handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
  }

  // Enhanced Form Validation
  setupFormValidation() {
    const fields = ['region', 'crop', 'soil', 'rainfall', 'plantingDate'];
    
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('blur', () => this.validateField(fieldId, field.value));
        field.addEventListener('invalid', (e) => this.handleFieldInvalid(e));
      }
    });
  }

  validateField(fieldId, value) {
    const field = document.getElementById(fieldId);
    const statusDiv = field?.parentElement.querySelector('.field-status');
    
    if (!field || !statusDiv) return;

    let isValid = true;
    let message = '';
    let type = 'success';

    switch (fieldId) {
      case 'region':
        if (!value) {
          isValid = false;
          message = 'Please select your agricultural region';
          type = 'error';
        } else {
          message = '✓ Region selected';
        }
        break;

      case 'crop':
        if (!value) {
          isValid = false;
          message = 'Please select a crop type';
          type = 'error';
        } else {
          const profile = this.cropProfiles[value];
          message = profile ? `✓ ${profile.scientific_name}` : '✓ Crop selected';
        }
        break;

      case 'soil':
        if (!value) {
          isValid = false;
          message = 'Please select soil type';
          type = 'error';
        } else {
          message = '✓ Soil type selected';
        }
        break;

      case 'rainfall':
        const rainfall = parseFloat(value);
        if (isNaN(rainfall) || rainfall < 0) {
          isValid = false;
          message = 'Enter a valid rainfall amount';
          type = 'error';
        } else if (rainfall > 300) {
          message = '⚠ Very high rainfall - please verify';
          type = 'warning';
        } else if (rainfall < 10) {
          message = '⚠ Very low rainfall - drought conditions';
          type = 'warning';
        } else {
          message = '✓ Rainfall amount is reasonable';
        }
        break;

      case 'plantingDate':
        const plantingDate = new Date(value);
        const today = new Date();
        const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        
        if (!value || plantingDate.toString() === "Invalid Date") {
          isValid = false;
          message = 'Please select a valid planting date';
          type = 'error';
        } else if (plantingDate < today) {
          message = '⚠ Past planting date - historical analysis';
          type = 'warning';
        } else if (plantingDate > oneYearFromNow) {
          message = '⚠ Long-term prediction - less accurate';
          type = 'warning';
        } else {
          message = '✓ Planting date is appropriate';
        }
        break;
    }

    // Update field appearance
    field.setAttribute('aria-invalid', !isValid);
    statusDiv.textContent = message;
    statusDiv.className = `field-status ${type}`;

    return isValid;
  }

  handleFieldInvalid(event) {
    event.preventDefault();
    const field = event.target;
    this.validateField(field.id, field.value);
  }

  // Enhanced Form Submission
  async handleFormSubmission(event) {
    event.preventDefault();
    
    if (this.isLoading) return;

    // Validate all fields
    const formData = this.getFormData();
    const validationResult = this.validateFormData(formData);
    
    if (!validationResult.isValid) {
      this.showErrorMessage(validationResult.errors.join('<br>'));
      return;
    }

    try {
      this.isLoading = true;
      this.showLoadingOverlay('Analyzing crop data...');
      
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const prediction = await this.generatePrediction(formData);
      
      if (prediction) {
        this.displayPredictionResults(prediction);
        this.savePredictionToHistory(prediction);
        this.enableToolButtons();
        this.showStatusMessage('Prediction generated successfully!', 'success');
      } else {
        throw new Error('No prediction data available for this combination');
      }
      
    } catch (error) {
      this.handleError('Failed to generate prediction', error);
    } finally {
      this.isLoading = false;
      this.hideLoadingOverlay();
    }
  }

  getFormData() {
    return {
      region: document.getElementById("region")?.value || '',
      soil: document.getElementById("soil")?.value || '',
      crop: document.getElementById("crop")?.value || '',
      rainfall: parseFloat(document.getElementById("rainfall")?.value) || 0,
      plantingDate: new Date(document.getElementById("plantingDate")?.value),
      timestamp: new Date()
    };
  }

  validateFormData(formData) {
    const errors = [];
    
    if (!formData.region) errors.push("❌ Please select your agricultural region");
    if (!formData.soil) errors.push("❌ Please select soil type");
    if (!formData.crop) errors.push("❌ Please select crop type");
    if (isNaN(formData.rainfall) || formData.rainfall < 0) errors.push("❌ Please enter valid rainfall amount");
    if (!formData.plantingDate || formData.plantingDate.toString() === "Invalid Date") errors.push("❌ Please select valid planting date");
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Enhanced Prediction Generation
  async generatePrediction(formData) {
    const { region, soil, crop, rainfall, plantingDate } = formData;
    
    // Check if we have data for this combination
    if (!this.cropData[region]?.[crop]?.[soil]) {
      return null;
    }

    const cropRules = this.cropData[region][crop][soil];
    const cropProfile = this.cropProfiles[crop];
    const regionInfo = this.regionData[region];

    // Enhanced yield calculation with more factors
    const yieldCalculation = this.calculateEnhancedYield(
      cropRules, cropProfile, regionInfo, rainfall, plantingDate, region, crop
    );

    // Generate comprehensive prediction object
    const prediction = {
      id: this.generatePredictionId(),
      timestamp: new Date(),
      inputs: formData,
      ...yieldCalculation,
      confidence: this.calculateConfidence(yieldCalculation),
      recommendations: this.generateRecommendations(cropRules, cropProfile, regionInfo, yieldCalculation),
      harvestInfo: this.calculateHarvestInfo(plantingDate, cropProfile, regionInfo),
      marketInsights: this.generateMarketInsights(crop, region, yieldCalculation.yieldEstimate)
    };

    this.currentPrediction = prediction;
    return prediction;
  }

  async calculateEnhancedYield(cropRules, cropProfile, regionInfo, rainfall, plantingDate, region, crop) {
    try {
      // Prepare form data for advanced engine
      const formData = {
        rainfall: rainfall,
        plantingDate: plantingDate,
        region: region,
        crop: crop,
        soil: regionInfo.soil_profiles?.[0]?.type || 'loam'
      };

      // Initialize advanced prediction engine if not already done
      if (!this.advancedEngine) {
        try {
          const { default: AdvancedPredictionEngine } = await import('./advanced_prediction_engine.js');
          this.advancedEngine = new AdvancedPredictionEngine();
        } catch (importError) {
          console.warn('Advanced prediction engine not available, using legacy method:', importError);
          return this.calculateLegacyYield(cropRules, cropProfile, regionInfo, rainfall, plantingDate, region, crop);
        }
      }

      // Use advanced prediction engine for sophisticated ML/statistical analysis
      const advancedPrediction = await this.advancedEngine.generateAdvancedPrediction(formData, cropRules, cropProfile, regionInfo);
      
      // Fallback to original method if advanced prediction fails
      if (!advancedPrediction || advancedPrediction.yieldEstimate <= 0) {
        return this.calculateLegacyYield(cropRules, cropProfile, regionInfo, rainfall, plantingDate, region, crop);
      }

      return {
        yieldEstimate: Math.round(advancedPrediction.yieldEstimate * 10) / 10,
        riskLevel: 1 - (advancedPrediction.confidence || 0.5),
        finalScore: advancedPrediction.confidence || 0.5,
        factorScores: advancedPrediction.factors || {},
        confidence: advancedPrediction.confidence,
        method: advancedPrediction.method,
        dataQuality: advancedPrediction.dataQuality,
        riskAnalysis: advancedPrediction.riskAnalysis || {},
        methodDetails: advancedPrediction.methods || [],
        adjustments: advancedPrediction.adjustments || {},
        uncertainty: advancedPrediction.uncertainty || 0,
        percentiles: advancedPrediction.percentiles || {},
        ensembleWeights: advancedPrediction.ensembleWeights || {},
        source: cropRules.source,
        baseTip: cropRules.tip
      };
      
    } catch (error) {
      console.error('Advanced yield calculation error:', error);
      return this.calculateLegacyYield(cropRules, cropProfile, regionInfo, rainfall, plantingDate, region, crop);
    }
  }

  calculateLegacyYield(cropRules, cropProfile, regionInfo, rainfall, plantingDate, region, crop) {
    const [minYield, maxYield] = cropRules.yield_range;
    const [minRain, maxRain] = cropRules.rain_window;

    // Factor calculations with improved algorithms
    const rainfallScore = this.calculateRainfallScore(rainfall, minRain, maxRain);
    const timingScore = this.calculateTimingScore(region, crop, plantingDate);
    const waterMatchScore = this.calculateWaterRequirementScore(regionInfo, cropProfile);
    const soilCompatibilityScore = this.calculateSoilCompatibilityScore(regionInfo, cropProfile, cropRules);
    const temperatureScore = this.calculateTemperatureScore(regionInfo, cropProfile);
    
    // Enhanced weighted scoring
    const weights = {
      rainfall: 0.30,
      timing: 0.25,
      water: 0.20,
      soil: 0.15,
      temperature: 0.10
    };

    const finalScore = (
      rainfallScore * weights.rainfall +
      timingScore * weights.timing +
      waterMatchScore * weights.water +
      soilCompatibilityScore * weights.soil +
      temperatureScore * weights.temperature
    );

    const predictedYield = minYield + (maxYield - minYield) * finalScore;
    const riskLevel = 1 - finalScore;

    return {
      yieldEstimate: Math.round(predictedYield * 10) / 10,
      riskLevel,
      finalScore,
      factorScores: {
        rainfall: rainfallScore,
        timing: timingScore,
        water: waterMatchScore,
        soil: soilCompatibilityScore,
        temperature: temperatureScore
      },
      source: cropRules.source,
      baseTip: cropRules.tip,
      method: 'legacy_statistical',
      dataQuality: 'medium'
    };
  }

  calculateRainfallScore(rainfall, minRain, maxRain) {
    if (rainfall < minRain) {
      return Math.max(0.1, rainfall / minRain);
    } else if (rainfall > maxRain) {
      return Math.max(0.3, 1 - ((rainfall - maxRain) / maxRain));
    } else {
      return 1.0;
    }
  }

  calculateTimingScore(region, crop, plantingDate) {
    const regionInfo = this.regionData[region];
    const plantingWindow = regionInfo.planting_windows?.[crop];
    
    if (!plantingWindow) return 0.8; // Default score if no specific window data
    
    const plantMonth = plantingDate.getMonth();
    const startMonth = this.getMonthNumber(plantingWindow.start);
    const endMonth = this.getMonthNumber(plantingWindow.end);
    
    if (this.isWithinPlantingWindow(plantMonth, startMonth, endMonth)) {
      return 1.0;
    } else {
      return 0.6; // Penalty for planting outside optimal window
    }
  }

  calculateWaterRequirementScore(regionInfo, cropProfile) {
    const annualRainfall = regionInfo.annual_rainfall_mm;
    const avgWaterRequirement = (cropProfile.water_requirement_mm[0] + cropProfile.water_requirement_mm[1]) / 2;
    
    const ratio = annualRainfall / avgWaterRequirement;
    return Math.min(1.0, Math.max(0.2, ratio));
  }

  calculateSoilCompatibilityScore(regionInfo, cropProfile, cropRules) {
    // Find matching soil profile
    const soilType = Object.keys(cropRules)[0]; // Assuming single soil type per rule
    const soilProfile = regionInfo.soil_profiles?.find(s => s.type === soilType);
    
    if (!soilProfile) return 0.7; // Default score
    
    const soilPHMid = (soilProfile.ph_range[0] + soilProfile.ph_range[1]) / 2;
    const cropPHMid = (cropProfile.soil_ph_range[0] + cropProfile.soil_ph_range[1]) / 2;
    const pHDiff = Math.abs(soilPHMid - cropPHMid);
    
    return Math.max(0.3, 1.0 - (pHDiff / 3.0));
  }

  calculateTemperatureScore(regionInfo, cropProfile) {
    if (!regionInfo.avg_monthly_temp_c || !cropProfile.optimal_temp_c) return 0.8;
    
    const avgRegionTemp = regionInfo.avg_monthly_temp_c.reduce((a, b) => a + b) / regionInfo.avg_monthly_temp_c.length;
    const optimalTempMid = (cropProfile.optimal_temp_c[0] + cropProfile.optimal_temp_c[1]) / 2;
    const tempDiff = Math.abs(avgRegionTemp - optimalTempMid);
    
    return Math.max(0.3, 1.0 - (tempDiff / 20));
  }

  // Enhanced Display Functions
  displayPredictionResults(prediction) {
    this.updateConditionsSummary(prediction);
    this.updateYieldDisplay(prediction);
    this.updateConfidenceIndicator(prediction);
    this.updateRiskAssessment(prediction);
    this.updateTipSection(prediction);
    this.updateAnalyticsSection(prediction);
    this.updateHarvestSection(prediction);
    this.showNewPredictionButton();
    
    // Smooth scroll to results
    document.getElementById('output')?.scrollIntoView({ behavior: 'smooth' });
  }

  updateConditionsSummary(prediction) {
    const { region, crop, soil, rainfall, plantingDate } = prediction.inputs;
    const regionDisplay = this.regionData[region]?.display_name || region;
    const cropDisplay = this.cropProfiles[crop]?.scientific_name || crop;
    
    const summary = `
      <strong>Region:</strong> ${regionDisplay}<br>
      <strong>Crop:</strong> ${cropDisplay} (${crop})<br>
      <strong>Soil:</strong> ${soil}<br>
      <strong>Rainfall:</strong> ${rainfall}mm/week<br>
      <strong>Planting:</strong> ${plantingDate.toLocaleDateString()}
    `;
    
    const summaryElement = document.getElementById('conditionsSummary');
    if (summaryElement) {
      summaryElement.innerHTML = summary;
    }
  }

  updateYieldDisplay(prediction) {
    const yieldElement = document.getElementById('yieldResult');
    if (yieldElement) {
      yieldElement.textContent = `${prediction.yieldEstimate} tons/ha`;
      yieldElement.className = 'big-yield';
      yieldElement.classList.add('fade-in');
    }
  }

  updateConfidenceIndicator(prediction) {
    const confidenceElement = document.getElementById('confidence');
    if (confidenceElement) {
      const confidence = prediction.confidence;
      let confidenceClass, confidenceText;
      
      if (confidence >= 0.8) {
        confidenceClass = 'high';
        confidenceText = `High Confidence (${Math.round(confidence * 100)}%)`;
      } else if (confidence >= 0.6) {
        confidenceClass = 'medium';
        confidenceText = `Medium Confidence (${Math.round(confidence * 100)}%)`;
      } else {
        confidenceClass = 'low';
        confidenceText = `Low Confidence (${Math.round(confidence * 100)}%)`;
      }
      
      confidenceElement.textContent = confidenceText;
      confidenceElement.className = `confidence-indicator ${confidenceClass}`;
    }
  }

  updateRiskAssessment(prediction) {
    this.renderEnhancedRiskBar(prediction.riskLevel);
  }

  updateTipSection(prediction) {
    const tipElement = document.getElementById('tip');
    if (tipElement) {
      const recommendations = prediction.recommendations.join(' ');
      tipElement.innerHTML = `
        <div class="tip-header">
          <span class="material-icons" aria-hidden="true">lightbulb</span>
          <strong>Agricultural Recommendations</strong>
        </div>
        <p>${recommendations}</p>
      `;
      tipElement.className = 'tip-section';
    }
  }

  updateAnalyticsSection(prediction) {
    const analyticsElement = document.getElementById('analytics');
    if (analyticsElement) {
      const scores = prediction.factorScores;
      
      document.getElementById('tempScore').textContent = `${Math.round(scores.temperature * 100)}%`;
      document.getElementById('waterScore').textContent = `${Math.round(scores.water * 100)}%`;
      document.getElementById('soilScore').textContent = `${Math.round(scores.soil * 100)}%`;
      document.getElementById('timingScore').textContent = `${Math.round(scores.timing * 100)}%`;
      
      analyticsElement.classList.remove('hidden');
    }
  }

  updateHarvestSection(prediction) {
    const harvestElement = document.getElementById('harvestInfo');
    if (harvestElement && prediction.harvestInfo) {
      const info = prediction.harvestInfo;
      
      document.getElementById('harvestDate').textContent = info.harvestDate || 'Not calculated';
      document.getElementById('recommendedVarieties').textContent = info.varieties?.join(', ') || 'Not specified';
      document.getElementById('growingPeriod').textContent = info.growingPeriod || 'Not calculated';
      
      harvestElement.classList.remove('hidden');
    }
  }

  // Utility Functions
  generatePredictionId() {
    return 'pred_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  calculateConfidence(yieldCalculation) {
    return Math.min(0.95, Math.max(0.3, yieldCalculation.finalScore));
  }

  generateRecommendations(cropRules, cropProfile, regionInfo, yieldCalculation) {
    const recommendations = [cropRules.tip];
    
    if (yieldCalculation.factorScores.rainfall < 0.7) {
      recommendations.push("Consider supplemental irrigation during dry periods.");
    }
    
    if (yieldCalculation.factorScores.soil < 0.8) {
      recommendations.push("Soil improvement with organic matter is recommended.");
    }
    
    if (regionInfo.region_tips && regionInfo.region_tips.length > 0) {
      recommendations.push(regionInfo.region_tips[0]);
    }
    
    return recommendations;
  }

  calculateHarvestInfo(plantingDate, cropProfile, regionInfo) {
    const daysToMaturity = (cropProfile.days_to_maturity[0] + cropProfile.days_to_maturity[1]) / 2;
    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(harvestDate.getDate() + daysToMaturity);
    
    return {
      harvestDate: harvestDate.toLocaleDateString(),
      varieties: cropProfile.common_varieties?.slice(0, 3) || [],
      growingPeriod: `${Math.round(daysToMaturity)} days`
    };
  }

  generateMarketInsights(crop, region, yieldEstimate) {
    // This would integrate with market data APIs in a production system
    return {
      averagePrice: 'Market data not available',
      demandTrend: 'Stable',
      projectedRevenue: 'Calculation requires market prices'
    };
  }

  // Enhanced UI Functions
  showLoadingOverlay(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.querySelector('p').textContent = message;
      overlay.classList.remove('hidden');
    }
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  showStatusMessage(message, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status-message ${type}`;
      statusElement.classList.remove('hidden');
      
      setTimeout(() => {
        statusElement.classList.add('hidden');
      }, 4000);
    }
  }

  showErrorMessage(message) {
    const errorElement = document.getElementById('errorLog');
    if (errorElement) {
      errorElement.innerHTML = message;
      errorElement.classList.remove('hidden');
      errorElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  hideErrorMessage() {
    const errorElement = document.getElementById('errorLog');
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
  }

  handleError(context, error) {
    console.error(`${context}:`, error);
    this.showErrorMessage(`❌ ${context}: ${error.message}`);
  }

  // Enhanced dropdown population
  populateDropdowns() {
    this.populateRegionDropdown();
    this.populateCropDropdown();
  }

  populateRegionDropdown() {
    const regionSelect = document.getElementById("region");
    if (!regionSelect) return;

    regionSelect.innerHTML = '<option value="">Select your agricultural region...</option>';
    
    Object.entries(this.regionData).forEach(([key, region]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = region.display_name || key;
      regionSelect.appendChild(option);
    });
  }

  populateCropDropdown() {
    const cropSelect = document.getElementById("crop");
    if (!cropSelect) return;

    cropSelect.innerHTML = '<option value="">Select your crop...</option>';
    
    Object.entries(this.cropProfiles).forEach(([key, crop]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${crop.scientific_name} (${key})`;
      cropSelect.appendChild(option);
    });
  }

  handleRegionChange(regionKey) {
    this.updateSoilOptions(regionKey);
    this.validateField('region', regionKey);
    
    if (regionKey) {
      const regionInfo = this.regionData[regionKey];
      this.showStatusMessage(`Selected: ${regionInfo.display_name}`, 'success');
    }
  }

  updateSoilOptions(regionKey) {
    const soilSelect = document.getElementById("soil");
    if (!soilSelect) return;

    soilSelect.innerHTML = '<option value="">Select soil type...</option>';
    
    if (regionKey && this.regionData[regionKey]?.soil_profiles) {
      this.regionData[regionKey].soil_profiles.forEach(soil => {
        const option = document.createElement("option");
        option.value = soil.type;
        option.textContent = soil.type.charAt(0).toUpperCase() + soil.type.slice(1);
        soilSelect.appendChild(option);
      });
    }
  }

  handleCropChange(cropKey) {
    this.validateField('crop', cropKey);
    
    if (cropKey) {
      const cropInfo = this.cropProfiles[cropKey];
      this.showStatusMessage(`Selected: ${cropInfo.scientific_name}`, 'success');
    }
  }

  // Tool Functions
  enableToolButtons() {
    ['exportBtn', 'compareBtn', 'printBtn'].forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) btn.disabled = false;
    });
  }

  exportResults() {
    if (!this.currentPrediction) return;
    
    const exportData = {
      prediction: this.currentPrediction,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mini-agronomist-prediction-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showStatusMessage('Results exported successfully!', 'success');
  }

  printReport() {
    window.print();
  }

  openComparisonTool() {
    // This would open a modal or new section for comparing multiple predictions
    this.showStatusMessage('Comparison tool coming soon!', 'info');
  }

  // History Management
  savePredictionToHistory(prediction) {
    this.predictionHistory.unshift(prediction);
    if (this.predictionHistory.length > 10) {
      this.predictionHistory = this.predictionHistory.slice(0, 10);
    }
    
    try {
      localStorage.setItem('miniAgronomistHistory', JSON.stringify(this.predictionHistory));
      this.updateHistoryDisplay();
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
  }

  loadPredictionHistory() {
    try {
      const stored = localStorage.getItem('miniAgronomistHistory');
      if (stored) {
        this.predictionHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load from localStorage:', error);
      this.predictionHistory = [];
    }
  }

  clearPredictionHistory() {
    this.predictionHistory = [];
    localStorage.removeItem('miniAgronomistHistory');
    this.updateHistoryDisplay();
    this.showStatusMessage('History cleared', 'info');
  }

  updateHistoryDisplay() {
    const container = document.getElementById('historyContainer');
    if (!container) return;

    if (this.predictionHistory.length === 0) {
      container.innerHTML = `
        <div class="no-history">
          <span class="material-icons">bookmark_border</span>
          <p>No predictions yet. Make your first prediction to see history here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.predictionHistory.map(pred => `
      <div class="history-item" data-id="${pred.id}">
        <div class="history-header">
          <strong>${pred.inputs.crop} - ${pred.yieldEstimate} tons/ha</strong>
          <span class="history-date">${new Date(pred.timestamp).toLocaleDateString()}</span>
        </div>
        <div class="history-details">
          ${pred.inputs.region} • ${pred.inputs.soil} soil • ${pred.inputs.rainfall}mm/week
        </div>
      </div>
    `).join('');
  }

  // Modal Functions
  showHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.querySelector('.modal-close')?.focus();
    }
  }

  showSettingsModal() {
    // Create settings modal dynamically if it doesn't exist
    let settingsModal = document.getElementById('settingsModal');
    if (!settingsModal) {
      settingsModal = this.createSettingsModal();
      document.body.appendChild(settingsModal);
    }
    settingsModal.classList.remove('hidden');
    settingsModal.querySelector('.modal-close')?.focus();
  }

  createSettingsModal() {
    const modal = document.createElement('div');
    modal.id = 'settingsModal';
    modal.className = 'modal hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'settings-title');
    modal.setAttribute('aria-modal', 'true');
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="settings-title">⚙️ App Settings</h2>
          <button class="modal-close" aria-label="Close settings dialog">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="settings-section">
            <h3>🌍 Regional Preferences</h3>
            <label for="defaultRegion">Default Region:</label>
            <select id="defaultRegion">
              <option value="">Auto-detect</option>
              <option value="temperate">Temperate</option>
              <option value="tropical">Tropical</option>
              <option value="arid">Arid</option>
            </select>
          </div>
          
          <div class="settings-section">
            <h3>📊 Display Options</h3>
            <label>
              <input type="checkbox" id="showAdvancedMetrics" checked>
              Show advanced analytics
            </label>
            <label>
              <input type="checkbox" id="enableNotifications" checked>
              Enable prediction notifications
            </label>
          </div>
          
          <div class="settings-section">
            <h3>💾 Data Management</h3>
            <button type="button" class="tool-btn" onclick="this.clearHistory()">
              <span class="material-icons">delete</span>
              Clear All Data
            </button>
            <button type="button" class="tool-btn" onclick="this.exportSettings()">
              <span class="material-icons">download</span>
              Export Settings
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal(modal));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal(modal);
    });

    return modal;
  }

  closeModal(modal) {
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  // Utility Functions
  resetForm() {
    const form = document.getElementById('inputForm');
    if (form) {
      form.reset();
      
      // Clear validation states
      document.querySelectorAll('.field-status').forEach(status => {
        status.textContent = '';
        status.className = 'field-status';
      });
      
      document.querySelectorAll('input, select').forEach(field => {
        field.setAttribute('aria-invalid', 'false');
      });
    }
    
    this.resetResultsToPlaceholder();
    this.hideErrorMessage();
    this.showStatusMessage('Form reset', 'info');
  }

  resetResultsToPlaceholder() {
    const elements = {
      'conditionsSummary': 'Fill out the form and click "Generate Prediction" to see your crop yield prediction',
      'yieldResult': '🌱 Ready to predict',
      'confidence': 'Select your crop, soil type, rainfall, and planting date to get started'
    };
    
    Object.entries(elements).forEach(([id, text]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = text;
        element.className = element.className.replace(/(^|\s)(high|medium|low)(\s|$)/, '$1placeholder$3');
      }
    });
    
    // Hide enhanced sections
    ['analytics', 'harvestInfo'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.classList.add('hidden');
    });
    
    // Disable tool buttons
    ['exportBtn', 'compareBtn', 'printBtn'].forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) btn.disabled = true;
    });
    
    this.hideNewPredictionButton();
  }

  startNewPrediction() {
    this.resetForm();
    document.getElementById('region')?.focus();
  }

  showNewPredictionButton() {
    const btn = document.getElementById('newPrediction');
    if (btn) btn.classList.remove('hidden');
  }

  hideNewPredictionButton() {
    const btn = document.getElementById('newPrediction');
    if (btn) btn.classList.add('hidden');
  }

  renderEnhancedRiskBar(level) {
    const svg = document.getElementById("riskBar");
    if (!svg) return;

    const width = svg.clientWidth || 300;
    const filled = width * (1 - level);
    const color = level <= 0.3 ? "#4CAF50" : level <= 0.6 ? "#FFC107" : "#F44336";

    svg.innerHTML = `
      <rect x="0" y="8" width="${width}" height="24" fill="#E0E0E0" rx="12" />
      <rect x="0" y="8" width="${filled}" height="24" fill="${color}" rx="12">
        <animate attributeName="width" from="0" to="${filled}" dur="1s" />
      </rect>
    `;
  }

  // Keyboard Navigation
  handleKeyboardNavigation(event) {
    if (event.key === 'Escape') {
      document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
        this.closeModal(modal);
      });
    }
  }

  // Data Validation
  validateDataIntegrity() {
    const warnings = [];
    
    // Validate structure and required fields
    Object.entries(this.cropData).forEach(([region, crops]) => {
      Object.entries(crops).forEach(([crop, soils]) => {
        Object.entries(soils).forEach(([soil, rules]) => {
          const required = ['yield_range', 'rain_window', 'tip', 'source'];
          required.forEach(field => {
            if (!rules[field]) {
              warnings.push(`Missing ${field} for ${region}/${crop}/${soil}`);
            }
          });
        });
      });
    });

    if (warnings.length > 0) {
      console.warn('Data integrity warnings:', warnings);
    }
  }

  // Initialize components
  initializeComponents() {
    this.loadPredictionHistory();
    this.updateHistoryDisplay();
    this.resetResultsToPlaceholder();
  }

  // Helper functions
  getMonthNumber(monthName) {
    const months = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3,
      'May': 4, 'June': 5, 'July': 6, 'August': 7,
      'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    return months[monthName] ?? 0;
  }

  isWithinPlantingWindow(plantMonth, startMonth, endMonth) {
    if (startMonth <= endMonth) {
      return plantMonth >= startMonth && plantMonth <= endMonth;
    } else {
      return plantMonth >= startMonth || plantMonth <= endMonth;
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.miniAgronomist = new MiniAgronomist();
});
