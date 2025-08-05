// Mini Agronomist Pro - Feature Management System
// Version 2.0 Pro - Enterprise Agricultural Intelligence

class ProFeatureManager {
  constructor() {
    this.userTier = this.detectUserTier();
    this.features = this.initializeFeatures();
    this.limits = this.getUserLimits();
    this.init();
  }

  // Detect user tier (Free, Pro, Enterprise)
  detectUserTier() {
    // Check localStorage for pro status, API key, or license
    const proStatus = localStorage.getItem('mini-agronomist-pro-status');
    const licenseKey = localStorage.getItem('mini-agronomist-license-key');
    const enterpriseMode = localStorage.getItem('mini-agronomist-enterprise-mode');
    
    if (enterpriseMode) return 'enterprise';
    if (proStatus === 'active' || licenseKey) return 'pro';
    return 'free';
  }

  // Initialize feature flags based on user tier
  initializeFeatures() {
    const baseFeatures = {
      // Core Features (Always Available)
      basicPrediction: true,
      singleRegion: true,
      basicCrops: true,
      simpleReports: true,
      
      // Pro Features
      multiRegionAnalysis: this.userTier !== 'free',
      advancedCrops: this.userTier !== 'free',
      weatherIntegration: this.userTier !== 'free',
      fieldManagement: this.userTier !== 'free',
      customReports: this.userTier !== 'free',
      dataExport: this.userTier !== 'free',
      seasonalPlanning: this.userTier !== 'free',
      soilAnalysis: this.userTier !== 'free',
      pestDiseaseAnalysis: this.userTier !== 'free',
      marketPriceIntegration: this.userTier !== 'free',
      
      // Enterprise Features
      apiAccess: this.userTier === 'enterprise',
      whiteLabel: this.userTier === 'enterprise',
      customIntegrations: this.userTier === 'enterprise',
      bulkProcessing: this.userTier === 'enterprise',
      teamManagement: this.userTier === 'enterprise',
      auditLogs: this.userTier === 'enterprise',
      advancedAnalytics: this.userTier === 'enterprise',
      prioritySupport: this.userTier === 'enterprise'
    };

    return baseFeatures;
  }

  // Get usage limits based on tier
  getUserLimits() {
    const limits = {
      free: {
        predictions: 10, // per day
        fields: 1,
        crops: 8, // basic crops only
        regions: 3, // limited regions
        history: 30, // days
        exports: 0,
        apiCalls: 0
      },
      pro: {
        predictions: 100, // per day
        fields: 25,
        crops: 25, // all crops + specialty
        regions: 14, // all regions
        history: 365, // days
        exports: 50, // per month
        apiCalls: 1000 // per month
      },
      enterprise: {
        predictions: -1, // unlimited
        fields: -1, // unlimited
        crops: -1, // unlimited including custom
        regions: -1, // unlimited including custom
        history: -1, // unlimited
        exports: -1, // unlimited
        apiCalls: -1 // unlimited
      }
    };

    return limits[this.userTier];
  }

  // Check if feature is available
  hasFeature(featureName) {
    return this.features[featureName] === true;
  }

  // Check usage limits
  checkLimit(limitType, currentUsage = 0) {
    const limit = this.limits[limitType];
    if (limit === -1) return { allowed: true, remaining: -1 }; // unlimited
    
    const remaining = Math.max(0, limit - currentUsage);
    return {
      allowed: remaining > 0,
      remaining: remaining,
      limit: limit
    };
  }

  // Get pro upgrade prompt
  getUpgradePrompt(featureName) {
    const messages = {
      multiRegionAnalysis: "🌍 Compare yields across multiple regions with Pro!",
      weatherIntegration: "🌦️ Get real-time weather data integration with Pro!",
      fieldManagement: "🚜 Manage multiple fields and track performance with Pro!",
      customReports: "📊 Generate detailed custom reports with Pro!",
      dataExport: "📁 Export your data in multiple formats with Pro!",
      seasonalPlanning: "📅 Plan entire seasons with advanced tools in Pro!",
      soilAnalysis: "🌱 Get detailed soil health analysis with Pro!",
      pestDiseaseAnalysis: "🐛 Advanced pest and disease risk assessment with Pro!",
      marketPriceIntegration: "💰 Access real-time market prices with Pro!"
    };

    return messages[featureName] || "✨ Unlock advanced features with Pro!";
  }

  // Initialize pro system
  init() {
    this.setupProUI();
    this.initializeUsageTracking();
    console.log(`🌾 Mini Agronomist ${this.userTier.toUpperCase()} initialized`, {
      features: Object.keys(this.features).filter(f => this.features[f]).length,
      limits: this.limits
    });
  }

  // Setup Pro UI elements
  setupProUI() {
    // Add pro badges and indicators
    if (this.userTier !== 'free') {
      document.body.classList.add(`tier-${this.userTier}`);
      this.addProBadge();
    } else {
      this.addUpgradePrompts();
    }
  }

  // Add pro badge to header
  addProBadge() {
    const badge = document.createElement('div');
    badge.className = `pro-badge tier-${this.userTier}`;
    badge.innerHTML = `
      <span class="badge-icon">✨</span>
      <span class="badge-text">${this.userTier.toUpperCase()}</span>
    `;
    
    const header = document.querySelector('.header-container');
    if (header) {
      header.appendChild(badge);
    }
  }

  // Add upgrade prompts for free users
  addUpgradePrompts() {
    // Add subtle upgrade hints throughout the UI
    this.injectUpgradeHints();
  }

  // Initialize usage tracking
  initializeUsageTracking() {
    this.usage = JSON.parse(localStorage.getItem('mini-agronomist-usage') || '{}');
    
    // Reset daily counters if new day
    const today = new Date().toDateString();
    if (this.usage.lastReset !== today) {
      this.usage.predictions = 0;
      this.usage.exports = 0;
      this.usage.lastReset = today;
      this.saveUsage();
    }
  }

  // Track feature usage
  trackUsage(feature, increment = 1) {
    if (!this.usage[feature]) this.usage[feature] = 0;
    this.usage[feature] += increment;
    this.saveUsage();
    
    // Check limits and show warnings
    const limit = this.checkLimit(feature, this.usage[feature]);
    if (!limit.allowed) {
      this.showLimitReached(feature);
      return false;
    } else if (limit.remaining <= 3 && limit.remaining > 0) {
      this.showLimitWarning(feature, limit.remaining);
    }
    
    return true;
  }

  // Save usage data
  saveUsage() {
    localStorage.setItem('mini-agronomist-usage', JSON.stringify(this.usage));
  }

  // Show limit reached message
  showLimitReached(feature) {
    const message = `You've reached your ${feature} limit for today. Upgrade to Pro for unlimited access!`;
    this.showUpgradeModal(message, feature);
  }

  // Show limit warning
  showLimitWarning(feature, remaining) {
    const message = `⚠️ You have ${remaining} ${feature} remaining today.`;
    console.warn(message);
    // Could show a subtle notification
  }

  // Show upgrade modal
  showUpgradeModal(message, feature) {
    // This will be implemented with the Pro upgrade flow
    console.log('Upgrade needed:', message, feature);
  }

  // Inject upgrade hints into UI
  injectUpgradeHints() {
    // Add pro feature teasers to the interface
    const hints = [
      { selector: '.results-section', hint: '✨ Pro: Get detailed factor breakdowns' },
      { selector: '.form-section', hint: '🌍 Pro: Compare multiple regions' },
      { selector: '.history-section', hint: '📊 Pro: Advanced analytics & exports' }
    ];

    hints.forEach(({ selector, hint }) => {
      const element = document.querySelector(selector);
      if (element) {
        const hintElement = document.createElement('div');
        hintElement.className = 'pro-hint';
        hintElement.innerHTML = `<small>${hint}</small>`;
        element.appendChild(hintElement);
      }
    });
  }
}

// Export for use in main application
window.ProFeatureManager = ProFeatureManager;
