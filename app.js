<<<<<<< HEAD
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
=======
let cropData = {};
let cropProfiles = {};
let regionData = {};

// Load all data files when the app starts
Promise.all([
  fetch("data/crop_rules.json").then(res => res.json()),
  fetch("data/crop_profiles.json").then(res => res.json()),
  fetch("data/regions.json").then(res => res.json())
])
.then(([rules, profiles, regions]) => {
  cropData = rules;
  cropProfiles = profiles;
  regionData = regions;
  
  console.log("Data loaded successfully:", {
    regions: Object.keys(regionData).length,
    crops: Object.keys(cropProfiles).length,
    rules: Object.keys(cropData).length
  });
  
  validateCropData(cropData); // Run JSON structure checks
  populateRegionDropdown(); // Populate region dropdown with real data
  populateCropDropdown(); // Populate crop dropdown with real data
})
.catch(err => {
  console.error("Error loading crop data:", err);
  document.getElementById("errorLog").innerHTML = `<p>❌ Could not load agricultural data. Check your JSON files or folder path.</p>`;
  document.getElementById("errorLog").classList.remove("hidden");
});

// Add real-time validation
document.getElementById("rainfall").addEventListener("input", validateRainfall);
document.getElementById("plantingDate").addEventListener("change", validatePlantingDate);

// Add reset form functionality
document.getElementById("resetForm").addEventListener("click", resetForm);

// Initialize history display and clear button
document.addEventListener('DOMContentLoaded', function() {
  updateHistoryDisplay();
  resetResultsToPlaceholder(); // Initialize with placeholder content
  
  const clearBtn = document.getElementById('clearHistory');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearPredictionHistory);
  }
  
  const newPredictionBtn = document.getElementById('newPrediction');
  if (newPredictionBtn) {
    newPredictionBtn.addEventListener('click', startNewPrediction);
  }
  
  // Add region change listener to update soil options
  const regionSelect = document.getElementById("region");
  if (regionSelect) {
    regionSelect.addEventListener("change", function() {
      updateSoilOptions(this.value);
    });
  }
});

// Listen for form submission (when user clicks "Predict")
document.getElementById("inputForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent the page from reloading

  // Show loading state
  showLoadingState();

  // Get values from the form
  const region = document.getElementById("region").value;
  const soil = document.getElementById("soil").value;
  const crop = document.getElementById("crop").value;
  const rainfall = parseInt(document.getElementById("rainfall").value);
  const plantingDate = new Date(document.getElementById("plantingDate").value);

  const errorBox = document.getElementById("errorLog");
  const errors = [];

  // Enhanced form validation with specific messages
  if (!region) {
    errors.push("❌ Please select your agricultural region for accurate predictions.");
  }
  
  if (!soil || !crop) {
    errors.push("❌ Please select both crop and soil type to continue.");
  }
  
  if (isNaN(rainfall)) {
    errors.push("❌ Rainfall amount is required.");
  } else if (rainfall < 0) {
    errors.push("❌ Rainfall cannot be negative.");
  } else if (rainfall > 500) {
    errors.push("⚠️ Rainfall above 500mm/week is extremely high. Please verify your input.");
  }
  
  if (!plantingDate || plantingDate.toString() === "Invalid Date") {
    errors.push("❌ Please select a valid planting date.");
  } else {
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    
    if (plantingDate < today) {
      errors.push("⚠️ Planting date is in the past. Consider updating to a future date.");
    } else if (plantingDate > oneYearFromNow) {
      errors.push("⚠️ Planting date is more than a year from now. Long-term predictions may be less accurate.");
    }
  }

  if (errors.length > 0) {
    // Show the error messages in the yellow box
    errorBox.innerHTML = errors.map(e => `<p>${e}</p>`).join("");
    errorBox.classList.remove("hidden");
    hideLoadingState();
    return;
  } else {
    // Hide errors if everything is good
    errorBox.innerHTML = "";
    errorBox.classList.add("hidden");
  }

  // Simulate processing time for better UX
  setTimeout(() => {
    processPrediction(soil, crop, rainfall, plantingDate, region);
  }, 300);
});

function processPrediction(soil, crop, rainfall, plantingDate, region) {
  // Run the prediction based on inputs
  const result = calculateYield(crop, soil, rainfall, plantingDate, region);

  // Handle unknown combo
  if (!result) {
    document.getElementById("yieldResult").textContent = 
      "❌ Sorry, no prediction data available for this combination. Try different soil or crop types.";
    document.getElementById("yieldResult").classList.remove("placeholder");
    document.getElementById("tip").textContent = "";
    document.getElementById("tip").classList.remove("placeholder");
    renderRiskBar(1); // Max risk
    hideLoadingState();
    showNewPredictionButton();
    return;
  }

  // Show prediction result
  const { yieldEstimate, tip, riskLevel, source } = result;

  // Save to history
  savePredictionToHistory({
    soil,
    crop,
    rainfall,
    plantingDate: plantingDate.toISOString().split('T')[0],
    yieldEstimate,
    riskLevel
  });

  const cropIcons = {
    maize: "agriculture",
    groundnuts: "spa", 
    sorghum: "grass"
  };
  const iconName = cropIcons[crop] || "eco";

  // Remove placeholder classes and update content
  document.getElementById("cropIcon").textContent = iconName;
  
  const conditionsSummary = document.getElementById("conditionsSummary");
  const regionDisplayName = regionData[region]?.display_name || region;
  conditionsSummary.textContent = `Region: ${regionDisplayName} | Soil: ${soil.charAt(0).toUpperCase() + soil.slice(1)} | Rainfall: ${rainfall} mm/week`;
  conditionsSummary.classList.remove("placeholder");
  
  const yieldResult = document.getElementById("yieldResult");
  yieldResult.textContent = `📊 Estimated Yield: ${yieldEstimate} tons/ha`;
  yieldResult.classList.remove("placeholder");
  
  const confidence = document.getElementById("confidence");
  confidence.textContent = riskLevel <= 0.3 ? "✅ Conditions are near optimal for this crop."
    : riskLevel <= 0.6 ? "⚠️ Conditions are moderate - some adjustments recommended."
    : "❗ Conditions are challenging - follow tips carefully.";
  confidence.classList.remove("placeholder");
  
  const tipElement = document.getElementById("tip");
  
  // Enhanced tip display with harvest date and varieties
  let tipHTML = `<strong>💡 Recommendation:</strong> ${tip}`;
  
  if (result.harvestDate) {
    const harvestDisplay = result.harvestDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
    tipHTML += `<br><strong>�️ Expected Harvest:</strong> ${harvestDisplay}`;
  }
  
  if (result.varieties && result.varieties.length > 0) {
    tipHTML += `<br><strong>🌱 Recommended Varieties:</strong> ${result.varieties.join(", ")}`;
  }
  
  tipHTML += `<br><small><em>📚 Source: ${source}</em></small>`;
  
  tipElement.innerHTML = tipHTML;
  tipElement.classList.remove("placeholder");
  
  hideLoadingState();
  renderRiskBar(riskLevel);
  updateHistoryDisplay();
  showNewPredictionButton();
}

// Enhanced yield calculation using the three-tier data structure
function calculateYield(crop, soil, rainfall, plantingDate, region) {
  // Check if we have data for this combination
  if (!cropData[region] || !cropData[region][crop] || !cropData[region][crop][soil]) {
    return null;
  }
  
  const cropRules = cropData[region][crop][soil];
  const cropProfile = cropProfiles[crop];
  const regionInfo = regionData[region];
  
  if (!cropProfile || !regionInfo) {
    return null;
  }
  
  // Get base yield range from region-specific rules
  const [minYield, maxYield] = cropRules.yield_range;
  
  // Calculate rainfall impact
  const [minRain, maxRain] = cropRules.rain_window;
  const rainScore = calculateRainfallScore(rainfall, minRain, maxRain);
  
  // Calculate planting timing impact
  const timingValidation = validatePlantingTiming(region, crop, plantingDate);
  const seasonScore = timingValidation.valid ? 0.9 : 0.6; // Reduced score for poor timing
  
  // Calculate water requirement match
  const annualRainfall = regionInfo.annual_rainfall_mm;
  const waterRequirement = (cropProfile.water_requirement_mm[0] + cropProfile.water_requirement_mm[1]) / 2;
  const waterMatchScore = Math.min(1.0, annualRainfall / waterRequirement);
  
  // Calculate soil pH compatibility
  const soilProfile = regionInfo.soil_profiles.find(s => s.type === soil);
  const cropPHRange = cropProfile.soil_ph_range;
  let pHScore = 1.0;
  
  if (soilProfile) {
    const soilPHMid = (soilProfile.ph_range[0] + soilProfile.ph_range[1]) / 2;
    const cropPHMid = (cropPHRange[0] + cropPHRange[1]) / 2;
    const pHDiff = Math.abs(soilPHMid - cropPHMid);
    pHScore = Math.max(0.3, 1.0 - (pHDiff / 2.0)); // Penalize pH mismatch
  }
  
  // Combine all factors with weights
  const finalScore = (
    rainScore * 0.35 +           // Rainfall is most important
    seasonScore * 0.25 +         // Timing is crucial
    waterMatchScore * 0.25 +     // Water requirement match
    pHScore * 0.15               // Soil pH compatibility
  );
  
  // Calculate final yield estimate
  const predictedYield = minYield + (maxYield - minYield) * finalScore;
  
  // Calculate risk level (inverse of confidence)
  const riskLevel = 1 - finalScore;
  
  // Calculate harvest date
  const harvestDate = calculateHarvestDate(plantingDate, crop);
  
  // Get region-specific variety recommendations
  const recommendedVarieties = regionInfo.common_varieties[crop] || cropProfile.common_varieties.slice(0, 2);
  
  // Build comprehensive tip
  let enhancedTip = cropRules.tip;
  
  if (!timingValidation.valid) {
    enhancedTip += ` ${timingValidation.message}`;
  }
  
  if (recommendedVarieties.length > 0) {
    enhancedTip += ` Recommended varieties for this region: ${recommendedVarieties.join(", ")}.`;
  }
  
  if (harvestDate) {
    const harvestMonth = harvestDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    enhancedTip += ` Expected harvest: ${harvestMonth}.`;
  }
  
  // Add region-specific tips
  if (regionInfo.region_tips && regionInfo.region_tips.length > 0) {
    enhancedTip += ` Regional advice: ${regionInfo.region_tips[0]}`;
  }
  
  return {
    yieldEstimate: predictedYield.toFixed(1),
    tip: enhancedTip,
    riskLevel: riskLevel,
    source: cropRules.source,
    harvestDate: harvestDate,
    varieties: recommendedVarieties,
    timingMessage: timingValidation.message
  };
}

// Draw animated risk bar using inline SVG
function renderRiskBar(level) {
  const svg = document.getElementById("riskBar");
  svg.innerHTML = "";

  const width = svg.clientWidth;
  const filled = width * (1 - level);
  const color = level <= 0.3 ? "#4CAF50" : level <= 0.6 ? "#FFC107" : "#F44336";

  const bg = `<rect x="0" y="5" width="${width}" height="20" fill="#e0e0e0" rx="4" />`;
  const fg = `<rect id="riskFg" x="0" y="5" width="0" height="20" fill="${color}" rx="4" />`;

  svg.innerHTML = bg + fg;

  // Animate bar fill
  setTimeout(() => {
    document.getElementById("riskFg").setAttribute("width", filled);
  }, 100);
}

// Check crop_rules.json for missing fields or bad data
function validateCropData(data) {
  const warnings = [];

  // Validate the new three-tier structure: region -> crop -> soil
  Object.keys(data).forEach(region => {
    if (typeof data[region] !== 'object') return;
    
    Object.keys(data[region]).forEach(crop => {
      if (typeof data[region][crop] !== 'object') return;
      
      Object.keys(data[region][crop]).forEach(soil => {
        const rule = data[region][crop][soil];
        const requiredFields = ["yield_range", "rain_window", "tip", "source"];
        
        requiredFields.forEach(field => {
          if (
            !(field in rule) ||
            rule[field] === null ||
            rule[field] === "" ||
            (Array.isArray(rule[field]) && rule[field].length !== 2)
          ) {
            warnings.push(`⚠️ ${region}/${crop}/${soil} is missing or has invalid '${field}'.`);
          }
        });
      });
    });
  });

  const errorBox = document.getElementById("errorLog");
  if (warnings.length > 0) {
    console.warn("🚧 Validation Warnings:");
    warnings.forEach(w => console.warn(w));
    errorBox.innerHTML += warnings.map(w => `<p>${w}</p>`).join("");
    errorBox.classList.remove("hidden");
  }
}

// Loading state management
function showLoadingState() {
  const button = document.querySelector('button[type="submit"]');
  button.disabled = true;
  button.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
  button.classList.add('loading');
}

function hideLoadingState() {
  const button = document.querySelector('button[type="submit"]');
  button.disabled = false;
  button.innerHTML = 'Predict';
  button.classList.remove('loading');
}

// Real-time validation functions
function validateRainfall() {
  const rainfallInput = document.getElementById("rainfall");
  const value = parseInt(rainfallInput.value);
  const feedbackElement = document.getElementById("rainfall-feedback");
  
  // Clear previous feedback
  if (feedbackElement) feedbackElement.remove();
  
  let message = "";
  let className = "";
  
  if (isNaN(value)) return;
  
  if (value < 0) {
    message = "❌ Rainfall cannot be negative";
    className = "error-feedback";
  } else if (value > 500) {
    message = "⚠️ Very high rainfall - please verify";
    className = "warning-feedback";
  } else if (value > 200) {
    message = "⚠️ High rainfall detected";
    className = "warning-feedback";
  } else if (value >= 30 && value <= 120) {
    message = "✅ Good rainfall range for most crops";
    className = "success-feedback";
  }
  
  if (message) {
    const feedback = document.createElement("small");
    feedback.id = "rainfall-feedback";
    feedback.className = className;
    feedback.textContent = message;
    rainfallInput.parentNode.appendChild(feedback);
  }
}

function validatePlantingDate() {
  const dateInput = document.getElementById("plantingDate");
  const value = new Date(dateInput.value);
  const feedbackElement = document.getElementById("date-feedback");
  
  // Clear previous feedback
  if (feedbackElement) feedbackElement.remove();
  
  if (!dateInput.value) return;
  
  let message = "";
  let className = "";
  const today = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  
  if (value < today) {
    message = "⚠️ Date is in the past";
    className = "warning-feedback";
  } else if (value > oneYearFromNow) {
    message = "⚠️ Long-term prediction - less accurate";
    className = "warning-feedback";
  } else {
    const monthsFromNow = (value - today) / (1000 * 60 * 60 * 24 * 30);
    if (monthsFromNow <= 6) {
      message = "✅ Good timing for prediction";
      className = "success-feedback";
    }
  }
  
  if (message) {
    const feedback = document.createElement("small");
    feedback.id = "date-feedback";
    feedback.className = className;
    feedback.textContent = message;
    dateInput.parentNode.appendChild(feedback);
  }
}

// Prediction history management
function savePredictionToHistory(prediction) {
  try {
    const history = getPredictionHistory();
    const newPrediction = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...prediction
    };
    
    history.unshift(newPrediction);
    
    // Keep only last 10 predictions
    if (history.length > 10) {
      history.splice(10);
    }
    
    localStorage.setItem('mini-agronomist-history', JSON.stringify(history));
  } catch (e) {
    console.warn('Could not save prediction to history:', e);
  }
}

function getPredictionHistory() {
  try {
    const history = localStorage.getItem('mini-agronomist-history');
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.warn('Could not load prediction history:', e);
    return [];
  }
}

function clearPredictionHistory() {
  if (confirm('Are you sure you want to clear all prediction history? This action cannot be undone.')) {
    localStorage.removeItem('mini-agronomist-history');
    updateHistoryDisplay();
    
    // Show confirmation message
    const errorBox = document.getElementById("errorLog");
    errorBox.innerHTML = "<p class='centered-notification'>🗑️ History cleared</p>";
    errorBox.classList.remove("hidden");
    
    // Auto-hide the message after 2 seconds
    setTimeout(() => {
      errorBox.classList.add("hidden");
    }, 2000);
  }
}

function updateHistoryDisplay() {
  const historyContainer = document.getElementById('historyContainer');
  if (!historyContainer) return;
  
  const history = getPredictionHistory();
  
  if (history.length === 0) {
    historyContainer.innerHTML = '<p class="no-history">No recent predictions</p>';
    return;
  }
  
  const historyHTML = history.map((pred, index) => `
    <div class="history-item ${index === 0 ? 'latest' : ''}">
      <div class="history-header-item">
        <strong>${pred.crop.charAt(0).toUpperCase() + pred.crop.slice(1)} on ${pred.soil} soil</strong>
        <small>${new Date(pred.timestamp).toLocaleDateString()}</small>
      </div>
      <div class="history-details">
        <span class="yield-highlight">${pred.yieldEstimate} tons/ha</span> | ${pred.rainfall}mm/week
      </div>
    </div>
  `).join('');
  
  historyContainer.innerHTML = historyHTML;
}

// Form reset functionality
function resetForm() {
  // Reset all form fields
  document.getElementById("inputForm").reset();
  
  // Clear validation feedback
  const feedbackElements = document.querySelectorAll('.error-feedback, .warning-feedback, .success-feedback');
  feedbackElements.forEach(el => el.remove());
  
  // Reset results to placeholder state
  resetResultsToPlaceholder();
  
  // Hide any error messages
  const errorBox = document.getElementById("errorLog");
  errorBox.innerHTML = "";
  errorBox.classList.add("hidden");
  
  // Focus on first input
  document.getElementById("soil").focus();
}

function resetResultsToPlaceholder() {
  // Reset crop icon
  document.getElementById("cropIcon").textContent = "eco";
  
  // Reset conditions summary
  const conditionsSummary = document.getElementById("conditionsSummary");
  conditionsSummary.textContent = "Fill out the form and click \"Predict Yield\" to see your crop yield prediction";
  conditionsSummary.classList.add("placeholder");
  
  // Reset yield result
  const yieldResult = document.getElementById("yieldResult");
  yieldResult.textContent = "🌱 Ready to predict";
  yieldResult.classList.add("placeholder");
  
  // Reset confidence indicator
  const confidence = document.getElementById("confidence");
  confidence.textContent = "Select your crop, soil type, rainfall, and planting date to get started";
  confidence.classList.add("placeholder");
  
  // Reset tip section
  const tipElement = document.getElementById("tip");
  tipElement.innerHTML = "<strong>💡 Tips will appear here:</strong> Get personalized recommendations based on your specific crop and soil conditions.";
  tipElement.classList.add("placeholder");
  
  // Reset risk bar to empty state
  const svg = document.getElementById("riskBar");
  svg.innerHTML = '<rect x="0" y="5" width="100%" height="20" fill="#e0e0e0" rx="4" />';
  
  // Hide new prediction button
  hideNewPredictionButton();
}

function showNewPredictionButton() {
  const newPredictionBtn = document.getElementById('newPrediction');
  if (newPredictionBtn) {
    newPredictionBtn.classList.remove('hidden');
  }
}

function hideNewPredictionButton() {
  const newPredictionBtn = document.getElementById('newPrediction');
  if (newPredictionBtn) {
    newPredictionBtn.classList.add('hidden');
  }
}

function startNewPrediction() {
  // Reset form and results to placeholder state
  resetForm();
  
  // Show notification AFTER reset to prevent it from being cleared
  setTimeout(() => {
    const errorBox = document.getElementById("errorLog");
    errorBox.innerHTML = "<p class='centered-notification'>✨ New prediction started</p>";
    errorBox.classList.remove("hidden");
    
    // Auto-hide the message after 2 seconds
    setTimeout(() => {
      errorBox.classList.add("hidden");
      errorBox.innerHTML = ""; // Clear the content too
    }, 2000);
  }, 50); // Small delay to ensure reset is complete
}

// Helper functions for the new three-tier data structure

function populateRegionDropdown() {
  const regionSelect = document.getElementById("region");
  if (!regionSelect) return;
  
  // Clear existing options except the first placeholder
  while (regionSelect.children.length > 1) {
    regionSelect.removeChild(regionSelect.lastChild);
  }
  
  // Add regions from data
  Object.entries(regionData).forEach(([key, region]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = region.display_name;
    regionSelect.appendChild(option);
  });
}

function populateCropDropdown() {
  const cropSelect = document.getElementById("crop");
  if (!cropSelect) return;
  
  // Clear existing options except the first placeholder
  while (cropSelect.children.length > 1) {
    cropSelect.removeChild(cropSelect.lastChild);
  }
  
  // Add crops from profiles
  Object.entries(cropProfiles).forEach(([key, profile]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)} (${profile.scientific_name})`;
    cropSelect.appendChild(option);
  });
}

function updateSoilOptions(selectedRegion) {
  const soilSelect = document.getElementById("soil");
  if (!soilSelect || !selectedRegion || !regionData[selectedRegion]) return;
  
  // Clear existing options except the first placeholder
  while (soilSelect.children.length > 1) {
    soilSelect.removeChild(soilSelect.lastChild);
  }
  
  // Add soil types available in the selected region
  const availableSoils = regionData[selectedRegion].soil_profiles;
  availableSoils.forEach(soilProfile => {
    const option = document.createElement("option");
    option.value = soilProfile.type;
    option.textContent = `${soilProfile.type.charAt(0).toUpperCase() + soilProfile.type.slice(1)} (pH: ${soilProfile.ph_range[0]}-${soilProfile.ph_range[1]})`;
    soilSelect.appendChild(option);
  });
}

function calculateHarvestDate(plantingDate, crop) {
  if (!cropProfiles[crop]) return null;
  
  const daysToMaturity = cropProfiles[crop].days_to_maturity;
  const avgDays = (daysToMaturity[0] + daysToMaturity[1]) / 2;
  
  const harvestDate = new Date(plantingDate);
  harvestDate.setDate(harvestDate.getDate() + avgDays);
  
  return harvestDate;
}

function validatePlantingTiming(region, crop, plantingDate) {
  if (!regionData[region] || !regionData[region].planting_windows[crop]) {
    return { valid: true, message: "No specific timing data available for this combination." };
  }
  
  const window = regionData[region].planting_windows[crop];
  const plantingMonth = plantingDate.getMonth(); // 0-11
  
  // Convert month names to numbers
  const monthNames = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"];
  
  const startMonth = monthNames.indexOf(window.start);
  const endMonth = monthNames.indexOf(window.end);
  
  let isInWindow = false;
  if (startMonth <= endMonth) {
    // Normal case: April to June
    isInWindow = plantingMonth >= startMonth && plantingMonth <= endMonth;
  } else {
    // Wrapping case: November to January
    isInWindow = plantingMonth >= startMonth || plantingMonth <= endMonth;
  }
  
  if (!isInWindow) {
    return {
      valid: false,
      message: `⚠️ Optimal planting window for ${crop} in this region is ${window.start}-${window.end}.`
    };
  }
  
  return { valid: true, message: "✅ Planting timing is within the optimal window." };
}

// Missing calculation functions
function calculateRainfallScore(actualRainfall, minRain, maxRain) {
  if (actualRainfall < minRain) {
    // Below minimum - penalty for drought stress
    return Math.max(0, 1 - (minRain - actualRainfall) / minRain);
  } else if (actualRainfall > maxRain) {
    // Above maximum - penalty for excess water/flooding
    return Math.max(0, 1 - (actualRainfall - maxRain) / maxRain);
  } else {
    // Within optimal range
    const range = maxRain - minRain;
    const position = (actualRainfall - minRain) / range;
    // Peak at 60% of the range, then slight decline
    return position <= 0.6 ? 0.7 + position * 0.5 : 1.0 - (position - 0.6) * 0.2;
  }
}

function calculateSeasonScore(plantingDate, crop) {
  // Basic seasonal scoring - this is simplified
  // In a real implementation, this would use crop-specific growing seasons
  const month = plantingDate.getMonth(); // 0-11
  
  // Simple heuristic: penalize very early or very late planting
  if (month < 2 || month > 10) {
    return 0.6; // Winter planting penalty
  } else if (month >= 3 && month <= 8) {
    return 0.9; // Good growing season
  } else {
    return 0.8; // Moderate season
  }
}
>>>>>>> c276696f34853a1fae9b9c7e6da44cd6622dc483
