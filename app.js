// Enhanced Mini Agronomist Application
// Version 2.0 Pro - Comprehensive agricultural yield prediction system with Pro features

class MiniAgronomist {
  constructor() {
    this.cropData = {};
    this.cropProfiles = {};
    this.regionData = {};
    this.proCropData = {}; // Pro specialty crops
    this.currentPrediction = null;
    this.predictionHistory = [];
    this.isLoading = false;
    
    // Pro feature managers
    this.proFeatureManager = null;
    this.fieldManager = null;
    this.advancedAnalytics = null;
    this.authManager = null; // Will be set by AuthManager when initialized
    this.pythonIntegration = null; // Will be set when Python loads
    
    this.init();
  }

  async init() {
    try {
      // Initialize Pro features first
      await this.initializeProFeatures();
      
      await this.loadData();
      this.setupEventListeners();
      this.setupFormValidation();
      
      // Wait for DOM to be ready before initializing components
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.initializeComponents();
        });
      } else {
        this.initializeComponents();
      }
      
      this.showStatusMessage('Application ready!', 'success');
    } catch (error) {
      this.handleError('Failed to initialize application', error);
    }
  }

  // Initialize Pro Features
  async initializeProFeatures() {
    // Initialize Pro Feature Manager
    if (window.ProFeatureManager) {
      this.proFeatureManager = new ProFeatureManager();
      
      // Initialize Field Manager if Pro features available
      if (this.proFeatureManager.hasFeature('fieldManagement') && window.FieldManager) {
        this.fieldManager = new FieldManager(this.proFeatureManager);
      }
      
      // Initialize Advanced Analytics if available
      if (this.proFeatureManager.hasFeature('advancedAnalytics') && window.AdvancedAnalytics) {
        this.advancedAnalytics = new AdvancedAnalytics(this.proFeatureManager, this.fieldManager);
      }
    }
  }

  // Python Integration Callback
  onPythonReady() {
    console.log('🐍 Python scientific computing is now available!');
    this.pythonIntegration = window.pythonIntegration;
    
    // Update UI to show Python-enhanced features
    this.updatePythonFeatureUI();
    
    // Show notification
    this.showMessage('🧮 Advanced scientific computing enabled! Enhanced predictions now available.', 'success');
  }

  updatePythonFeatureUI() {
    // Add Python badges to enhanced features
    const enhancedSections = document.querySelectorAll('.analytics-section, .pro-feature');
    enhancedSections.forEach(section => {
      if (!section.querySelector('.python-feature-badge')) {
        const badge = document.createElement('span');
        badge.className = 'python-feature-badge';
        badge.textContent = 'Scientific';
        section.appendChild(badge);
      }
    });
    
    // Enable advanced prediction options
    this.enableAdvancedPredictions();
  }

  enableAdvancedPredictions() {
    // Add advanced prediction toggle to existing predictions
    const predictionContainer = document.getElementById('predictionResult');
    if (predictionContainer && !document.getElementById('pythonEnhancedToggle')) {
      const advancedToggle = document.createElement('div');
      advancedToggle.innerHTML = `
        <div class="advanced-section python-available">
          <div class="advanced-section-header">
            <div class="advanced-section-title">
              🔬 Scientific Analysis
            </div>
            <button class="advanced-toggle" id="pythonEnhancedToggle">
              Enable Enhanced Predictions
            </button>
          </div>
          <div class="advanced-content" id="pythonEnhancedContent">
            <p>Get scientific-grade predictions using advanced algorithms:</p>
            <ul>
              <li>Growing Degree Day calculations</li>
              <li>Evapotranspiration modeling</li>
              <li>Water balance analysis</li>
              <li>Machine learning predictions</li>
            </ul>
          </div>
        </div>
      `;
      
      predictionContainer.appendChild(advancedToggle);
      
      // Add event listener
      document.getElementById('pythonEnhancedToggle').addEventListener('click', this.togglePythonPredictions.bind(this));
    }
  }

  async togglePythonPredictions() {
    const toggle = document.getElementById('pythonEnhancedToggle');
    const content = document.getElementById('pythonEnhancedContent');
    
    if (toggle.classList.contains('active')) {
      // Disable enhanced predictions
      toggle.classList.remove('active');
      content.classList.remove('visible');
      toggle.textContent = 'Enable Enhanced Predictions';
    } else {
      // Enable enhanced predictions
      toggle.classList.add('active');
      content.classList.add('visible');
      toggle.textContent = 'Enhanced Mode Active';
      
      // Re-run current prediction with Python enhancement
      if (this.currentPrediction) {
        await this.runPythonEnhancedPrediction();
      }
    }
  }

  async runPythonEnhancedPrediction() {
    if (!this.pythonIntegration?.isReady() || !this.currentPrediction) {
      return;
    }
    
    try {
      this.showLoadingOverlay('Running scientific analysis...');
      
      // Get current prediction data
      const currentData = this.currentPrediction;
      
      // Prepare data for Python analysis
      const predictionData = {
        temperature: {
          min: parseFloat(document.getElementById('tempMin')?.value || 20),
          max: parseFloat(document.getElementById('tempMax')?.value || 30),
          avg: (parseFloat(document.getElementById('tempMin')?.value || 20) + parseFloat(document.getElementById('tempMax')?.value || 30)) / 2
        },
        rainfall: parseFloat(document.getElementById('rainfall')?.value || 500),
        soilType: {
          ph: 7 // This would come from soil selection in a real implementation
        },
        cropData: currentData.crop || {},
        regionData: currentData.region || {}
      };
      
      // Run enhanced prediction
      const enhancedResults = await this.pythonIntegration.enhancedPrediction(predictionData);
      
      // Display enhanced results
      this.displayPythonResults(enhancedResults);
      
      this.hideLoadingOverlay();
      
    } catch (error) {
      console.error('Enhanced prediction error:', error);
      this.hideLoadingOverlay();
      this.showMessage('Enhanced prediction failed. Using standard prediction.', 'warning');
    }
  }

  displayPythonResults(results) {
    const content = document.getElementById('pythonEnhancedContent');
    if (!content) return;
    
    // Create enhanced results display
    const resultsHTML = `
      <div class="python-computation-result">
        <div class="computation-title">Growing Degree Days Analysis</div>
        <div class="computation-details">
          <div class="computation-metric">
            <span class="metric-value">${results.gdd?.toFixed(1) || 'N/A'}</span>
            <span class="metric-label">Daily GDD</span>
          </div>
        </div>
      </div>
      
      ${results.waterBalance ? `
      <div class="python-computation-result">
        <div class="computation-title">Water Balance Analysis</div>
        <div class="computation-details">
          <div class="computation-metric">
            <span class="metric-value">${results.waterBalance.soil_moisture?.toFixed(1) || 'N/A'}%</span>
            <span class="metric-label">Soil Moisture</span>
          </div>
          <div class="computation-metric">
            <span class="metric-value">${(results.waterBalance.water_stress * 100)?.toFixed(1) || 'N/A'}%</span>
            <span class="metric-label">Water Stress</span>
          </div>
          <div class="computation-metric">
            <span class="metric-value">${results.waterBalance.deficit?.toFixed(1) || 'N/A'}mm</span>
            <span class="metric-label">Water Deficit</span>
          </div>
        </div>
      </div>
      ` : ''}
      
      ${results.mlPrediction ? `
      <div class="python-computation-result">
        <div class="computation-title">Machine Learning Prediction</div>
        <div class="computation-details">
          <div class="computation-metric">
            <span class="metric-value">${results.mlPrediction.predicted_yield?.toFixed(2) || 'N/A'}</span>
            <span class="metric-label">Predicted Yield</span>
          </div>
          <div class="computation-metric">
            <span class="metric-value">${(results.mlPrediction.confidence * 100)?.toFixed(1) || 'N/A'}%</span>
            <span class="metric-label">Confidence</span>
          </div>
        </div>
      </div>
      ` : ''}
      
      <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(55, 118, 171, 0.1); border-radius: 8px; font-size: 0.85rem; color: var(--text-secondary);">
        <strong>🐍 Powered by Python Scientific Computing</strong><br>
        Advanced calculations using NumPy, SciPy, and Scikit-learn
      </div>
    `;
    
    // Replace existing content with enhanced results
    content.innerHTML = resultsHTML;
  }

  // Enhanced Data Loading with Pro features
  async loadData() {
    this.showLoadingOverlay('Loading agricultural data...');
    
    try {
      const loadPromises = [
        this.fetchJSON("data/crop_rules.json"),
        this.fetchJSON("data/crop_profiles.json"),
        this.fetchJSON("data/regions.json")
      ];

      // Load Pro data if available
      if (this.proFeatureManager?.hasFeature('advancedCrops')) {
        loadPromises.push(this.fetchJSON("data/pro-crop-data.json"));
      }

      const results = await Promise.all(loadPromises);
      
      this.cropData = results[0];
      this.cropProfiles = results[1];
      this.regionData = results[2];
      
      // Load Pro crop data if available
      if (results[3]) {
        this.proCropData = results[3];
        // Merge specialty crops into main crop profiles
        if (this.proCropData.specialty_crops) {
          this.cropProfiles = { ...this.cropProfiles, ...this.proCropData.specialty_crops };
        }
      }

      console.log("✅ Data loaded successfully:", {
        regions: Object.keys(this.regionData).length,
        crops: Object.keys(this.cropProfiles).length,
        rules: Object.keys(this.cropData).length,
        pro_features: this.proFeatureManager?.userTier || 'free'
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
    document.getElementById("rainfall")?.addEventListener("input", (e) => { this.validateField('rainfall', e.target.value); });
    document.getElementById("plantingDate")?.addEventListener("change", (e) => { this.validateField('plantingDate', e.target.value); });
    document.getElementById("region")?.addEventListener("change", (e) => { this.handleRegionChange(e.target.value); });
    document.getElementById("crop")?.addEventListener("change", (e) => { this.handleCropChange(e.target.value); });
    document.getElementById("soil")?.addEventListener("change", (e) => { this.validateField('soil', e.target.value); });

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
    
    // Mobile menu toggle
    document.getElementById("mobileMenuBtn")?.addEventListener("click", () => this.toggleMobileMenu());
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      const mobileMenu = document.querySelector('.nav-links');
      const mobileMenuBtn = document.getElementById('mobileMenuBtn');
      const headerContainer = document.querySelector('.header-container');
      
      if (mobileMenu?.classList.contains('mobile-open') && 
          !headerContainer?.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
    
    // Modal close handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    
    // Enhanced header scroll behavior
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const header = document.querySelector('header');
      const currentScrollY = window.scrollY;
      
      if (header) {
        if (currentScrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
      
      lastScrollY = currentScrollY;
    });
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
          // Prefer global if script already loaded
          if (window.AdvancedPredictionEngine) {
            this.advancedEngine = new window.AdvancedPredictionEngine();
          } else {
            // Attempt dynamic import from js/ path (optional)
            const module = await import('./js/advanced_prediction_engine.js');
            const AdvancedPredictionEngine = module?.default || window.AdvancedPredictionEngine;
            if (AdvancedPredictionEngine) {
              this.advancedEngine = new AdvancedPredictionEngine();
            }
          }
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

  // Enhanced dropdown population with Pro features
  populateDropdowns() {
    try {
      this.populateRegionDropdown();
      this.populateCropDropdown();
      
      // Initialize Pro features if available
      if (this.proFeatureManager) {
        this.initializeProUI();
      }
      
      console.log("✅ Dropdowns populated successfully");
    } catch (error) {
      console.error("❌ Error populating dropdowns:", error);
      this.showError("Failed to initialize application. Please refresh and try again.", 5000);
    }
  }

  // Initialize Pro UI elements
  initializeProUI() {
    try {
      // Add Pro indicators to specialty crops
      const cropSelect = document.getElementById("crop");
      if (cropSelect && this.proCropData?.specialty_crops) {
        for (const [cropId, cropData] of Object.entries(this.proCropData.specialty_crops)) {
          const option = cropSelect.querySelector(`option[value="${cropId}"]`);
          if (option) {
            option.textContent += " 🌟 Pro";
            option.classList.add("pro-crop");
          }
        }
      }

      // Add Pro features to UI
      this.addProFeatureButtons();
      this.updateUIForTier();
      
      console.log("✅ Pro UI initialized for tier:", this.proFeatureManager.userTier);
    } catch (error) {
      console.error("❌ Error initializing Pro UI:", error);
    }
  }

  // Add Pro feature buttons to interface
  addProFeatureButtons() {
    const container = document.querySelector('.container');
    if (!container) return;

    // Create Pro features section
    const proSection = document.createElement('div');
    proSection.className = 'pro-features-section';
    proSection.innerHTML = `
      <div class="pro-features-header">
        <h3>🌟 Professional Features</h3>
        <span class="tier-badge tier-${this.proFeatureManager.userTier}">${this.proFeatureManager.userTier.toUpperCase()}</span>
      </div>
      <div class="pro-features-grid">
        ${this.generateProFeatureButtons()}
      </div>
    `;

    // Insert after prediction form
    const form = document.querySelector('.prediction-form');
    if (form) {
      form.after(proSection);
    }
  }

  // Generate Pro feature buttons based on user tier
  generateProFeatureButtons() {
    const userTier = 'free'; // Default tier when auth is disabled

    const features = [
      {
        id: 'field-manager',
        title: 'Field Manager',
        description: 'Track and manage multiple fields',
        icon: '🏞️',
        feature: 'fieldManagement',
        tier: 'pro'
      },
      {
        id: 'advanced-analytics',
        title: 'Advanced Analytics',
        description: 'Yield prediction and profitability analysis',
        icon: '📊',
        feature: 'advancedAnalytics',
        tier: 'enterprise'
      },
      {
        id: 'specialty-crops',
        title: 'Specialty Crops',
        description: 'Access to high-value crop varieties',
        icon: '🌿',
        feature: 'advancedCrops',
        tier: 'pro'
      },
      {
        id: 'export-data',
        title: 'Data Export',
        description: 'Export reports and predictions',
        icon: '📈',
        feature: 'dataExport',
        tier: 'pro'
      }
    ];

    return features.map(feature => {
      let hasAccess = false;
      let buttonText = '🔒 Sign In';
      let buttonClass = 'locked';
      let isDisabled = true;

      if (!isAuthenticated) {
        hasAccess = false;
        buttonText = '🔒 Sign In';
      } else if (this.proFeatureManager?.hasFeature(feature.feature)) {
        hasAccess = true;
        buttonText = 'Open';
        buttonClass = 'primary';
        isDisabled = false;
      } else if (userTier === 'pro' && feature.tier === 'enterprise') {
        hasAccess = false;
        buttonText = '⭐ Enterprise';
      } else {
        hasAccess = false;
        buttonText = `🔒 ${feature.tier.toUpperCase()}`;
      }

      return `
        <div class="pro-feature-card ${hasAccess ? 'available' : 'locked'}" data-feature-id="${feature.id}">
          <div class="feature-icon">${feature.icon}</div>
          <h4>${feature.title}</h4>
          <p>${feature.description}</p>
          <button 
            class="feature-btn ${buttonClass}" 
            onclick="miniAgronomist.handleProFeature('${feature.id}')"
            ${isDisabled ? 'disabled' : ''}
          >
            ${buttonText}
          </button>
        </div>
      `;
    }).join('');
  }

  // Handle Pro feature activation with gating
  handleProFeature(featureId) {
    try {
      // Pro features are available for now (auth disabled)
      // Will be gated when authentication is re-enabled
      
      switch (featureId) {
        case 'field-manager':
          if (this.proFeatureManager?.hasFeature('fieldManagement')) {
            this.openFieldManager();
          } else {
            this.showMessage('Field Manager feature coming soon!', 'info');
          }
          break;
        case 'advanced-analytics':
          if (this.proFeatureManager?.hasFeature('advancedAnalytics')) {
            this.openAdvancedAnalytics();
          } else {
            this.showMessage('Advanced Analytics feature coming soon!', 'info');
          }
          break;
        case 'specialty-crops':
          if (this.proFeatureManager?.hasFeature('advancedCrops')) {
            this.showSpecialtyCrops();
          } else {
            this.showMessage('Specialty Crops feature coming soon!', 'info');
          }
          break;
        case 'export-data':
          if (this.proFeatureManager?.hasFeature('dataExport')) {
            this.exportData();
          } else {
            this.showMessage('Export Data feature coming soon!', 'info');
          }
          break;
        default:
          console.warn('Unknown Pro feature:', featureId);
      }
    } catch (error) {
      console.error('Error handling Pro feature:', error);
      this.showError('Failed to access Pro feature. Please try again.');
    }
  }

  // Update UI based on user tier
  updateUIForTier() {
    const tier = this.proFeatureManager.userTier;
    document.body.classList.add(`tier-${tier}`);
    
    // Update UI elements based on tier
    if (tier === 'free') {
      this.showUpgradePrompts();
    }
  }

  // Show upgrade prompts for free tier users
  showUpgradePrompts() {
    // Add subtle upgrade prompts in the UI
    const upgradeHints = document.querySelectorAll('.upgrade-hint');
    upgradeHints.forEach(hint => {
      hint.style.display = 'block';
    });
  }

  // Pro Feature Methods
  openFieldManager() {
    if (!this.proFeatureManager.hasFeature('fieldManagement')) {
      this.showUpgradeModal('Field Management');
      return;
    }

    // Create field manager modal
    const modal = this.createModal('Field Manager', this.generateFieldManagerHTML());
    document.body.appendChild(modal);
    this.initializeFieldManagerEvents();
  }

  openAdvancedAnalytics() {
    if (!this.proFeatureManager.hasFeature('advancedAnalytics')) {
      this.showUpgradeModal('Advanced Analytics');
      return;
    }

    // Create analytics modal
    const modal = this.createModal('Advanced Analytics', this.generateAnalyticsHTML());
    document.body.appendChild(modal);
    this.initializeAnalyticsEvents();
  }

  showSpecialtyCrops() {
    if (!this.proFeatureManager.hasFeature('advancedCrops')) {
      this.showUpgradeModal('Specialty Crops');
      return;
    }

    // Highlight specialty crops in dropdown
    this.highlightSpecialtyCrops();
    this.showMessage('🌟 Specialty crops are now highlighted in the crop selection!', 'success');
  }

  exportData() {
    if (!this.proFeatureManager.hasFeature('dataExport')) {
      this.showUpgradeModal('Data Export');
      return;
    }

    this.generateDataExport();
  }

  // Create modal for Pro features
  createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'pro-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="this.closest('.pro-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;
    return modal;
  }

  // Generate Field Manager HTML
  generateFieldManagerHTML() {
    return `
      <div class="field-manager">
        <div class="field-manager-toolbar">
          <button class="btn primary" onclick="miniAgronomist.addNewField()">
            + Add New Field
          </button>
          <button class="btn secondary" onclick="miniAgronomist.importFields()">
            📁 Import Fields
          </button>
        </div>
        <div class="fields-list" id="fieldsList">
          ${this.generateFieldsList()}
        </div>
      </div>
    `;
  }

  // Generate Analytics HTML
  generateAnalyticsHTML() {
    return `
      <div class="analytics-dashboard">
        <div class="analytics-tabs">
          <button class="tab-btn active" data-tab="yield">Yield Analysis</button>
          <button class="tab-btn" data-tab="profit">Profitability</button>
          <button class="tab-btn" data-tab="risk">Risk Assessment</button>
          <button class="tab-btn" data-tab="sustainability">Sustainability</button>
        </div>
        <div class="analytics-content">
          <div class="tab-panel active" id="yield-panel">
            <div class="analytics-placeholder">
              📊 Advanced yield predictions and historical analysis will appear here
            </div>
          </div>
          <div class="tab-panel" id="profit-panel">
            <div class="analytics-placeholder">
              💰 Profitability analysis and market insights will appear here
            </div>
          </div>
          <div class="tab-panel" id="risk-panel">
            <div class="analytics-placeholder">
              ⚠️ Risk assessment and mitigation strategies will appear here
            </div>
          </div>
          <div class="tab-panel" id="sustainability-panel">
            <div class="analytics-placeholder">
              🌱 Sustainability metrics and recommendations will appear here
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Show upgrade modal for locked features with tier-specific messaging
  showUpgradePrompt(requiredTier, featureName) {
    const tierMessages = {
      pro: {
        title: 'Upgrade to Pro',
        subtitle: 'Unlock Professional Features',
        benefits: [
          '✓ 100 predictions per day (vs 10 free)',
          '✓ Manage up to 25 fields',
          '✓ All crop varieties included',
          '✓ Advanced analytics & insights',
          '✓ Data export in multiple formats',
          '✓ Priority support'
        ],
        price: '$9.99/month or $99/year',
        cta: 'Upgrade to Pro'
      },
      enterprise: {
        title: 'Enterprise Plan',
        subtitle: 'Unlock Enterprise Features',
        benefits: [
          '✓ Unlimited predictions',
          '✓ Unlimited fields & custom crops',
          '✓ Advanced analytics dashboard',
          '✓ REST API access',
          '✓ White-label deployment',
          '✓ Dedicated support team'
        ],
        price: 'Contact sales for pricing',
        cta: 'Contact Sales'
      }
    };

    const tierInfo = tierMessages[requiredTier] || tierMessages.pro;
    const featureDisplay = featureName?.replace(/([A-Z])/g, ' $1').trim() || 'this feature';

    const modal = this.createModal('Upgrade Required', `
      <div class="upgrade-modal">
        <div class="upgrade-icon">🌟</div>
        <h3>${tierInfo.title}</h3>
        <p class="upgrade-subtitle">${tierInfo.subtitle}</p>
        <p class="upgrade-feature">Unlock <strong>${featureDisplay}</strong> and more.</p>
        <div class="upgrade-benefits">
          <ul>
            ${tierInfo.benefits.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
        <div class="upgrade-price"><strong>${tierInfo.price}</strong></div>
        <div class="upgrade-actions">
          <button class="btn primary" onclick="miniAgronomist.simulateUpgrade('${requiredTier}')">
            ${tierInfo.cta}
          </button>
          <button class="btn secondary" onclick="this.closest('.pro-modal').remove()">
            Maybe Later
          </button>
        </div>
      </div>
    `);
    document.body.appendChild(modal);
  }

  // Simulate upgrade for demo purposes
  simulateUpgrade(tier = 'pro') {
    this.proFeatureManager.userTier = tier;
    localStorage.setItem('miniAgronomist-pro-status', 'active');
    localStorage.setItem('miniAgronomist_tier', tier);
    
    // Close any open modals
    document.querySelectorAll('.pro-modal').forEach(modal => modal.remove());
    
    // Refresh Pro features
    if (this.proFeatureManager) {
      this.proFeatureManager.userTier = tier;
      this.proFeatureManager.features = this.proFeatureManager.initializeFeatures();
      this.proFeatureManager.limits = this.proFeatureManager.getUserLimits();
      this.proFeatureManager.updateUIVisibility();
    }

    // Update UI
    this.updateUIForTier();
    this.showMessage(`🎉 ${tier.toUpperCase()} features activated! You now have access to all premium features.`, 'success', 5000);
    
    // Refresh the page to show new features
    setTimeout(() => location.reload(), 2000);
  }

  // Additional Pro feature helper methods
  generateFieldsList() {
    const fields = this.fieldManager?.getFields() || [];
    
    if (fields.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">🏞️</div>
          <h4>No fields yet</h4>
          <p>Start by adding your first field to track crop performance and analytics.</p>
        </div>
      `;
    }

    return fields.map(field => `
      <div class="field-card">
        <div class="field-header">
          <h4>${field.name}</h4>
          <span class="field-size">${field.size} ${field.sizeUnit}</span>
        </div>
        <div class="field-details">
          <p><strong>Location:</strong> ${field.location}</p>
          <p><strong>Soil Type:</strong> ${field.soilType}</p>
          <p><strong>Current Crop:</strong> ${field.currentCrop || 'None'}</p>
        </div>
        <div class="field-actions">
          <button class="btn secondary" onclick="miniAgronomist.editField('${field.id}')">
            Edit
          </button>
          <button class="btn secondary" onclick="miniAgronomist.viewFieldAnalytics('${field.id}')">
            Analytics
          </button>
        </div>
      </div>
    `).join('');
  }

  highlightSpecialtyCrops() {
    const cropSelect = document.getElementById("crop");
    if (!cropSelect) return;

    // Remove existing highlights
    cropSelect.querySelectorAll('option').forEach(option => {
      option.classList.remove('specialty-highlight');
    });

    // Add highlights to specialty crops
    if (this.proCropData?.specialty_crops) {
      Object.keys(this.proCropData.specialty_crops).forEach(cropId => {
        const option = cropSelect.querySelector(`option[value="${cropId}"]`);
        if (option) {
          option.classList.add('specialty-highlight');
          option.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
          option.style.color = '#333';
          option.style.fontWeight = '600';
        }
      });
    }

    // Animate the dropdown to draw attention
    cropSelect.style.animation = 'pulse 1.5s ease-in-out 3';
  }

  generateDataExport() {
    const exportData = {
      timestamp: new Date().toISOString(),
      user_tier: this.proFeatureManager.userTier,
      predictions: this.lastPrediction || null,
      fields: this.fieldManager?.getFields() || [],
      analytics: this.advancedAnalytics?.getLastAnalysis() || null,
      usage_stats: this.proFeatureManager.getUsageStats()
    };

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mini-agronomist-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showMessage('📊 Data exported successfully!', 'success');
  }

  initializeFieldManagerEvents() {
    const modal = document.querySelector('.pro-modal');
    if (!modal) return;

    // Tab switching for analytics
    const tabBtns = modal.querySelectorAll('.tab-btn');
    const tabPanels = modal.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // Update active states
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        const targetPanel = document.getElementById(`${targetTab}-panel`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  initializeAnalyticsEvents() {
    const modal = document.querySelector('.pro-modal');
    if (!modal) return;

    // Tab switching functionality
    const tabBtns = modal.querySelectorAll('.tab-btn');
    const tabPanels = modal.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetTab = btn.dataset.tab;
        
        // Update active states
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        const targetPanel = document.getElementById(`${targetTab}-panel`);
        if (targetPanel) {
          targetPanel.classList.add('active');
          
          // Load analytics data for the selected tab
          await this.loadAnalyticsData(targetTab, targetPanel);
        }
      });
    });

    // Load initial analytics data
    this.loadAnalyticsData('yield', document.getElementById('yield-panel'));
  }

  async loadAnalyticsData(tabType, panel) {
    if (!panel || !this.advancedAnalytics) return;

    // Show loading state
    panel.innerHTML = '<div class="analytics-loading">📊 Loading analytics...</div>';

    try {
      let analyticsHTML = '';
      
      switch (tabType) {
        case 'yield':
          analyticsHTML = await this.generateYieldAnalytics();
          break;
        case 'profit':
          analyticsHTML = await this.generateProfitabilityAnalytics();
          break;
        case 'risk':
          analyticsHTML = await this.generateRiskAnalytics();
          break;
        case 'sustainability':
          analyticsHTML = await this.generateSustainabilityAnalytics();
          break;
      }

      panel.innerHTML = analyticsHTML;
    } catch (error) {
      panel.innerHTML = `
        <div class="analytics-error">
          <span class="material-icons">error</span>
          <p>Unable to load analytics data</p>
        </div>
      `;
    }
  }

  async generateYieldAnalytics() {
    const fields = this.fieldManager?.getFields() || [];
    const predictions = this.loadPredictionHistory();

    return `
      <div class="analytics-dashboard">
        <div class="analytics-grid">
          <div class="metric-card">
            <div class="metric-header">
              <span class="material-icons">trending_up</span>
              <h4>Average Yield Prediction</h4>
            </div>
            <div class="metric-value">${this.calculateAverageYield(predictions)} tons/ha</div>
            <div class="metric-trend positive">+12% vs last season</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-header">
              <span class="material-icons">agriculture</span>
              <h4>Total Managed Area</h4>
            </div>
            <div class="metric-value">${this.calculateTotalArea(fields)} ha</div>
            <div class="metric-trend neutral">No change</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-header">
              <span class="material-icons">eco</span>
              <h4>Best Performing Crop</h4>
            </div>
            <div class="metric-value">${this.getBestCrop(predictions)}</div>
            <div class="metric-trend positive">High confidence</div>
          </div>
        </div>
        
        <div class="chart-container">
          <h4>Yield Predictions by Crop Type</h4>
          ${this.generateYieldChart(predictions)}
        </div>
        
        <div class="recommendations">
          <h4>🎯 Yield Optimization Recommendations</h4>
          <ul>
            <li>Consider switching 20% of corn fields to soybeans for nitrogen fixation</li>
            <li>Optimal planting window: March 15-30 based on current weather patterns</li>
            <li>Apply precision fertilization to boost yield by 8-15%</li>
          </ul>
        </div>
      </div>
    `;
  }

  async generateProfitabilityAnalytics() {
    return `
      <div class="analytics-dashboard">
        <div class="analytics-grid">
          <div class="metric-card">
            <div class="metric-header">
              <span class="material-icons">attach_money</span>
              <h4>Projected Revenue</h4>
            </div>
            <div class="metric-value">$24,580</div>
            <div class="metric-trend positive">+18% projected</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-header">
              <span class="material-icons">account_balance</span>
              <h4>Cost per Hectare</h4>
            </div>
            <div class="metric-value">$1,250</div>
            <div class="metric-trend negative">+5% vs last year</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-header">
              <span class="material-icons">trending_up</span>
              <h4>ROI Estimate</h4>
            </div>
            <div class="metric-value">165%</div>
            <div class="metric-trend positive">Excellent</div>
          </div>
        </div>
        
        <div class="profit-analysis">
          <h4>💰 Profitability Breakdown</h4>
          <div class="profit-chart">
            <div class="profit-item">
              <span>Revenue</span>
              <div class="profit-bar revenue" style="width: 100%"></div>
              <span>$24,580</span>
            </div>
            <div class="profit-item">
              <span>Costs</span>
              <div class="profit-bar costs" style="width: 60%"></div>
              <span>$14,750</span>
            </div>
            <div class="profit-item">
              <span>Profit</span>
              <div class="profit-bar profit" style="width: 40%"></div>
              <span>$9,830</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async generateRiskAnalytics() {
    return `
      <div class="analytics-dashboard">
        <div class="risk-matrix">
          <h4>⚠️ Risk Assessment Matrix</h4>
          <div class="risk-grid">
            <div class="risk-category low">
              <span class="material-icons">check_circle</span>
              <h5>Weather Risk</h5>
              <p>Low - Favorable conditions expected</p>
            </div>
            <div class="risk-category medium">
              <span class="material-icons">warning</span>
              <h5>Market Risk</h5>
              <p>Medium - Price volatility expected</p>
            </div>
            <div class="risk-category low">
              <span class="material-icons">bug_report</span>
              <h5>Pest Risk</h5>
              <p>Low - Minimal pest pressure</p>
            </div>
            <div class="risk-category high">
              <span class="material-icons">opacity</span>
              <h5>Drought Risk</h5>
              <p>High - Below average rainfall predicted</p>
            </div>
          </div>
        </div>
        
        <div class="mitigation-strategies">
          <h4>🛡️ Risk Mitigation Strategies</h4>
          <div class="strategy-list">
            <div class="strategy-item">
              <span class="material-icons">water_drop</span>
              <div>
                <h5>Drought Mitigation</h5>
                <p>Install drip irrigation system, select drought-resistant varieties</p>
              </div>
            </div>
            <div class="strategy-item">
              <span class="material-icons">trending_down</span>
              <div>
                <h5>Market Risk</h5>
                <p>Consider futures contracts, diversify crop portfolio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async generateSustainabilityAnalytics() {
    return `
      <div class="analytics-dashboard">
        <div class="sustainability-score">
          <h4>🌱 Sustainability Score</h4>
          <div class="score-circle">
            <div class="score-value">82</div>
            <div class="score-label">out of 100</div>
          </div>
        </div>
        
        <div class="sustainability-metrics">
          <div class="metric-item">
            <span class="material-icons">co2</span>
            <div>
              <h5>Carbon Footprint</h5>
              <p>2.1 tons CO₂/ha (15% below average)</p>
            </div>
          </div>
          <div class="metric-item">
            <span class="material-icons">water_drop</span>
            <div>
              <h5>Water Efficiency</h5>
              <p>350L/kg yield (12% more efficient)</p>
            </div>
          </div>
          <div class="metric-item">
            <span class="material-icons">eco</span>
            <div>
              <h5>Soil Health</h5>
              <p>Good - Improving with rotation</p>
            </div>
          </div>
        </div>
        
        <div class="sustainability-recommendations">
          <h4>🌿 Sustainability Improvements</h4>
          <ul>
            <li>Implement cover crops to improve soil organic matter</li>
            <li>Reduce synthetic nitrogen by 20% using legume rotation</li>
            <li>Install precision application equipment to reduce chemical use</li>
          </ul>
        </div>
      </div>
    `;
  }

  // Helper methods for analytics calculations
  calculateAverageYield(predictions) {
    if (!predictions || predictions.length === 0) return '3.2';
    const total = predictions.reduce((sum, pred) => sum + (pred.yieldEstimate || 0), 0);
    return (total / predictions.length).toFixed(1);
  }

  calculateTotalArea(fields) {
    if (!fields || fields.length === 0) return '12.5';
    return fields.reduce((total, field) => total + (field.size || 0), 0).toFixed(1);
  }

  getBestCrop(predictions) {
    if (!predictions || predictions.length === 0) return 'Soybeans';
    // Simple implementation - could be more sophisticated
    return 'Soybeans';
  }

  generateYieldChart(predictions) {
    // Simple text-based chart - could be enhanced with actual charting library
    return `
      <div class="simple-chart">
        <div class="chart-bar">
          <span>Corn</span>
          <div class="bar" style="width: 80%; background: #4CAF50;"></div>
          <span>4.2 t/ha</span>
        </div>
        <div class="chart-bar">
          <span>Soybeans</span>
          <div class="bar" style="width: 65%; background: #2196F3;"></div>
          <span>3.1 t/ha</span>
        </div>
        <div class="chart-bar">
          <span>Wheat</span>
          <div class="bar" style="width: 90%; background: #FF9800;"></div>
          <span>5.8 t/ha</span>
        </div>
      </div>
    `;
  }

  // Enhanced field management implementation
  addNewField() {
    const modal = this.createModal('Add New Field', this.generateAddFieldHTML());
    document.body.appendChild(modal);
    this.initializeAddFieldEvents(modal);
  }

  generateAddFieldHTML() {
    return `
      <div class="field-form">
        <form id="addFieldForm">
          <div class="form-grid">
            <div class="form-group">
              <label for="fieldName">Field Name *</label>
              <input type="text" id="fieldName" name="fieldName" required 
                     placeholder="e.g., North Field, Corn Plot A">
            </div>
            
            <div class="form-group">
              <label for="fieldLocation">Location</label>
              <input type="text" id="fieldLocation" name="fieldLocation" 
                     placeholder="Farm address or coordinates">
            </div>
            
            <div class="form-group">
              <label for="fieldSize">Field Size *</label>
              <input type="number" id="fieldSize" name="fieldSize" required 
                     min="0.1" step="0.1" placeholder="5.5">
            </div>
            
            <div class="form-group">
              <label for="fieldSizeUnit">Size Unit</label>
              <select id="fieldSizeUnit" name="fieldSizeUnit">
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="sqm">Square Meters</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="fieldSoilType">Primary Soil Type *</label>
              <select id="fieldSoilType" name="fieldSoilType" required>
                <option value="">Select soil type...</option>
                <option value="loam">Loam</option>
                <option value="clay">Clay</option>
                <option value="sand">Sandy</option>
                <option value="silt">Silt</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="fieldCurrentCrop">Current Crop</label>
              <select id="fieldCurrentCrop" name="fieldCurrentCrop">
                <option value="">None/Fallow</option>
                ${this.generateCropOptions()}
              </select>
            </div>
            
            <div class="form-group full-width">
              <label for="fieldNotes">Notes</label>
              <textarea id="fieldNotes" name="fieldNotes" rows="3" 
                        placeholder="Additional field information..."></textarea>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="this.closest('.pro-modal').remove()">
              Cancel
            </button>
            <button type="submit" class="btn primary">
              <span class="material-icons">add</span>
              Add Field
            </button>
          </div>
        </form>
      </div>
    `;
  }

  generateCropOptions() {
    if (!this.cropProfiles) return '';
    
    return Object.entries(this.cropProfiles).map(([key, crop]) => 
      `<option value="${key}">${crop.scientific_name || key}</option>`
    ).join('');
  }

  initializeAddFieldEvents(modal) {
    const form = modal.querySelector('#addFieldForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddField(form);
    });
  }

  handleAddField(form) {
    const formData = new FormData(form);
    const fieldData = {
      id: `field_${Date.now()}`,
      name: formData.get('fieldName'),
      location: formData.get('fieldLocation'),
      size: parseFloat(formData.get('fieldSize')),
      sizeUnit: formData.get('fieldSizeUnit'),
      soilType: formData.get('fieldSoilType'),
      currentCrop: formData.get('fieldCurrentCrop'),
      notes: formData.get('fieldNotes'),
      createdAt: new Date().toISOString(),
      history: []
    };

    // Validate required fields
    if (!fieldData.name || !fieldData.size || !fieldData.soilType) {
      this.showMessage('Please fill in all required fields', 'error');
      return;
    }

    // Add to field manager
    if (this.fieldManager) {
      this.fieldManager.createField(fieldData);
      this.showMessage(`✅ Field "${fieldData.name}" added successfully!`, 'success');
      
      // Close modal and refresh field list
      form.closest('.pro-modal').remove();
      
      // Refresh field manager if open
      const fieldManagerModal = document.querySelector('.pro-modal .field-manager');
      if (fieldManagerModal) {
        const fieldsList = fieldManagerModal.querySelector('#fieldsList');
        if (fieldsList) {
          fieldsList.innerHTML = this.generateFieldsList();
        }
      }
    }
  }

  importFields() {
    this.showMessage('🚧 Field import functionality coming soon!', 'info');
  }

  editField(fieldId) {
    this.showMessage(`🚧 Editing field ${fieldId} - coming soon!`, 'info');
  }

  viewFieldAnalytics(fieldId) {
    this.showMessage(`🚧 Field analytics for ${fieldId} - coming soon!`, 'info');
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

  // Enhanced Modal Functions
  showHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
      modal.classList.remove('hidden');
      
      // Initialize FAQ functionality
      this.initializeFAQModal();
      
      // Focus management
      const firstTab = modal.querySelector('.faq-tab');
      if (firstTab) firstTab.focus();
    }
  }

  initializeFAQModal() {
    // Tab functionality
    const tabs = document.querySelectorAll('.faq-tab');
    const contents = document.querySelectorAll('.faq-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        const targetContent = document.getElementById(tab.dataset.tab);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });

    // FAQ search functionality
    const searchInput = document.getElementById('faqModalSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterFAQContent(e.target.value.toLowerCase());
      });
    }

    // FAQ item toggle functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isActive = question.classList.contains('active');
        
        // Close all other FAQ items
        faqQuestions.forEach(q => {
          q.classList.remove('active');
          q.nextElementSibling.classList.remove('active');
        });
        
        // Toggle current item
        if (!isActive) {
          question.classList.add('active');
          answer.classList.add('active');
        }
      });
    });
  }

  filterFAQContent(searchTerm) {
    const faqItems = document.querySelectorAll('.faq-item');
    const helpSteps = document.querySelectorAll('.help-step');
    
    // Filter FAQ items
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question').textContent.toLowerCase();
      const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
      
      if (question.includes(searchTerm) || answer.includes(searchTerm)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
    
    // Filter help steps
    helpSteps.forEach(step => {
      const content = step.textContent.toLowerCase();
      
      if (content.includes(searchTerm)) {
        step.style.display = 'flex';
      } else {
        step.style.display = 'none';
      }
    });
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
      <div class="modal-content" onclick="event.stopPropagation()">
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
    this.initializeWelcomeBanner();
    this.initializeScannerBanner();
  }

  // Welcome Banner functionality
  initializeWelcomeBanner() {
    const welcomeBanner = document.getElementById('welcomeBanner');
    const dismissButton = document.getElementById('dismissWelcome');

    // Check if user has seen welcome before
    const hasSeenWelcome = localStorage.getItem('mini-agronomist-welcome-dismissed');

    if (hasSeenWelcome) {
      welcomeBanner?.classList.add('hidden');
      return; // Don't set up event listeners if already dismissed
    }

    // Handle dismiss button
    dismissButton?.addEventListener('click', () => {
      welcomeBanner?.classList.add('hidden');
      localStorage.setItem('mini-agronomist-welcome-dismissed', 'true');
      this.showStatusMessage('Welcome! Start by selecting your region above.', 'info');
    });

    // Auto-hide after 15 seconds if user doesn't interact
    setTimeout(() => {
      if (welcomeBanner && !welcomeBanner.classList.contains('hidden')) {
        welcomeBanner.classList.add('hidden');
        localStorage.setItem('mini-agronomist-welcome-dismissed', 'true');
      }
    }, 15000);
  }

  // Scanner Banner functionality
  initializeScannerBanner() {
    const scannerBanner = document.getElementById('scannerBanner');

    // Check if user has dismissed scanner banner before
    const hasDismissedScanner = localStorage.getItem('mini-agronomist-scanner-dismissed');

    if (hasDismissedScanner) {
      return; // Don't show if dismissed
    }

    // Show the banner
    scannerBanner.style.display = 'block';

    // Handle dismiss button
    const dismissBtn = document.getElementById('dismissScanner');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        scannerBanner.style.display = 'none';
        localStorage.setItem('mini-agronomist-scanner-dismissed', 'true');
      });
    }

    // Auto-hide after 20 seconds if user doesn't interact
    setTimeout(() => {
      if (scannerBanner && scannerBanner.style.display !== 'none') {
        scannerBanner.style.display = 'none';
        localStorage.setItem('mini-agronomist-scanner-dismissed', 'true');
      }
    }, 20000);
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

  // Mobile menu functionality
  toggleMobileMenu() {
    const mobileMenu = document.querySelector('.nav-links');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const menuIcon = mobileMenuBtn?.querySelector('.material-icons');
    
    if (mobileMenu) {
      const isOpen = mobileMenu.classList.toggle('mobile-open');
      
      // Update button icon
      if (menuIcon) {
        menuIcon.textContent = isOpen ? 'close' : 'menu';
      }
      
      // Update aria attributes
      mobileMenuBtn?.setAttribute('aria-expanded', isOpen.toString());
      mobileMenuBtn?.setAttribute('title', isOpen ? '✕ Close Menu' : '🔽 Open Menu');
    }
  }
  
  closeMobileMenu() {
    const mobileMenu = document.querySelector('.nav-links');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const menuIcon = mobileMenuBtn?.querySelector('.material-icons');
    
    if (mobileMenu?.classList.contains('mobile-open')) {
      mobileMenu.classList.remove('mobile-open');
      
      // Reset button icon
      if (menuIcon) {
        menuIcon.textContent = 'menu';
      }
      
      // Update aria attributes
      mobileMenuBtn?.setAttribute('aria-expanded', 'false');
      mobileMenuBtn?.setAttribute('title', '🔽 Open Menu');
    }
  }

  isWithinPlantingWindow(plantMonth, startMonth, endMonth) {
    if (startMonth <= endMonth) {
      return plantMonth >= startMonth && plantMonth <= endMonth;
    } else {
      return plantMonth >= startMonth || plantMonth <= endMonth;
    }
  }
}

// ========================================
// THEME TOGGLE
// ========================================
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Toggle theme class
  if (newTheme === 'dark') {
    body.classList.add('dark-theme');
  } else {
    body.classList.remove('dark-theme');
  }
  
  // Update theme button icon
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    const icon = themeBtn.querySelector('.material-icons');
    if (icon) {
      // Main app uses material icons
      icon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
    } else {
      // Plant scanner uses emoji
      themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
  }
  
  // Save preference
  localStorage.setItem('theme', newTheme);
  
  // Show toast notification
  const themeName = newTheme === 'dark' ? 'Dark' : 'Light';
  console.log(`🎨 Switched to ${themeName} Mode`);
}

// Load saved theme on page load
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
  
  // Update button icon
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    const icon = themeBtn.querySelector('.material-icons');
    if (icon) {
      // Main app uses material icons
      icon.textContent = savedTheme === 'dark' ? 'light_mode' : 'dark_mode';
    } else {
      // Plant scanner uses emoji
      themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  }
}

// Load theme immediately (before DOM ready to avoid flash)
loadSavedTheme();

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.miniAgronomist = new MiniAgronomist();
  loadSavedTheme(); // Ensure theme is applied after DOM loads
});
