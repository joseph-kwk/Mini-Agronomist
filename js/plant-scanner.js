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
      
      // Load MobileNet for general image classification
      this.model = await mobilenet.load();
      console.log('✅ Image classification model loaded');
      
      // Initialize custom disease detection model
      await this.loadDiseaseModel();
      
      console.log('✅ All models loaded successfully');
    } catch (error) {
      console.error('❌ Model loading failed:', error);
      throw error;
    }
  }

  async loadDiseaseModel() {
    // Custom disease detection model (simplified version)
    // In production, this would load a trained model
    console.log('📊 Initializing disease detection model...');
    
    this.diseaseModel = {
      // Disease patterns database
      patterns: {
        'leaf_spot': {
          name: 'Leaf Spot Disease',
          keywords: ['leaf', 'spot', 'fungus', 'brown'],
          severity: 'moderate',
          treatments: [
            'Remove affected leaves immediately',
            'Apply copper-based fungicide',
            'Improve air circulation',
            'Avoid overhead watering'
          ]
        },
        'powdery_mildew': {
          name: 'Powdery Mildew',
          keywords: ['white', 'powder', 'mildew', 'fungus'],
          severity: 'moderate',
          treatments: [
            'Apply sulfur or neem oil spray',
            'Increase sunlight exposure',
            'Reduce humidity around plants',
            'Remove severely infected parts'
          ]
        },
        'rust': {
          name: 'Plant Rust',
          keywords: ['rust', 'orange', 'pustule'],
          severity: 'moderate',
          treatments: [
            'Apply appropriate fungicide',
            'Remove infected leaves',
            'Ensure proper spacing',
            'Water at base of plant'
          ]
        },
        'blight': {
          name: 'Blight',
          keywords: ['blight', 'wilt', 'brown', 'dead'],
          severity: 'severe',
          treatments: [
            'Remove and destroy infected plants',
            'Apply copper fungicide',
            'Rotate crops next season',
            'Disinfect tools after use'
          ]
        },
        'yellowing': {
          name: 'Nutrient Deficiency / Chlorosis',
          keywords: ['yellow', 'pale', 'chlorosis'],
          severity: 'mild',
          treatments: [
            'Test soil pH and nutrients',
            'Apply balanced fertilizer',
            'Add iron supplements if needed',
            'Check for drainage issues'
          ]
        },
        'pest_damage': {
          name: 'Pest Damage',
          keywords: ['hole', 'insect', 'chew', 'damage'],
          severity: 'moderate',
          treatments: [
            'Identify specific pest',
            'Apply appropriate pesticide',
            'Use neem oil for organic option',
            'Introduce beneficial insects'
          ]
        }
      },
      
      // Crop identification database
      crops: {
        'maize': ['corn', 'maize', 'cereal'],
        'tomato': ['tomato', 'fruit', 'vegetable'],
        'potato': ['potato', 'tuber'],
        'wheat': ['wheat', 'grain', 'cereal'],
        'rice': ['rice', 'grain', 'paddy'],
        'soybean': ['soybean', 'soya', 'legume'],
        'cabbage': ['cabbage', 'vegetable', 'brassica'],
        'cotton': ['cotton', 'fiber'],
        'banana': ['banana', 'plantain', 'fruit']
      }
    };
    
    console.log('✅ Disease detection model ready');
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
      
      // Create image element
      const img = await this.loadImage(imageData);
      
      // Run classification
      const classification = await this.classifyImage(img);
      
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
      
      // Compile results
      const results = {
        imageData,
        timestamp: new Date(),
        plant: plantInfo,
        disease: diseaseInfo,
        recommendations
      };
      
      // Save to history
      this.saveToHistory(results);
      
      // Display results
      this.displayResults(results);
      
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
    try {
      // Use MobileNet for classification
      const predictions = await this.model.classify(img);
      console.log('🔍 Classifications:', predictions);
      return predictions;
    } catch (error) {
      console.error('❌ Classification failed:', error);
      throw new Error('Image classification failed');
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
    // Advanced disease detection using image analysis
    const imageFeatures = await this.extractImageFeatures(img);
    
    // Analyze for disease patterns
    let detectedDiseases = [];
    let healthScore = 1.0;

    // Check for disease indicators in classifications
    for (const pred of classifications) {
      const className = pred.className.toLowerCase();
      
      for (const [diseaseKey, diseaseData] of Object.entries(this.diseaseModel.patterns)) {
        for (const keyword of diseaseData.keywords) {
          if (className.includes(keyword)) {
            detectedDiseases.push({
              disease: diseaseData.name,
              severity: diseaseData.severity,
              confidence: pred.probability,
              treatments: diseaseData.treatments
            });
            healthScore -= 0.3;
          }
        }
      }
    }

    // Analyze color distribution for disease indicators
    const colorAnalysis = this.analyzeColors(imageFeatures);
    
    if (colorAnalysis.abnormal) {
      detectedDiseases.push({
        disease: colorAnalysis.suggestedIssue,
        severity: 'mild',
        confidence: colorAnalysis.confidence,
        treatments: this.diseaseModel.patterns[colorAnalysis.diseaseType]?.treatments || [
          'Monitor plant closely',
          'Ensure proper watering',
          'Check soil conditions'
        ]
      });
      healthScore -= 0.2;
    }

    // Determine overall health status
    healthScore = Math.max(0, Math.min(1, healthScore));
    
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
    
    // Healthy plant detection (high green)
    if (avgGreen > 120 && avgGreen > avgRed && avgGreen > avgBlue) {
      return {
        abnormal: false,
        confidence: 0.9
      };
    }
    
    // Yellow leaves (nutrient deficiency)
    if (avgRed > 150 && avgGreen > 140 && avgBlue < 100) {
      return {
        abnormal: true,
        suggestedIssue: 'Yellowing leaves detected - possible nutrient deficiency',
        confidence: 0.75,
        diseaseType: 'yellowing'
      };
    }
    
    // Brown/dead tissue
    if (avgRed > 100 && avgGreen < 90 && avgBlue < 70) {
      return {
        abnormal: true,
        suggestedIssue: 'Brown discoloration - possible disease or stress',
        confidence: 0.70,
        diseaseType: 'blight'
      };
    }
    
    // White powdery appearance
    if (avgRed > 200 && avgGreen > 200 && avgBlue > 200) {
      return {
        abnormal: true,
        suggestedIssue: 'White discoloration - possible powdery mildew',
        confidence: 0.65,
        diseaseType: 'powdery_mildew'
      };
    }
    
    return {
      abnormal: false,
      confidence: 0.6
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
    const tips = {
      'maize': [
        'Ensure 25-30 inches of water during growing season',
        'Apply nitrogen fertilizer in split doses',
        'Control weeds during first 4-6 weeks'
      ],
      'tomato': [
        'Provide support with stakes or cages',
        'Water consistently at soil level',
        'Prune suckers for better fruit production'
      ],
      'potato': [
        'Hill soil around plants as they grow',
        'Water deeply but infrequently',
        'Harvest when foliage begins to yellow'
      ],
      'default': [
        'Follow recommended spacing guidelines',
        'Monitor soil moisture regularly',
        'Apply appropriate fertilizer for crop type'
      ]
    };

    return tips[cropName] || tips['default'];
  }

  // ========================================
  // DISPLAY FUNCTIONS
  // ========================================

  displayResults(results) {
    const resultsSection = document.getElementById('results');
    
    // Show image
    document.getElementById('resultImage').src = results.imageData;
    
    // Plant identification
    document.getElementById('plantSpecies').textContent = results.plant.species;
    document.getElementById('plantType').textContent = results.plant.type;
    document.getElementById('speciesConfidence').style.width = 
      (results.plant.confidence * 100) + '%';
    document.getElementById('speciesConfidenceText').textContent = 
      (results.plant.confidence * 100).toFixed(1) + '%';
    
    // Health status
    const diseaseInfo = document.getElementById('diseaseInfo');
    diseaseInfo.className = 'disease-info ' + 
      (results.disease.status === 'Healthy' ? 'healthy' : '');
    
    const healthStatus = document.getElementById('healthStatus');
    healthStatus.textContent = results.disease.status;
    healthStatus.className = 'status-indicator ' + results.disease.statusClass;
    
    // Disease details
    if (results.disease.diseases.length > 0) {
      const mainDisease = results.disease.diseases[0];
      document.getElementById('diseaseCondition').textContent = mainDisease.disease;
      document.getElementById('diseaseDescription').textContent = 
        `Severity: ${mainDisease.severity.toUpperCase()}`;
    } else {
      document.getElementById('diseaseCondition').textContent = 'No diseases detected';
      document.getElementById('diseaseDescription').textContent = 
        'Plant appears to be in good health';
    }
    
    document.getElementById('diseaseConfidence').style.width = 
      (results.disease.confidence * 100) + '%';
    document.getElementById('diseaseConfidenceText').textContent = 
      (results.disease.confidence * 100).toFixed(1) + '%';
    
    // Recommendations
    const recList = document.getElementById('recommendationsList');
    recList.innerHTML = '';
    
    for (const rec of results.recommendations) {
      const recSection = document.createElement('div');
      recSection.style.marginBottom = '15px';
      
      const title = document.createElement('h4');
      title.textContent = rec.title;
      title.style.marginBottom = '10px';
      recSection.appendChild(title);
      
      const list = document.createElement('ul');
      for (const item of rec.items) {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      }
      recSection.appendChild(list);
      
      recList.appendChild(recSection);
    }
    
    resultsSection.classList.add('show');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

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
    // Start camera
    document.getElementById('startCamera').addEventListener('click', () => {
      this.startCamera();
    });

    // Capture and analyze
    document.getElementById('captureBtn').addEventListener('click', async () => {
      const imageData = this.captureImage();
      await this.analyzeImage(imageData);
    });

    // Upload image
    document.getElementById('uploadBtn').addEventListener('click', () => {
      document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          await this.analyzeImage(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    });

    // Scan again
    document.getElementById('scanAgainBtn').addEventListener('click', () => {
      document.getElementById('results').classList.remove('show');
      this.video.scrollIntoView({ behavior: 'smooth' });
    });

    // Save result
    document.getElementById('saveResultBtn').addEventListener('click', () => {
      alert('Result saved to history!');
    });
    
    // Display history on load
    this.updateHistoryDisplay();
  }
}

// Initialize scanner when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.plantScanner = new PlantScanner();
});

export default PlantScanner;
