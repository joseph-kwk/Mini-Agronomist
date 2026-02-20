// Plant Disease Scanner Module
// AI-powered plant health analysis using computer vision

class PlantScanner {
  constructor() {
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.model = null;
    this.diseaseModel = null;
    this.stream = null;
    this.offlineMode = false; // Track if running in offline mode

    this.scanHistory = [];
    this.loadHistory();

    this.init();
  }

  async init() {
    try {
      console.log('🚀 Initializing Plant Scanner...');

      // Load pre-trained models
      await this.loadModels();

      // Setup event listeners
      this.setupEventListeners();

      console.log('✅ Plant Scanner initialized');
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.showError('Failed to initialize scanner. Please refresh the page.');
    }
  }

  // ========================================
  // MODEL LOADING
  // ========================================

  async loadModels() {
    try {
      console.log('📦 Loading AI models...');

      // Check if TensorFlow.js is available
      if (typeof tf === 'undefined') {
        throw new Error('TensorFlow.js not loaded. Check internet connection or try refreshing.');
      }

      // Check if MobileNet is available
      if (typeof mobilenet === 'undefined') {
        throw new Error('MobileNet not loaded. Check internet connection or try refreshing.');
      }

      // Load MobileNet for general image classification
      this.model = await mobilenet.load();
      console.log('✅ Image classification model loaded');

      // Initialize custom disease detection model
      await this.loadDiseaseModel();

      console.log('✅ All models loaded successfully');
    } catch (error) {
      console.error('❌ Model loading failed:', error);

      // Set offline mode - scanner will work with reduced accuracy
      this.offlineMode = true;
      console.warn('⚠️ Running in offline mode - scanner may work with reduced accuracy');

      // Still initialize disease detection model (works offline)
      await this.loadDiseaseModel();

      // Show user notification
      this.showOfflineNotification();
    }
  }

  async loadDiseaseModel() {
    // Comprehensive disease detection model with scientific backing
    console.log('📊 Initializing advanced disease detection model...');

    this.diseaseModel = {
      // Expanded disease patterns database with scientific references
      patterns: {
        'leaf_spot': {
          name: 'Leaf Spot Disease (Cercospora/Septoria)',
          keywords: ['leaf', 'spot', 'fungus', 'brown', 'lesion', 'circular'],
          severity: 'moderate',
          confidence_threshold: 0.6,
          treatments: [
            'Remove and destroy infected leaves immediately',
            'Apply copper-based fungicide (Bordeaux mixture)',
            'Improve air circulation between plants',
            'Avoid overhead watering - water at soil level',
            'Apply preventive fungicide during humid conditions'
          ],
          prevention: [
            'Use disease-resistant varieties',
            'Practice crop rotation (3-4 year cycle)',
            'Maintain proper plant spacing',
            'Remove plant debris after harvest'
          ],
          source: 'FAO Plant Health Guidelines 2024',
          sourceUrl: 'http://www.fao.org/plant-health'
        },
        'powdery_mildew': {
          name: 'Powdery Mildew (Erysiphales)',
          keywords: ['white', 'powder', 'mildew', 'fungus', 'coating'],
          severity: 'moderate',
          confidence_threshold: 0.65,
          treatments: [
            'Apply sulfur-based fungicide or neem oil spray',
            'Increase sunlight exposure by pruning',
            'Reduce humidity with proper spacing',
            'Remove severely infected plant parts',
            'Apply baking soda solution (1 tbsp per gallon water)'
          ],
          prevention: [
            'Plant in full sun locations',
            'Ensure good air circulation',
            'Avoid excessive nitrogen fertilization',
            'Water in the morning to allow foliage to dry'
          ],
          source: 'USDA Agricultural Research Service 2024',
          sourceUrl: 'https://www.ars.usda.gov'
        },
        'rust': {
          name: 'Plant Rust (Puccinia spp.)',
          keywords: ['rust', 'orange', 'pustule', 'red', 'brown'],
          severity: 'moderate',
          confidence_threshold: 0.6,
          treatments: [
            'Apply systemic fungicide (e.g., triazoles)',
            'Remove infected leaves promptly',
            'Ensure proper plant spacing (30-45 cm)',
            'Water at base - keep foliage dry',
            'Apply sulfur dust for organic control'
          ],
          prevention: [
            'Use rust-resistant crop varieties',
            'Remove volunteer plants and weeds',
            'Practice field sanitation',
            'Monitor regularly during warm, humid weather'
          ],
          source: 'CIMMYT Plant Pathology Research 2023',
          sourceUrl: 'https://www.cimmyt.org'
        },
        'blight': {
          name: 'Blight (Late/Early)',
          keywords: ['blight', 'wilt', 'brown', 'dead', 'blacken', 'decay'],
          severity: 'severe',
          confidence_threshold: 0.7,
          treatments: [
            'Remove and destroy infected plants immediately',
            'Apply copper fungicide or chlorothalonil',
            'Implement strict crop rotation (4+ years)',
            'Disinfect all tools with 10% bleach solution',
            'Do not compost infected material - burn or bury'
          ],
          prevention: [
            'Use certified disease-free seeds',
            'Avoid planting in poorly drained areas',
            'Space plants adequately for air flow',
            'Apply preventive fungicide in high-risk periods'
          ],
          source: 'International Potato Center (CIP) 2024',
          sourceUrl: 'https://cipotato.org'
        },
        'yellowing': {
          name: 'Chlorosis / Nutrient Deficiency',
          keywords: ['yellow', 'pale', 'chlorosis', 'discolor'],
          severity: 'mild',
          confidence_threshold: 0.5,
          nutrient_types: {
            'nitrogen': 'Older leaves yellow first, stunted growth',
            'iron': 'Young leaves yellow, veins remain green',
            'magnesium': 'Interveinal yellowing of older leaves',
            'sulfur': 'Uniform yellowing of young leaves'
          },
          treatments: [
            'Conduct soil test to identify specific deficiency',
            'Apply balanced NPK fertilizer (e.g., 10-10-10)',
            'Add iron chelate for iron deficiency',
            'Apply Epsom salt (MgSO4) for magnesium deficiency',
            'Adjust soil pH to optimal range (6.0-7.0)'
          ],
          prevention: [
            'Regular soil testing (annually)',
            'Maintain proper soil pH',
            'Add organic matter/compost',
            'Use slow-release fertilizers'
          ],
          source: 'ICRISAT Soil Fertility Management 2024',
          sourceUrl: 'https://www.icrisat.org'
        },
        'pest_damage': {
          name: 'Insect Pest Damage',
          keywords: ['hole', 'insect', 'chew', 'damage', 'eaten', 'torn'],
          severity: 'moderate',
          confidence_threshold: 0.55,
          common_pests: [
            'Aphids - sticky residue, curled leaves',
            'Caterpillars - large irregular holes',
            'Beetles - round holes in leaves',
            'Thrips - silvery scarring, distorted growth'
          ],
          treatments: [
            'Identify specific pest before treatment',
            'Apply neem oil (organic option)',
            'Use insecticidal soap for soft-bodied insects',
            'Apply appropriate targeted pesticide if severe',
            'Introduce beneficial insects (ladybugs, lacewings)'
          ],
          prevention: [
            'Regular monitoring and early detection',
            'Companion planting with pest-repelling plants',
            'Remove plant debris and hiding spots',
            'Use row covers for vulnerable crops'
          ],
          source: 'FAO Integrated Pest Management 2024',
          sourceUrl: 'http://www.fao.org/agriculture/crops/ipm'
        },
        'bacterial_spot': {
          name: 'Bacterial Spot (Xanthomonas)',
          keywords: ['bacterial', 'spot', 'water', 'lesion', 'dark'],
          severity: 'moderate',
          confidence_threshold: 0.65,
          treatments: [
            'Apply copper-based bactericide',
            'Remove infected plant material',
            'Avoid working with wet plants',
            'Improve drainage and air circulation',
            'Use drip irrigation instead of overhead'
          ],
          prevention: [
            'Use disease-free certified seeds',
            'Practice 2-3 year crop rotation',
            'Sanitize equipment regularly',
            'Avoid high-density planting'
          ],
          source: 'American Phytopathological Society 2024',
          sourceUrl: 'https://www.apsnet.org'
        },
        'viral_disease': {
          name: 'Viral Infection (Mosaic/Curl)',
          keywords: ['mosaic', 'curl', 'mottle', 'distort', 'stunt'],
          severity: 'severe',
          confidence_threshold: 0.7,
          treatments: [
            'Remove and destroy infected plants immediately',
            'Control insect vectors (aphids, whiteflies)',
            'No cure available - prevention is critical',
            'Disinfect tools between plants',
            'Consider replanting with resistant varieties'
          ],
          prevention: [
            'Use virus-resistant varieties',
            'Control insect vectors with appropriate pesticides',
            'Remove weeds that harbor viruses',
            'Use virus-free planting material',
            'Practice good field sanitation'
          ],
          source: 'International Center for Agricultural Research (CIAT) 2024',
          sourceUrl: 'https://ciat.cgiar.org'
        },
        'anthracnose': {
          name: 'Anthracnose (Colletotrichum)',
          keywords: ['anthracnose', 'sunken', 'lesion', 'dark', 'spot'],
          severity: 'moderate',
          confidence_threshold: 0.6,
          treatments: [
            'Apply systemic fungicide (azoxystrobin)',
            'Remove infected fruits/leaves',
            'Improve air circulation',
            'Apply copper fungicide preventively',
            'Harvest mature fruits promptly'
          ],
          prevention: [
            'Use disease-free seeds',
            'Practice crop rotation',
            'Avoid overhead irrigation',
            'Maintain proper plant nutrition'
          ],
          source: 'Plant Disease Journal 2024',
          sourceUrl: 'https://apsjournals.apsnet.org/plantdisease'
        },
        'downy_mildew': {
          name: 'Downy Mildew (Peronospora)',
          keywords: ['downy', 'gray', 'fuzzy', 'underside', 'yellow'],
          severity: 'moderate',
          confidence_threshold: 0.65,
          treatments: [
            'Apply phosphorous acid-based fungicide',
            'Improve air circulation immediately',
            'Remove infected lower leaves',
            'Reduce humidity in growing area',
            'Apply copper fungicide for prevention'
          ],
          prevention: [
            'Plant resistant varieties',
            'Ensure adequate spacing',
            'Water in morning hours only',
            'Use raised beds for better drainage'
          ],
          source: 'Cornell Plant Disease Diagnostic Clinic 2024',
          sourceUrl: 'https://plantclinic.cornell.edu'
        }
      },

      // Enhanced crop identification database - will be populated from crop_profiles.json
      crops: {},

      // Crop profiles loaded from data file
      cropProfiles: null
    };

    // Load crop profiles from data file
    await this.loadCropProfiles();

    console.log('✅ Advanced disease detection model ready with 10+ disease types');
  }

  async loadCropProfiles() {
    if (!this.diseaseModel) {
      console.warn('⚠️ diseaseModel was null in loadCropProfiles, re-initializing');
      this.diseaseModel = { patterns: {}, crops: {}, cropProfiles: null };
    }
    try {
      const response = await fetch('data/crop_profiles.json');
      if (response.ok) {
        this.diseaseModel.cropProfiles = await response.json();

        // Build crop keyword database from profiles
        for (const [cropKey, profile] of Object.entries(this.diseaseModel.cropProfiles)) {
          const keywords = [
            cropKey,
            profile.scientific_name.toLowerCase(),
            profile.category
          ];

          // Add common varieties as keywords
          if (profile.common_varieties) {
            keywords.push(...profile.common_varieties.map(v => v.toLowerCase()));
          }

          this.diseaseModel.crops[cropKey] = keywords;
        }

        console.log(`✅ Loaded ${Object.keys(this.diseaseModel.cropProfiles).length} crop profiles`);
      } else {
        console.warn('⚠️ Could not load crop profiles, using fallback database');
        this.loadFallbackCrops();
      }
    } catch (error) {
      console.warn('⚠️ Error loading crop profiles:', error);
      this.loadFallbackCrops();
    }
  }

  loadFallbackCrops() {
    if (!this.diseaseModel) {
      console.warn('⚠️ diseaseModel was null in loadFallbackCrops, re-initializing');
      this.diseaseModel = { patterns: {}, crops: {}, cropProfiles: null };
    }
    // Fallback crop database
    this.diseaseModel.crops = {
      'maize': ['corn', 'maize', 'cereal', 'zea mays'],
      'tomato': ['tomato', 'fruit', 'vegetable', 'solanum lycopersicum'],
      'potato': ['potato', 'tuber', 'solanum tuberosum'],
      'wheat': ['wheat', 'grain', 'cereal', 'triticum'],
      'rice': ['rice', 'grain', 'paddy', 'oryza sativa'],
      'soybean': ['soybean', 'soya', 'legume', 'glycine max'],
      'groundnuts': ['groundnut', 'peanut', 'arachis', 'legume'],
      'sorghum': ['sorghum', 'grain', 'cereal', 'millet'],
      'cabbage': ['cabbage', 'vegetable', 'brassica'],
      'cotton': ['cotton', 'fiber', 'gossypium'],
      'banana': ['banana', 'plantain', 'fruit', 'musa']
    };
  }
  // Show offline mode notification
  showOfflineNotification() {
    const banner = document.getElementById('deviceBanner');
    const icon = document.getElementById('bannerIcon');
    const text = document.getElementById('bannerText');

    if (banner && icon && text) {
      icon.textContent = '⚠️';
      text.textContent = 'Running in offline mode - AI models not loaded. Scanner will work with reduced accuracy.';
      banner.style.display = 'block';
      banner.className = 'device-banner warning-banner';

      // Auto-hide after 10 seconds
      setTimeout(() => {
        if (banner.style.display !== 'none') {
          banner.style.display = 'none';
        }
      }, 10000);
    } else {
      console.warn('⚠️ Offline mode: AI models not available - reduced accuracy');
    }
  }
  // ========================================
  // CAMERA CONTROL
  // ========================================

  async startCamera() {
    try {
      console.log('📷 Starting camera...');

      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;

      document.getElementById('captureBtn').disabled = false;

      console.log('✅ Camera started');
      return true;
    } catch (error) {
      console.error('❌ Camera access denied:', error);
      this.showError('Could not access camera. Please grant permission or upload an image.');
      return false;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      console.log('📷 Camera stopped');
    }
  }

  captureImage() {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    this.ctx.drawImage(this.video, 0, 0);

    return this.canvas.toDataURL('image/jpeg', 0.9);
  }

  // ========================================
  // IMAGE ANALYSIS
  // ========================================

  async analyzeImage(imageData) {
    try {
      this.showLoading(true);

      console.log(`🔍 Analysis mode: ${this.offlineMode ? 'Offline' : 'AI-Powered'}`);

      // Create image element
      const img = await this.loadImage(imageData);

      let classification = [];

      // Only run AI classification if model is available
      if (this.model && !this.offlineMode) {
        // Run classification with TensorFlow model
        classification = await this.classifyImage(img);
      } else {
        // Offline mode - simplified analysis
        console.log('📴 Using offline analysis mode');
        classification = [{ className: 'Plant (offline analysis)', probability: 0.6 }];
      }

      // Detect if it's a plant
      const isPlant = this.isPlantImage(classification);

      if (!isPlant) {
        throw new Error('No plant detected in image. Please capture a clear image of a plant.');
      }

      // Identify plant species
      const plantInfo = this.identifyPlant(classification);

      // Detect diseases
      const diseaseInfo = await this.detectDisease(img, classification);

      // Generate recommendations
      const recommendations = this.generateRecommendations(plantInfo, diseaseInfo);

      // Compile results in format expected by HTML
      const results = {
        plantInfo: {
          name: plantInfo.species,
          confidence: plantInfo.confidence,
          isCrop: plantInfo.isCrop,
          scientificName: plantInfo.scientificName || ''
        },
        healthScore: diseaseInfo.healthScore,
        status: diseaseInfo.status,
        diseases: diseaseInfo.diseases.map(d => ({
          name: d.disease,
          disease: d.disease,
          confidence: d.confidence,
          severity: d.severity,
          detectionMethod: d.detectionMethod || '',
          matchedKeywords: d.matchedKeywords || [],
          colorProfile: d.colorProfile || null,
          note: d.note || '',
          treatments: d.treatments || [],
          prevention: d.prevention || [],
          source: d.source || '',
          sourceUrl: d.sourceUrl || ''
        })),
        recommendations: recommendations.flatMap(rec => rec.items),
        imageData,
        timestamp: Date.now(),
        analysisMode: this.offlineMode ? 'Offline Analysis' : 'AI-Powered Analysis'
      };

      // Save to history
      this.saveToHistory(results);

      this.showLoading(false);

      return results;
    } catch (error) {
      this.showLoading(false);
      console.error('❌ Analysis failed:', error);
      this.showError(error.message);
      throw error;
    }
  }

  async classifyImage(img) {
    if (!this.model || this.offlineMode) {
      console.log('🔄 Offline classification - using simplified analysis');
      return [{ className: 'Plant', probability: 0.6 }];
    }

    try {
      // Use MobileNet for classification
      const predictions = await this.model.classify(img);
      console.log('🔍 Classifications:', predictions);
      return predictions;
    } catch (error) {
      console.error('❌ Classification failed, switching to offline mode:', error);
      this.offlineMode = true;
      return [{ className: 'Plant (AI unavailable)', probability: 0.5 }];
    }
  }

  isPlantImage(predictions) {
    // In offline mode, accept all images — color analysis validates later
    if (this.offlineMode) {
      return true;
    }

    // Comprehensive plant-related keyword list for strict validation
    const plantKeywords = [
      'plant', 'leaf', 'flower', 'crop', 'vegetable', 'fruit',
      'tree', 'bush', 'herb', 'grass', 'seedling', 'vine',
      'maize', 'corn', 'tomato', 'potato', 'wheat', 'rice',
      'cabbage', 'lettuce', 'spinach', 'bean', 'pea',
      'garden', 'greenhouse', 'field', 'flora', 'botanical',
      'seed', 'stem', 'petal', 'sprout', 'weed', 'mushroom',
      'moss', 'fern', 'palm', 'cactus', 'succulent', 'shrub',
      'blossom', 'bud', 'acorn', 'bulb', 'stalk', 'twig',
      'banana', 'apple', 'orange', 'lemon', 'grape', 'berry',
      'cucumber', 'pepper', 'onion', 'carrot', 'squash', 'melon',
      'soybean', 'sorghum', 'millet', 'barley', 'oat', 'rye',
      'daisy', 'rose', 'tulip', 'orchid', 'sunflower', 'poppy',
      'clover', 'aloe', 'ivy', 'willow', 'oak', 'pine', 'maple'
    ];

    for (const pred of predictions) {
      const className = pred.className.toLowerCase();
      for (const keyword of plantKeywords) {
        if (className.includes(keyword)) {
          return true;
        }
      }
    }

    // Secondary: accept if nature-related with high confidence (>50%)
    const natureKeywords = ['outdoor', 'nature', 'green', 'soil', 'organic', 'hay', 'straw', 'fungus'];
    if (predictions[0] && predictions[0].probability > 0.5) {
      const className = predictions[0].className.toLowerCase();
      for (const keyword of natureKeywords) {
        if (className.includes(keyword)) {
          return true;
        }
      }
    }

    return false;
  }

  identifyPlant(predictions) {
    // Match predictions to known crops
    let bestMatch = {
      species: 'Unknown Plant',
      type: 'Plant',
      confidence: 0,
      isCrop: false
    };

    for (const pred of predictions) {
      const className = pred.className.toLowerCase();

      // Check against crop database
      for (const [cropName, keywords] of Object.entries(this.diseaseModel.crops)) {
        for (const keyword of keywords) {
          if (className.includes(keyword)) {
            bestMatch = {
              species: this.capitalize(cropName),
              type: 'Crop',
              confidence: pred.probability,
              isCrop: true,
              scientificName: this.getScientificName(cropName)
            };
            return bestMatch;
          }
        }
      }
    }

    // If no crop match, use top prediction
    if (predictions.length > 0) {
      const topPred = predictions[0];
      bestMatch = {
        species: this.capitalize(topPred.className),
        type: 'Plant',
        confidence: topPred.probability,
        isCrop: false
      };
    }

    return bestMatch;
  }

  async detectDisease(img, classifications) {
    // Advanced disease detection using multiple analysis methods
    const imageFeatures = await this.extractImageFeatures(img);

    // Analyze for disease patterns
    let detectedDiseases = [];
    let diseaseScores = new Map();
    let healthScore = 1.0;

    // Method 1: Check for disease indicators in AI classifications
    for (const pred of classifications) {
      const className = pred.className.toLowerCase();

      for (const [diseaseKey, diseaseData] of Object.entries(this.diseaseModel.patterns)) {
        let matchScore = 0;
        let matchedKeywords = [];

        // Score based on keyword matches
        for (const keyword of diseaseData.keywords) {
          if (className.includes(keyword)) {
            matchScore += 0.2;
            matchedKeywords.push(keyword);
          }
        }

        // Only add if confidence exceeds threshold and keywords matched
        if (matchScore > 0 && pred.probability >= (diseaseData.confidence_threshold || 0.5)) {
          const finalConfidence = Math.min(pred.probability * (1 + matchScore), 0.95);

          if (!diseaseScores.has(diseaseKey) || diseaseScores.get(diseaseKey) < finalConfidence) {
            diseaseScores.set(diseaseKey, finalConfidence);

            const diseaseInfo = {
              disease: diseaseData.name,
              severity: diseaseData.severity,
              confidence: finalConfidence,
              detectionMethod: 'AI Classification',
              matchedKeywords: matchedKeywords,
              treatments: diseaseData.treatments,
              prevention: diseaseData.prevention,
              source: diseaseData.source,
              sourceUrl: diseaseData.sourceUrl
            };

            // Add nutrient-specific info if available
            if (diseaseData.nutrient_types) {
              diseaseInfo.nutrient_types = diseaseData.nutrient_types;
            }
            if (diseaseData.common_pests) {
              diseaseInfo.common_pests = diseaseData.common_pests;
            }

            // Replace or add disease
            const existingIndex = detectedDiseases.findIndex(d => d.disease === diseaseInfo.disease);
            if (existingIndex >= 0) {
              detectedDiseases[existingIndex] = diseaseInfo;
            } else {
              detectedDiseases.push(diseaseInfo);
            }

            // Reduce health score based on severity
            const severityImpact = diseaseData.severity === 'severe' ? 0.4 :
              diseaseData.severity === 'moderate' ? 0.25 : 0.15;
            healthScore -= severityImpact;
          }
        }
      }
    }

    // Method 2: Advanced color and texture analysis
    const colorAnalysis = this.analyzeColors(imageFeatures);

    if (colorAnalysis.abnormal) {
      const diseaseType = colorAnalysis.diseaseType;
      const diseaseData = this.diseaseModel.patterns[diseaseType];

      if (diseaseData && colorAnalysis.confidence >= (diseaseData.confidence_threshold || 0.5)) {
        // Only add if not already detected with higher confidence
        if (!diseaseScores.has(diseaseType) || diseaseScores.get(diseaseType) < colorAnalysis.confidence) {
          const diseaseInfo = {
            disease: colorAnalysis.suggestedIssue,
            severity: diseaseData.severity || 'mild',
            confidence: colorAnalysis.confidence,
            detectionMethod: 'Color Analysis',
            colorProfile: colorAnalysis.profile,
            treatments: diseaseData.treatments,
            prevention: diseaseData.prevention,
            source: diseaseData.source,
            sourceUrl: diseaseData.sourceUrl
          };

          const existingIndex = detectedDiseases.findIndex(d => d.disease === diseaseInfo.disease);
          if (existingIndex >= 0) {
            // Combine confidence scores
            detectedDiseases[existingIndex].confidence = Math.max(
              detectedDiseases[existingIndex].confidence,
              diseaseInfo.confidence
            );
            detectedDiseases[existingIndex].detectionMethod = 'AI + Color Analysis';
          } else {
            detectedDiseases.push(diseaseInfo);
          }

          healthScore -= 0.2;
        }
      }
    }

    // Method 3: Texture and pattern analysis (enhanced with spots)
    const textureAnalysis = this.analyzeTexture(imageFeatures);
    if (textureAnalysis.abnormal) {
      healthScore -= 0.1;
      // If texture finds spots with high confidence, add as a disease detection
      if (textureAnalysis.spotsDetected > 0 && textureAnalysis.confidence > 0.55) {
        const spotDisease = this.diseaseModel.patterns['leaf_spot'];
        if (spotDisease && !diseaseScores.has('leaf_spot_texture')) {
          detectedDiseases.push({
            disease: spotDisease.name || 'Leaf Spot Disease',
            severity: spotDisease.severity || 'mild',
            confidence: textureAnalysis.confidence,
            detectionMethod: 'Texture + Spot Analysis',
            note: textureAnalysis.note,
            treatments: spotDisease.treatments || ['Apply fungicide', 'Remove affected leaves'],
            prevention: spotDisease.prevention || ['Ensure good air circulation', 'Avoid overhead watering'],
            source: spotDisease.source || 'Computer Vision Analysis',
            sourceUrl: spotDisease.sourceUrl || ''
          });
          healthScore -= 0.15;
        }
      }
    }

    // Determine overall health status
    healthScore = Math.max(0, Math.min(1, healthScore));

    // Sort diseases by confidence
    detectedDiseases.sort((a, b) => b.confidence - a.confidence);

    // Limit to top 5 most confident detections
    detectedDiseases = detectedDiseases.slice(0, 5);

    let status = 'Healthy';
    let statusClass = 'status-healthy';

    if (detectedDiseases.length > 0) {
      if (healthScore < 0.5) {
        status = 'Severe Issues Detected';
        statusClass = 'status-disease';
      } else if (healthScore < 0.7) {
        status = 'Disease Detected';
        statusClass = 'status-disease';
      } else {
        status = 'Minor Issues';
        statusClass = 'status-warning';
      }
    }

    // Add quality warning if image quality is poor
    const qualityWarning = imageFeatures.imageQuality && imageFeatures.imageQuality.overallScore < 40
      ? ' (Low image quality — results may be less accurate)'
      : '';

    return {
      status: status + qualityWarning,
      statusClass,
      healthScore,
      diseases: detectedDiseases,
      confidence: detectedDiseases.length > 0 ?
        detectedDiseases[0].confidence : 0.95,
      // Enhanced analysis metadata
      imageQuality: imageFeatures.imageQuality,
      zoneAnomalies: imageFeatures.zones ? imageFeatures.zones.anomalies.length : 0,
      spotsDetected: imageFeatures.spots ? imageFeatures.spots.count : 0,
      plantCoverage: imageFeatures.plantCoverage,
      textureNote: textureAnalysis.note
    };
  }

  async extractImageFeatures(img) {
    // ===== ENHANCED FEATURE EXTRACTION PIPELINE =====
    // Two-pass analysis with segmentation, adaptive baselines, zones, and spots
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Resize for performance while maintaining aspect ratio
    const maxSize = 500;
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > maxSize) { height = height * (maxSize / width); width = maxSize; }
    } else {
      if (height > maxSize) { width = width * (maxSize / height); height = maxSize; }
    }
    width = Math.round(width);
    height = Math.round(height);

    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.drawImage(img, 0, 0, width, height);

    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const pixelCount = width * height;

    // ===== PASS 1: Plant segmentation + adaptive green baseline =====
    const plantMask = new Uint8Array(pixelCount); // 0=background, 1=healthy, 2=chlorotic, 3=necrotic
    const greenHues = [];
    const greenSats = [];
    let totalR = 0, totalG = 0, totalB = 0;

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      totalR += r; totalG += g; totalB += b;
      const [h, s, l] = this.rgbToHsl(r, g, b);

      // Skip background
      if (s < 0.1 || l > 0.95 || l < 0.05) { plantMask[i] = 0; continue; }

      // Broad plant detection for Pass 1
      if (h >= 60 && h <= 180 && s > 0.15 && l > 0.1 && l < 0.9) {
        plantMask[i] = 1; // Likely plant (green)
        greenHues.push(h);
        greenSats.push(s);
      } else if (h >= 30 && h < 60 && s > 0.2) {
        plantMask[i] = 2; // Chlorotic
      } else if ((h < 30 || h > 330) && s > 0.15 && l < 0.65) {
        plantMask[i] = 3; // Necrotic
      } else {
        plantMask[i] = 0;
      }
    }

    // Compute adaptive green baseline from detected green pixels
    let greenBaseline = { meanHue: 120, stdHue: 30, meanSat: 0.4, stdSat: 0.15 };
    if (greenHues.length > 20) {
      const meanH = greenHues.reduce((a, b) => a + b, 0) / greenHues.length;
      const stdH = Math.sqrt(greenHues.reduce((a, b) => a + (b - meanH) ** 2, 0) / greenHues.length);
      const meanS = greenSats.reduce((a, b) => a + b, 0) / greenSats.length;
      const stdS = Math.sqrt(greenSats.reduce((a, b) => a + (b - meanS) ** 2, 0) / greenSats.length);
      greenBaseline = { meanHue: meanH, stdHue: Math.max(stdH, 10), meanSat: meanS, stdSat: Math.max(stdS, 0.05) };
    }

    // ===== PASS 2: Re-classify using adaptive thresholds =====
    let healthyPixels = 0, chloroticPixels = 0, necroticPixels = 0, totalPlantPixels = 0;
    const adaptiveGreenMin = greenBaseline.meanHue - 2.5 * greenBaseline.stdHue;
    const adaptiveGreenMax = greenBaseline.meanHue + 2.5 * greenBaseline.stdHue;

    for (let i = 0; i < pixelCount; i++) {
      if (plantMask[i] === 0) continue;
      const idx = i * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const [h, s, l] = this.rgbToHsl(r, g, b);

      totalPlantPixels++;
      if (h >= adaptiveGreenMin && h <= adaptiveGreenMax && s > (greenBaseline.meanSat - 2 * greenBaseline.stdSat)) {
        healthyPixels++; plantMask[i] = 1;
      } else if (h >= 30 && h < adaptiveGreenMin && s > 0.2) {
        chloroticPixels++; plantMask[i] = 2;
      } else if ((h < 30 || h > 330) && l < 0.65) {
        necroticPixels++; plantMask[i] = 3;
      } else {
        healthyPixels++; plantMask[i] = 1; // Default to healthy if on plant
      }
    }

    // ===== IMAGE QUALITY ASSESSMENT =====
    const imageQuality = this.assessImageQuality(data, width, height);

    // ===== MULTI-ZONE ANALYSIS (4x4 grid) =====
    const zones = this.analyzeZones(data, width, height, plantMask);

    // ===== SPOT / LESION DETECTION =====
    const spots = this.detectSpots(data, width, height, plantMask);

    // ===== COMPILE ENRICHED FEATURES =====
    const stats = {
      // Core ratios (adaptive)
      healthyRatio: totalPlantPixels > 0 ? healthyPixels / totalPlantPixels : 0,
      chlorosisRatio: totalPlantPixels > 0 ? chloroticPixels / totalPlantPixels : 0,
      necrosisRatio: totalPlantPixels > 0 ? necroticPixels / totalPlantPixels : 0,
      plantCoverage: totalPlantPixels / pixelCount,
      avgRed: totalR / pixelCount,
      avgGreen: totalG / pixelCount,
      avgBlue: totalB / pixelCount,
      rawImageData: imageData,
      width, height,
      // Enhanced features
      greenBaseline,
      imageQuality,
      zones,
      spots,
      plantMask,
      totalPlantPixels
    };

    console.log('🔬 Enhanced Analysis Results:', {
      'Healthy': (stats.healthyRatio * 100).toFixed(1) + '%',
      'Chlorosis': (stats.chlorosisRatio * 100).toFixed(1) + '%',
      'Necrosis': (stats.necrosisRatio * 100).toFixed(1) + '%',
      'Plant Coverage': (stats.plantCoverage * 100).toFixed(1) + '%',
      'Image Quality': stats.imageQuality.overallScore.toFixed(0) + '/100',
      'Zones w/ Issues': stats.zones.anomalies.length,
      'Spots Detected': stats.spots.count
    });

    return stats;
  }

  // Helper: RGB to HSL conversion
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s, l];
  }

  // ========================================
  // PHASE 2: SMART ANALYSIS HELPERS
  // ========================================

  assessImageQuality(data, width, height) {
    // Measures blur, exposure, and contrast to calibrate confidence
    const pixelCount = width * height;
    let sumBrightness = 0, sumBrSq = 0;
    let veryDark = 0, veryBright = 0;
    // Laplacian-like blur detection: measure sharpness via neighbor differences
    let laplacianSum = 0, lapCount = 0;
    const step = Math.max(1, Math.floor(pixelCount / 2000)); // Sample ~2000 pixels

    for (let y = 1; y < height - 1; y += Math.max(1, Math.floor(height / 50))) {
      for (let x = 1; x < width - 1; x += Math.max(1, Math.floor(width / 50))) {
        const idx = (y * width + x) * 4;
        const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
        sumBrightness += gray;
        sumBrSq += gray * gray;
        if (gray < 20) veryDark++;
        if (gray > 235) veryBright++;

        // Laplacian: 4*center - top - bottom - left - right
        const top = ((y - 1) * width + x) * 4;
        const bot = ((y + 1) * width + x) * 4;
        const lft = (y * width + (x - 1)) * 4;
        const rgt = (y * width + (x + 1)) * 4;
        const gT = data[top] * 0.299 + data[top + 1] * 0.587 + data[top + 2] * 0.114;
        const gB = data[bot] * 0.299 + data[bot + 1] * 0.587 + data[bot + 2] * 0.114;
        const gL = data[lft] * 0.299 + data[lft + 1] * 0.587 + data[lft + 2] * 0.114;
        const gR = data[rgt] * 0.299 + data[rgt + 1] * 0.587 + data[rgt + 2] * 0.114;
        const lap = Math.abs(4 * gray - gT - gB - gL - gR);
        laplacianSum += lap;
        lapCount++;
      }
    }

    const samples = lapCount || 1;
    const meanBrightness = sumBrightness / samples;
    const stdBrightness = Math.sqrt((sumBrSq / samples) - meanBrightness * meanBrightness);
    const blurScore = Math.min(100, (laplacianSum / samples) * 2.5); // Higher = sharper
    const exposureScore = 100 - (veryDark + veryBright) / samples * 100 * 3; // Penalty for extremes
    const contrastScore = Math.min(100, stdBrightness * 1.5);

    const overallScore = Math.max(0, Math.min(100,
      blurScore * 0.4 + Math.max(0, exposureScore) * 0.3 + contrastScore * 0.3
    ));

    return { blurScore, exposureScore: Math.max(0, exposureScore), contrastScore, overallScore, meanBrightness };
  }

  analyzeZones(data, width, height, plantMask) {
    // Divide image into 4x4 grid and analyze each zone independently
    const gridSize = 4;
    const zoneW = Math.floor(width / gridSize);
    const zoneH = Math.floor(height / gridSize);
    const zoneResults = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        let zHealthy = 0, zChlorotic = 0, zNecrotic = 0, zPlant = 0;
        for (let y = row * zoneH; y < (row + 1) * zoneH && y < height; y++) {
          for (let x = col * zoneW; x < (col + 1) * zoneW && x < width; x++) {
            const pi = y * width + x;
            const m = plantMask[pi];
            if (m === 0) continue;
            zPlant++;
            if (m === 1) zHealthy++;
            else if (m === 2) zChlorotic++;
            else if (m === 3) zNecrotic++;
          }
        }
        zoneResults.push({
          row, col,
          plantPixels: zPlant,
          healthyRatio: zPlant > 0 ? zHealthy / zPlant : 0,
          chlorosisRatio: zPlant > 0 ? zChlorotic / zPlant : 0,
          necrosisRatio: zPlant > 0 ? zNecrotic / zPlant : 0
        });
      }
    }

    // Detect zone anomalies: zones that deviate significantly from the mean
    const plantZones = zoneResults.filter(z => z.plantPixels > 20);
    const anomalies = [];
    if (plantZones.length >= 4) {
      const avgChlor = plantZones.reduce((a, z) => a + z.chlorosisRatio, 0) / plantZones.length;
      const avgNecr = plantZones.reduce((a, z) => a + z.necrosisRatio, 0) / plantZones.length;

      for (const zone of plantZones) {
        // Zone has significantly more disease than average
        if (zone.chlorosisRatio > avgChlor + 0.15 && zone.chlorosisRatio > 0.2) {
          anomalies.push({ row: zone.row, col: zone.col, type: 'chlorosis_cluster', severity: zone.chlorosisRatio });
        }
        if (zone.necrosisRatio > avgNecr + 0.15 && zone.necrosisRatio > 0.2) {
          anomalies.push({ row: zone.row, col: zone.col, type: 'necrosis_cluster', severity: zone.necrosisRatio });
        }
      }
    }

    return { grid: zoneResults, anomalies };
  }

  detectSpots(data, width, height, plantMask) {
    // Detect isolated spots/lesions: non-green pixels surrounded by green
    let spotPixels = 0;
    let spotClusters = 0;
    let totalChecked = 0;
    const checked = new Uint8Array(width * height);
    const neighborOffsets = [-width - 1, -width, -width + 1, -1, 1, width - 1, width, width + 1];
    // Sample every 3rd pixel for performance
    const stepX = 3, stepY = 3;

    for (let y = 2; y < height - 2; y += stepY) {
      for (let x = 2; x < width - 2; x += stepX) {
        const pi = y * width + x;
        // Looking for disease pixels (2=chlorotic, 3=necrotic) surrounded by healthy (1)
        if (plantMask[pi] < 2) continue;
        totalChecked++;

        let greenNeighbors = 0;
        let totalNeighbors = 0;
        for (const offset of neighborOffsets) {
          const ni = pi + offset;
          if (ni >= 0 && ni < width * height) {
            totalNeighbors++;
            if (plantMask[ni] === 1) greenNeighbors++;
          }
        }

        // Spot: disease pixel with mostly green neighbors (isolated lesion)
        if (totalNeighbors >= 6 && greenNeighbors / totalNeighbors >= 0.5) {
          spotPixels++;
          if (!checked[pi]) {
            checked[pi] = 1;
            spotClusters++;
          }
        }
      }
    }

    const spotDensity = totalChecked > 0 ? spotPixels / totalChecked : 0;
    return {
      count: spotClusters,
      density: spotDensity,
      isSignificant: spotClusters >= 3 || spotDensity > 0.05,
      note: spotClusters >= 5 ? 'Multiple isolated lesions detected' :
        spotClusters >= 2 ? 'Some spotting detected' : 'No significant spots'
    };
  }

  calibrateConfidence(rawConfidence, imageQuality) {
    // Reduce confidence when image quality is poor
    if (!imageQuality) return rawConfidence;
    const qualityFactor = Math.max(0.5, imageQuality.overallScore / 100);
    return Math.min(0.95, rawConfidence * qualityFactor);
  }

  analyzeColors(features) {
    const { healthyRatio, chlorosisRatio, necrosisRatio, avgRed, avgGreen, avgBlue } = features;
    const { zones, spots, imageQuality, greenBaseline } = features;

    const colorProfile = {
      healthy: (healthyRatio * 100).toFixed(1) + '%',
      yellowing: (chlorosisRatio * 100).toFixed(1) + '%',
      browning: (necrosisRatio * 100).toFixed(1) + '%',
      avgRed: avgRed.toFixed(1),
      avgGreen: avgGreen.toFixed(1),
      avgBlue: avgBlue.toFixed(1),
      greenRatio: (healthyRatio * 100).toFixed(1) + '%',
      adaptiveBaseline: greenBaseline ? `Hue ${greenBaseline.meanHue.toFixed(0)}±${greenBaseline.stdHue.toFixed(0)}` : 'N/A'
    };

    let abnormal = false;
    let suggestedIssue = null;
    let diseaseType = null;
    let confidence = 0.0;
    let note = 'Plant appears healthy based on color analysis';

    // === Enhanced Pathology Rule Engine ===

    // Case 1: Severe Necrosis (Blight/Rot)
    if (necrosisRatio > 0.15) {
      abnormal = true;
      diseaseType = 'blight';
      suggestedIssue = 'Blight or fungal rot detected';
      confidence = Math.min(0.5 + (necrosisRatio * 2), 0.95);
      // Boost if necrosis is concentrated (zone anomalies)
      if (zones && zones.anomalies.some(a => a.type === 'necrosis_cluster')) {
        confidence = Math.min(confidence + 0.1, 0.95);
        note = 'Concentrated necrotic tissue detected in localized areas. Strong blight indicator.';
      } else {
        note = 'Widespread necrotic (dead) tissue detected. High risk of blight or rot.';
      }
    }
    // Case 2: Significant Chlorosis (Yellowing)
    else if (chlorosisRatio > 0.15) {
      abnormal = true;
      diseaseType = 'yellowing';
      suggestedIssue = 'Nutrient Deficiency (Chlorosis)';
      confidence = Math.min(0.5 + (chlorosisRatio * 2), 0.9);
      if (zones && zones.anomalies.some(a => a.type === 'chlorosis_cluster')) {
        note = 'Localized yellowing pattern suggests early-stage nutrient deficiency or viral infection.';
      } else {
        note = 'Widespread yellowing suggests nitrogen or iron deficiency.';
      }
    }
    // Case 3: Rust (Orange/Reddish brown)
    else if (necrosisRatio > 0.05 && avgRed > avgGreen * 1.2) {
      abnormal = true;
      diseaseType = 'rust';
      suggestedIssue = 'Plant Rust (Puccinia spp.)';
      confidence = 0.65;
      note = 'Reddish-brown discoloration is consistent with Rust.';
    }
    // Case 4: Spotted lesion pattern (NEW - uses spot detection)
    else if (spots && spots.isSignificant) {
      abnormal = true;
      diseaseType = 'leaf_spot';
      suggestedIssue = 'Leaf Spot Disease (Cercospora/Alternaria)';
      confidence = Math.min(0.55 + (spots.density * 3), 0.85);
      note = `${spots.count} isolated lesion(s) detected on otherwise healthy tissue. Consistent with fungal leaf spot.`;
    }
    // Case 5: Zone-localized issues not caught by averages (NEW)
    else if (zones && zones.anomalies.length > 0) {
      abnormal = true;
      const worst = zones.anomalies[0];
      if (worst.type === 'necrosis_cluster') {
        diseaseType = 'blight';
        suggestedIssue = 'Localized tissue death';
        confidence = 0.55;
        note = `Necrosis concentrated in zone [${worst.row},${worst.col}]. Early-stage blight possible.`;
      } else {
        diseaseType = 'yellowing';
        suggestedIssue = 'Localized yellowing';
        confidence = 0.50;
        note = `Chlorosis concentrated in zone [${worst.row},${worst.col}]. May indicate localized nutrient issue.`;
      }
    }
    // Case 6: Minor Stress
    else if (healthyRatio < 0.6) {
      abnormal = true;
      suggestedIssue = 'General Plant Stress';
      confidence = 0.5;
      note = 'Plant shows low healthy leaf area. Check water and sunlight.';
    }

    // Calibrate confidence based on image quality
    if (abnormal && imageQuality) {
      confidence = this.calibrateConfidence(confidence, imageQuality);
    }

    return {
      abnormal,
      suggestedIssue,
      diseaseType,
      confidence,
      profile: colorProfile,
      note
    };
  }

  analyzeTexture(features) {
    // Enhanced texture analysis combining variance + spot detection
    const rawImageData = features.rawImageData;
    const { spots, imageQuality } = features;

    if (!rawImageData || !rawImageData.data || rawImageData.data.length < 1000) {
      return { abnormal: false, confidence: 0.5 };
    }

    const data = rawImageData.data;

    // Pixel variance analysis (on plant region only for accuracy)
    let sumVariance = 0;
    let sampleCount = 0;
    const sampleStep = Math.max(4, Math.floor(data.length / 400));

    for (let i = 0; i < data.length - 8; i += sampleStep) {
      const r1 = data[i], g1 = data[i + 1], b1 = data[i + 2];
      const r2 = data[i + 4], g2 = data[i + 5], b2 = data[i + 6];
      const variance = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      sumVariance += variance;
      sampleCount++;
    }

    const avgVariance = sampleCount > 0 ? sumVariance / sampleCount : 0;
    let abnormal = false;
    let confidence = 0.5;
    let note = 'Normal texture pattern';

    // High variance + spots = strong lesion indicator
    if (avgVariance > 60 && spots && spots.isSignificant) {
      abnormal = true;
      confidence = Math.min(0.75, 0.60 + spots.density * 2);
      note = `High texture variance (${avgVariance.toFixed(0)}) with ${spots.count} isolated lesion(s). Strong disease indicator.`;
    }
    // High variance alone
    else if (avgVariance > 60) {
      abnormal = true;
      confidence = 0.60;
      note = `High texture variance (${avgVariance.toFixed(0)}) - possible spots or lesions`;
    }
    // Spots alone (moderate or detected but variance normal)
    else if (spots && spots.isSignificant) {
      abnormal = true;
      confidence = 0.55;
      note = `${spots.count} spot(s) detected despite normal texture variance. Monitor for progression.`;
    }
    // Very low variance = possible powdery coating
    else if (avgVariance < 15) {
      abnormal = true;
      confidence = 0.55;
      note = 'Very uniform texture - possible powdery mildew coating';
    }

    // Calibrate with image quality
    if (abnormal && imageQuality) {
      confidence = this.calibrateConfidence(confidence, imageQuality);
    }

    return {
      abnormal,
      confidence,
      note,
      variance: avgVariance.toFixed(1),
      spotsDetected: spots ? spots.count : 0
    };
  }

  generateRecommendations(plantInfo, diseaseInfo) {
    const recommendations = [];

    if (diseaseInfo.diseases.length === 0) {
      // Healthy plant recommendations
      recommendations.push({
        title: '✅ Your plant looks healthy!',
        items: [
          'Continue current care routine',
          'Monitor regularly for any changes',
          'Maintain proper watering schedule',
          'Ensure adequate sunlight exposure'
        ]
      });
    } else {
      // Disease-specific recommendations
      for (const disease of diseaseInfo.diseases) {
        recommendations.push({
          title: `🔬 Treatment for ${disease.disease}`,
          severity: disease.severity,
          items: disease.treatments
        });
      }
    }

    // General crop-specific advice
    if (plantInfo.isCrop) {
      recommendations.push({
        title: `🌱 ${plantInfo.species} Care Tips`,
        items: this.getCropCareTips(plantInfo.species.toLowerCase())
      });
    }

    return recommendations;
  }

  getCropCareTips(cropName) {
    // Try to get from loaded crop profiles first
    if (this.diseaseModel.cropProfiles && this.diseaseModel.cropProfiles[cropName]) {
      const profile = this.diseaseModel.cropProfiles[cropName];
      return [
        `Optimal temperature: ${profile.optimal_temp_c[0]}-${profile.optimal_temp_c[1]}°C`,
        `Water requirement: ${profile.water_requirement_mm[0]}-${profile.water_requirement_mm[1]}mm per season`,
        `Soil pH range: ${profile.soil_ph_range[0]}-${profile.soil_ph_range[1]}`,
        `Days to maturity: ${profile.days_to_maturity[0]}-${profile.days_to_maturity[1]} days`,
        `Plant spacing: ${profile.plant_spacing_cm[0]}-${profile.plant_spacing_cm[1]} cm`,
        profile.description || 'Follow recommended growing practices'
      ];
    }

    // Fallback tips
    const tips = {
      'maize': [
        'Ensure 25-30 inches of water during growing season',
        'Apply nitrogen fertilizer in split doses',
        'Control weeds during first 4-6 weeks',
        'Plant at 20-30 cm spacing for optimal yield'
      ],
      'tomato': [
        'Provide support with stakes or cages',
        'Water consistently at soil level',
        'Prune suckers for better fruit production',
        'Maintain soil pH between 6.0-6.8'
      ],
      'potato': [
        'Hill soil around plants as they grow',
        'Water deeply but infrequently',
        'Harvest when foliage begins to yellow',
        'Store in cool, dark place'
      ],
      'default': [
        'Follow recommended spacing guidelines',
        'Monitor soil moisture regularly',
        'Apply appropriate fertilizer for crop type',
        'Practice crop rotation for disease prevention'
      ]
    };

    return tips[cropName] || tips['default'];
  }

  // ========================================
  // PUBLIC API METHODS
  // ========================================

  getHistory() {
    return this.scanHistory;
  }

  async loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  capitalize(str) {
    return str.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  getScientificName(cropName) {
    const names = {
      'maize': 'Zea mays',
      'tomato': 'Solanum lycopersicum',
      'potato': 'Solanum tuberosum',
      'wheat': 'Triticum aestivum',
      'rice': 'Oryza sativa'
    };
    return names[cropName] || '';
  }

  showLoading(show) {
    const loading = document.querySelector('.loading');
    if (show) {
      loading.classList.add('show');
    } else {
      loading.classList.remove('show');
    }
  }

  showError(message) {
    alert('Error: ' + message);
  }

  // ========================================
  // HISTORY MANAGEMENT
  // ========================================

  saveToHistory(results) {
    this.scanHistory.unshift({
      ...results,
      id: Date.now()
    });

    // Keep only last 20 scans
    if (this.scanHistory.length > 20) {
      this.scanHistory = this.scanHistory.slice(0, 20);
    }

    this.saveHistory();
    this.updateHistoryDisplay();
  }

  saveHistory() {
    try {
      // Save to localStorage (limit image size)
      const historyToSave = this.scanHistory.map(item => ({
        ...item,
        imageData: item.imageData.substring(0, 10000) // Limit size
      }));
      localStorage.setItem('plantScanHistory', JSON.stringify(historyToSave));
    } catch (error) {
      console.warn('Could not save history:', error);
    }
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('plantScanHistory');
      if (saved) {
        this.scanHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Could not load history:', error);
    }
  }

  updateHistoryDisplay() {
    const historySection = document.getElementById('history');
    const historyList = document.getElementById('historyList');

    if (this.scanHistory.length === 0) {
      historySection.style.display = 'none';
      return;
    }

    historySection.style.display = 'block';
    historyList.innerHTML = '';

    for (const item of this.scanHistory.slice(0, 10)) {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <img src="${item.imageData}" class="history-thumb" alt="Scan">
        <div class="history-info">
          <strong>${item.plantInfo ? item.plantInfo.name : 'Unknown Plant'}</strong>
          <div class="status-indicator">${item.status || 'Unknown'}</div>
          <p style="font-size: 14px; color: #6b7280;">
            ${new Date(item.timestamp).toLocaleString()}
          </p>
        </div>
      `;
      historyList.appendChild(historyItem);
    }
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================

  setupEventListeners() {
    // Event binding is managed by the HTML page's inline handlers
    // (startCamera, captureAndAnalyze, handleImageUpload, etc.)
    // PlantScanner exposes its public API methods which the page calls
    // through the global `scanner` / `plantScanner` instance.
    // This avoids duplicate listener conflicts and mismatched element IDs.
    console.log('✅ PlantScanner ready — awaiting commands from page');
  }
}

// Initialize scanner when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.plantScanner = new PlantScanner();
});

// Export for module usage
export { PlantScanner };
