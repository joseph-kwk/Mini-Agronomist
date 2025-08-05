// Mini Agronomist Pro - Field Management System
// Advanced field tracking and management for professional farmers

class FieldManager {
  constructor(proFeatureManager) {
    this.proManager = proFeatureManager;
    this.fields = this.loadFields();
    this.currentField = null;
    this.fieldTemplates = this.initializeTemplates();
    this.init();
  }

  // Initialize field management system
  init() {
    if (!this.proManager.hasFeature('fieldManagement')) {
      console.log('Field Management requires Pro subscription');
      return;
    }

    this.setupFieldUI();
    this.loadActiveField();
    console.log('🚜 Field Management System initialized');
  }

  // Load fields from storage
  loadFields() {
    return JSON.parse(localStorage.getItem('mini-agronomist-fields') || '{}');
  }

  // Save fields to storage
  saveFields() {
    localStorage.setItem('mini-agronomist-fields', JSON.stringify(this.fields));
  }

  // Create new field
  createField(fieldData) {
    const fieldId = this.generateFieldId();
    const field = {
      id: fieldId,
      name: fieldData.name,
      location: fieldData.location,
      size_hectares: fieldData.size_hectares,
      coordinates: fieldData.coordinates || null,
      soil_type: fieldData.soil_type,
      irrigation: fieldData.irrigation || 'none',
      slope: fieldData.slope || 'flat',
      previous_crops: fieldData.previous_crops || [],
      created_date: new Date().toISOString(),
      active: true,
      
      // Pro Features
      crops_history: [],
      soil_tests: [],
      weather_data: [],
      financial_records: {
        investments: [],
        revenues: [],
        costs: []
      },
      notes: [],
      photos: [],
      
      // Analytics
      performance_metrics: {
        avg_yield: 0,
        best_season: null,
        roi: 0,
        sustainability_score: 0
      }
    };

    this.fields[fieldId] = field;
    this.saveFields();
    return field;
  }

  // Get field by ID
  getField(fieldId) {
    return this.fields[fieldId];
  }

  // Update field
  updateField(fieldId, updates) {
    if (this.fields[fieldId]) {
      this.fields[fieldId] = { ...this.fields[fieldId], ...updates };
      this.fields[fieldId].last_updated = new Date().toISOString();
      this.saveFields();
      return this.fields[fieldId];
    }
    return null;
  }

  // Delete field
  deleteField(fieldId) {
    if (this.fields[fieldId]) {
      delete this.fields[fieldId];
      this.saveFields();
      return true;
    }
    return false;
  }

  // Add crop record to field
  addCropRecord(fieldId, cropData) {
    const field = this.getField(fieldId);
    if (!field) return false;

    const record = {
      id: this.generateRecordId(),
      crop: cropData.crop,
      variety: cropData.variety,
      planting_date: cropData.planting_date,
      expected_harvest: cropData.expected_harvest,
      actual_harvest: null,
      predicted_yield: cropData.predicted_yield,
      actual_yield: null,
      status: 'planted',
      season: this.getSeason(cropData.planting_date),
      inputs: {
        seeds: cropData.seeds || {},
        fertilizers: cropData.fertilizers || [],
        pesticides: cropData.pesticides || [],
        labor_hours: cropData.labor_hours || 0
      },
      costs: {
        seeds: 0,
        fertilizers: 0,
        pesticides: 0,
        labor: 0,
        equipment: 0,
        total: 0
      },
      weather_conditions: [],
      notes: []
    };

    field.crops_history.push(record);
    this.updateField(fieldId, { crops_history: field.crops_history });
    return record;
  }

  // Add soil test result
  addSoilTest(fieldId, testData) {
    const field = this.getField(fieldId);
    if (!field) return false;

    const soilTest = {
      id: this.generateRecordId(),
      date: testData.date || new Date().toISOString(),
      ph: testData.ph,
      organic_matter: testData.organic_matter,
      nitrogen: testData.nitrogen,
      phosphorus: testData.phosphorus,
      potassium: testData.potassium,
      micronutrients: testData.micronutrients || {},
      recommendations: testData.recommendations || [],
      lab_report: testData.lab_report || null
    };

    field.soil_tests.push(soilTest);
    this.updateField(fieldId, { soil_tests: field.soil_tests });
    return soilTest;
  }

  // Calculate field performance
  calculateFieldPerformance(fieldId) {
    const field = this.getField(fieldId);
    if (!field || !field.crops_history.length) return null;

    const completedCrops = field.crops_history.filter(crop => crop.actual_yield);
    if (!completedCrops.length) return null;

    // Calculate average yield
    const avgYield = completedCrops.reduce((sum, crop) => sum + crop.actual_yield, 0) / completedCrops.length;

    // Find best performing season
    const seasonPerformance = {};
    completedCrops.forEach(crop => {
      if (!seasonPerformance[crop.season]) {
        seasonPerformance[crop.season] = { total: 0, count: 0 };
      }
      seasonPerformance[crop.season].total += crop.actual_yield;
      seasonPerformance[crop.season].count += 1;
    });

    let bestSeason = null;
    let bestAvg = 0;
    Object.keys(seasonPerformance).forEach(season => {
      const avg = seasonPerformance[season].total / seasonPerformance[season].count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestSeason = season;
      }
    });

    // Calculate ROI
    const totalRevenue = completedCrops.reduce((sum, crop) => sum + (crop.revenue || 0), 0);
    const totalCosts = completedCrops.reduce((sum, crop) => sum + crop.costs.total, 0);
    const roi = totalCosts > 0 ? ((totalRevenue - totalCosts) / totalCosts) * 100 : 0;

    const performance = {
      avg_yield: Math.round(avgYield * 100) / 100,
      best_season: bestSeason,
      roi: Math.round(roi * 100) / 100,
      total_seasons: completedCrops.length,
      sustainability_score: this.calculateSustainabilityScore(field)
    };

    this.updateField(fieldId, { performance_metrics: performance });
    return performance;
  }

  // Calculate sustainability score
  calculateSustainabilityScore(field) {
    let score = 50; // baseline

    // Crop rotation bonus
    const uniqueCrops = new Set(field.crops_history.map(crop => crop.crop));
    if (uniqueCrops.size > 1) score += 20;
    if (uniqueCrops.size > 3) score += 10;

    // Legume inclusion bonus
    const hasLegumes = field.crops_history.some(crop => 
      ['groundnuts', 'soybeans', 'common_beans'].includes(crop.crop)
    );
    if (hasLegumes) score += 15;

    // Organic matter improvement
    const recentSoilTests = field.soil_tests.slice(-2);
    if (recentSoilTests.length >= 2) {
      const improvement = recentSoilTests[1].organic_matter - recentSoilTests[0].organic_matter;
      if (improvement > 0) score += 15;
      else if (improvement < -0.5) score -= 10;
    }

    // Pesticide usage penalty
    const avgPesticideUse = field.crops_history.reduce((sum, crop) => 
      sum + (crop.inputs.pesticides?.length || 0), 0) / field.crops_history.length;
    if (avgPesticideUse > 3) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  // Get field summary
  getFieldSummary(fieldId) {
    const field = this.getField(fieldId);
    if (!field) return null;

    const activeCrops = field.crops_history.filter(crop => 
      ['planted', 'growing', 'flowering'].includes(crop.status)
    );

    const performance = this.calculateFieldPerformance(fieldId);

    return {
      id: field.id,
      name: field.name,
      size: field.size_hectares,
      location: field.location,
      active_crops: activeCrops.length,
      total_seasons: field.crops_history.length,
      performance: performance,
      last_soil_test: field.soil_tests.length ? 
        field.soil_tests[field.soil_tests.length - 1].date : null,
      status: activeCrops.length > 0 ? 'active' : 'fallow'
    };
  }

  // Generate field templates
  initializeTemplates() {
    return {
      smallholder: {
        name: "Smallholder Farm",
        typical_size: 2,
        crops: ["maize", "groundnuts", "sorghum"],
        irrigation: "rain_fed",
        management_level: "basic"
      },
      commercial: {
        name: "Commercial Farm",
        typical_size: 50,
        crops: ["maize", "soybeans", "rice"],
        irrigation: "center_pivot",
        management_level: "advanced"
      },
      specialty: {
        name: "Specialty Crop Farm",
        typical_size: 10,
        crops: ["avocado", "coffee_arabica", "vanilla"],
        irrigation: "drip",
        management_level: "intensive"
      }
    };
  }

  // Setup field management UI
  setupFieldUI() {
    this.createFieldDashboard();
    this.setupFieldSelector();
  }

  // Create field dashboard
  createFieldDashboard() {
    const dashboard = document.createElement('div');
    dashboard.id = 'fieldDashboard';
    dashboard.className = 'field-dashboard pro-feature';
    dashboard.innerHTML = `
      <div class="dashboard-header">
        <h3>🚜 Field Management</h3>
        <button id="addFieldBtn" class="btn btn-primary">+ Add Field</button>
      </div>
      <div class="fields-grid" id="fieldsGrid">
        <!-- Fields will be populated here -->
      </div>
    `;

    // Insert after welcome banner
    const welcomeBanner = document.getElementById('welcomeBanner');
    if (welcomeBanner) {
      welcomeBanner.insertAdjacentElement('afterend', dashboard);
    }

    this.populateFieldsGrid();
  }

  // Populate fields grid
  populateFieldsGrid() {
    const grid = document.getElementById('fieldsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    
    Object.values(this.fields).forEach(field => {
      const summary = this.getFieldSummary(field.id);
      const fieldCard = this.createFieldCard(summary);
      grid.appendChild(fieldCard);
    });
  }

  // Create field card
  createFieldCard(summary) {
    const card = document.createElement('div');
    card.className = 'field-card';
    card.innerHTML = `
      <div class="field-header">
        <h4>${summary.name}</h4>
        <span class="field-status ${summary.status}">${summary.status}</span>
      </div>
      <div class="field-details">
        <p>📏 Size: ${summary.size} ha</p>
        <p>📍 Location: ${summary.location}</p>
        <p>🌱 Active Crops: ${summary.active_crops}</p>
        <p>📊 Total Seasons: ${summary.total_seasons}</p>
        ${summary.performance ? `
          <p>📈 Avg Yield: ${summary.performance.avg_yield} t/ha</p>
          <p>💰 ROI: ${summary.performance.roi}%</p>
        ` : ''}
      </div>
      <div class="field-actions">
        <button onclick="fieldManager.selectField('${summary.id}')" class="btn btn-sm">Select</button>
        <button onclick="fieldManager.editField('${summary.id}')" class="btn btn-sm btn-secondary">Edit</button>
      </div>
    `;
    return card;
  }

  // Utility functions
  generateFieldId() {
    return 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateRecordId() {
    return 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getSeason(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  // Load active field
  loadActiveField() {
    const activeFieldId = localStorage.getItem('mini-agronomist-active-field');
    if (activeFieldId && this.fields[activeFieldId]) {
      this.currentField = this.fields[activeFieldId];
    }
  }

  // Select field
  selectField(fieldId) {
    this.currentField = this.fields[fieldId];
    localStorage.setItem('mini-agronomist-active-field', fieldId);
    this.updateFieldSelector();
    
    // Trigger field selection event
    document.dispatchEvent(new CustomEvent('fieldSelected', { 
      detail: { field: this.currentField } 
    }));
  }

  // Setup field selector
  setupFieldSelector() {
    // Add field selector to main form
    const formSection = document.querySelector('.form-section');
    if (formSection && Object.keys(this.fields).length > 0) {
      const selector = document.createElement('div');
      selector.className = 'form-group field-selector';
      selector.innerHTML = `
        <label for="fieldSelect">🚜 Select Field</label>
        <select id="fieldSelect" class="form-control">
          <option value="">Choose a field...</option>
          ${Object.values(this.fields).map(field => 
            `<option value="${field.id}" ${this.currentField?.id === field.id ? 'selected' : ''}>
              ${field.name} (${field.size_hectares} ha)
            </option>`
          ).join('')}
        </select>
      `;
      
      formSection.insertBefore(selector, formSection.firstChild);
      
      // Add event listener
      document.getElementById('fieldSelect').addEventListener('change', (e) => {
        if (e.target.value) {
          this.selectField(e.target.value);
        }
      });
    }
  }

  updateFieldSelector() {
    const selector = document.getElementById('fieldSelect');
    if (selector && this.currentField) {
      selector.value = this.currentField.id;
    }
  }
}

// Export for use in main application
window.FieldManager = FieldManager;
