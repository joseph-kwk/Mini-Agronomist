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
          isCrop: plantInfo.isCrop
        },
        healthScore: diseaseInfo.healthScore,
        status: diseaseInfo.status,
        diseases: diseaseInfo.diseases.map(d => ({
          name: d.disease,
          confidence: d.confidence,
          severity: d.severity
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
    // Check if any prediction is plant-related
    const plantKeywords = [
      'plant', 'leaf', 'flower', 'crop', 'vegetable', 'fruit',
      'tree', 'bush', 'herb', 'grass', 'seedling', 'vine',
      'maize', 'corn', 'tomato', 'potato', 'wheat', 'rice',
      'cabbage', 'lettuce', 'spinach', 'bean', 'pea'
    ];

    for (const pred of predictions) {
      const className = pred.className.toLowerCase();
      for (const keyword of plantKeywords) {
        if (className.includes(keyword)) {
          return true;
        }
      }
    }

    // Check confidence - if top prediction is > 30%, assume it might be a plant
    if (predictions[0].probability > 0.3) {
      return true;
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

    // Method 3: Texture and pattern analysis
    const textureAnalysis = this.analyzeTexture(imageFeatures);
    if (textureAnalysis.abnormal) {
      healthScore -= 0.1;
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

    return {
      status,
      statusClass,
      healthScore,
      diseases: detectedDiseases,
      confidence: detectedDiseases.length > 0 ?
        detectedDiseases[0].confidence : 0.95
    };
  }

  async extractImageFeatures(img) {
    // Extract color and texture features
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    // Calculate color statistics
    let totalR = 0, totalG = 0, totalB = 0;
    let pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
    }

    return {
      avgRed: totalR / pixelCount,
      avgGreen: totalG / pixelCount,
      avgBlue: totalB / pixelCount,
      imageData: data
    };
  }

  analyzeColors(features) {
    const { avgRed, avgGreen, avgBlue } = features;

    // Calculate color ratios for better analysis
    const totalColor = avgRed + avgGreen + avgBlue;
    const greenRatio = avgGreen / totalColor;
    const redRatio = avgRed / totalColor;
    const blueRatio = avgBlue / totalColor;

    const colorProfile = {
      avgRed: avgRed.toFixed(1),
      avgGreen: avgGreen.toFixed(1),
      avgBlue: avgBlue.toFixed(1),
      greenRatio: (greenRatio * 100).toFixed(1) + '%'
    };

    // Healthy plant detection (green dominant)
    if (greenRatio > 0.38 && avgGreen > avgRed && avgGreen > avgBlue && avgGreen > 100) {
      return {
        abnormal: false,
        confidence: 0.90,
        profile: colorProfile
      };
    }

    // Yellow/chlorotic leaves (nutrient deficiency)
    if (avgRed > 150 && avgGreen > 140 && avgBlue < 110 && redRatio > 0.35) {
      return {
        abnormal: true,
        suggestedIssue: 'Chlorosis / Nutrient Deficiency',
        confidence: 0.72,
        diseaseType: 'yellowing',
        profile: colorProfile,
        note: 'Yellow discoloration suggests nitrogen, iron, or magnesium deficiency'
      };
    }

    // Brown/necrotic tissue (blight, leaf spot)
    if (avgRed > 90 && avgGreen < 95 && avgBlue < 75 && greenRatio < 0.32) {
      return {
        abnormal: true,
        suggestedIssue: 'Blight',
        confidence: 0.68,
        diseaseType: 'blight',
        profile: colorProfile,
        note: 'Brown/dark tissue indicates cell death - possible blight or severe leaf spot'
      };
    }

    // White/gray powdery appearance (powdery mildew)
    if (avgRed > 200 && avgGreen > 200 && avgBlue > 190 && totalColor > 600) {
      return {
        abnormal: true,
        suggestedIssue: 'Powdery Mildew (Erysiphales)',
        confidence: 0.70,
        diseaseType: 'powdery_mildew',
        profile: colorProfile,
        note: 'White powdery coating on leaf surface'
      };
    }

    // Orange/rust colored (rust disease)
    if (avgRed > 160 && avgGreen > 90 && avgGreen < 140 && avgBlue < 90 && redRatio > 0.40) {
      return {
        abnormal: true,
        suggestedIssue: 'Plant Rust (Puccinia spp.)',
        confidence: 0.65,
        diseaseType: 'rust',
        profile: colorProfile,
        note: 'Orange/rust pustules on leaf surface'
      };
    }

    // Dark spots (bacterial or fungal spot diseases)
    if (avgRed < 100 && avgGreen < 80 && avgBlue < 70 && totalColor < 240) {
      return {
        abnormal: true,
        suggestedIssue: 'Leaf Spot Disease (Cercospora/Septoria)',
        confidence: 0.63,
        diseaseType: 'leaf_spot',
        profile: colorProfile,
        note: 'Dark spots indicate fungal or bacterial infection'
      };
    }

    // Slight abnormality
    if (greenRatio < 0.33 && avgGreen < 100) {
      return {
        abnormal: true,
        suggestedIssue: 'Plant stress detected',
        confidence: 0.55,
        diseaseType: 'yellowing',
        profile: colorProfile,
        note: 'Color analysis suggests plant stress - monitor closely'
      };
    }

    return {
      abnormal: false,
      confidence: 0.70,
      profile: colorProfile
    };
  }

  analyzeTexture(features) {
    // Simple texture analysis based on pixel variance
    // In a production system, this would use more sophisticated algorithms
    const { imageData } = features;

    if (!imageData || imageData.length < 1000) {
      return { abnormal: false, confidence: 0.5 };
    }

    // Sample pixels to calculate variance (performance optimization)
    let sumVariance = 0;
    let sampleCount = 0;
    const sampleStep = Math.floor(imageData.length / 400); // Sample ~100 pixels

    for (let i = 0; i < imageData.length - 8; i += sampleStep) {
      const r1 = imageData[i];
      const g1 = imageData[i + 1];
      const b1 = imageData[i + 2];
      const r2 = imageData[i + 4];
      const g2 = imageData[i + 5];
      const b2 = imageData[i + 6];

      const variance = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      sumVariance += variance;
      sampleCount++;
    }

    const avgVariance = sampleCount > 0 ? sumVariance / sampleCount : 0;

    // High variance suggests spots, lesions, or irregular patterns
    if (avgVariance > 60) {
      return {
        abnormal: true,
        confidence: 0.60,
        note: 'High texture variance detected - possible spots or lesions',
        variance: avgVariance.toFixed(1)
      };
    }

    // Very low variance might indicate powdery coating
    if (avgVariance < 15) {
      return {
        abnormal: true,
        confidence: 0.55,
        note: 'Very uniform texture - possible powdery mildew coating',
        variance: avgVariance.toFixed(1)
      };
    }

    return {
      abnormal: false,
      confidence: 0.70,
      variance: avgVariance.toFixed(1)
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
          <strong>${item.plant.species}</strong>
          <div class="status-indicator ${item.disease.statusClass}">${item.disease.status}</div>
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
    // Start camera - use correct button ID
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.startCamera();
      });
    }

    // Capture and analyze
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn) {
      captureBtn.addEventListener('click', async () => {
        const imageData = this.captureImage();
        await this.analyzeImage(imageData);
      });
    }

    // Upload image
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            await this.analyzeImage(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Scan again
    const scanAgainBtn = document.getElementById('scanAgainBtn');
    if (scanAgainBtn) {
      scanAgainBtn.addEventListener('click', () => {
        const results = document.getElementById('results');
        if (results) {
          results.classList.remove('show');
        }
        if (this.video) {
          this.video.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Save result
    const saveResultBtn = document.getElementById('saveResultBtn');
    if (saveResultBtn) {
      saveResultBtn.addEventListener('click', () => {
        alert('Result saved to history!');
      });
    }

    console.log('✅ Event listeners setup complete');
  }
}

// Initialize scanner when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.plantScanner = new PlantScanner();
});

// Export for module usage
export { PlantScanner };
