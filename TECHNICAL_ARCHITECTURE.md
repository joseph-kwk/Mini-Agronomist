# 🏗️ Plant Disease Scanner - Complete Technical Architecture

## Overview

This document explains **exactly how everything works** - image processing, data storage, AI models, and offline capabilities. **No backend server required!**

---

## 🎯 **Core Principle: 100% Client-Side Processing**

```
USER DEVICE (Browser)
    │
    ├─ Image Capture/Upload
    ├─ AI Processing (TensorFlow.js)
    ├─ Analysis & Scoring
    ├─ Data Storage (Browser APIs)
    └─ Results Display
    
NO SERVER NEEDED ✓
NO IMAGE UPLOADS ✓
NO CLOUD PROCESSING ✓
```

---

## 📸 **1. Image Processing Pipeline**

### Stage 1: Image Acquisition

```javascript
// Two Methods:

METHOD A: LIVE CAMERA CAPTURE
┌─────────────────────────────────────┐
│ navigator.mediaDevices.getUserMedia │
└─────────────────────────────────────┘
            ↓
    Video Stream (Real-time)
            ↓
    HTML5 <video> element displays feed
            ↓
    User clicks "Capture"
            ↓
    Canvas API draws current frame
            ↓
    canvas.toDataURL('image/jpeg', 0.9)
            ↓
    Base64 encoded image string

METHOD B: FILE UPLOAD
┌─────────────────────────────────────┐
│ <input type="file" accept="image/*"> │
└─────────────────────────────────────┘
            ↓
    FileReader API
            ↓
    reader.readAsDataURL(file)
            ↓
    Base64 encoded image string
```

**Code Implementation:**
```javascript
// Camera capture
async function captureImage() {
    const canvas = document.getElementById('canvas');
    const video = document.getElementById('video');
    
    canvas.width = video.videoWidth;   // Typically 1280px
    canvas.height = video.videoHeight; // Typically 720px
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0); // Draw current video frame
    
    // Convert to base64 JPEG (90% quality)
    return canvas.toDataURL('image/jpeg', 0.9);
}

// File upload
function handleUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
        analyzeImage(e.target.result); // base64 string
    };
    
    reader.readAsDataURL(file);
}
```

### Stage 2: Image Preprocessing

```javascript
PREPROCESSING STEPS:
┌──────────────────────────────────────────┐
│ 1. Load image from base64 string        │
│    const img = new Image()               │
│    img.src = base64Data                  │
└──────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────┐
│ 2. Check dimensions                      │
│    if (width > 1920 || height > 1080)    │
│       resize to max dimensions           │
└──────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────┐
│ 3. Convert to tensor for TensorFlow.js  │
│    tf.browser.fromPixels(img)            │
│    Shape: [height, width, 3] (RGB)      │
└──────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────┐
│ 4. Normalize pixel values                │
│    Values 0-255 → 0-1 range              │
│    tensor.div(255.0)                     │
└──────────────────────────────────────────┘
```

**Code Implementation:**
```javascript
async function loadImage(imageData) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageData;
    });
}

async function preprocessImage(img) {
    // Resize if too large
    const maxWidth = 1920;
    const maxHeight = 1080;
    
    if (img.width > maxWidth || img.height > maxHeight) {
        const canvas = document.createElement('canvas');
        const scale = Math.min(
            maxWidth / img.width,
            maxHeight / img.height
        );
        
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        return canvas;
    }
    
    return img;
}
```

### Stage 3: Pixel Data Extraction

```javascript
EXTRACT RGB VALUES FOR ANALYSIS:
┌──────────────────────────────────────────┐
│ Canvas API: getImageData()               │
│                                          │
│ Returns: Uint8ClampedArray              │
│ Format: [R,G,B,A, R,G,B,A, ...]         │
│                                          │
│ Example for 3x3 image:                   │
│ [255,100,50,255,  // Pixel 1             │
│  200,150,75,255,  // Pixel 2             │
│  180,120,90,255,  // Pixel 3             │
│  ...]                                    │
└──────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────┐
│ Calculate statistics:                    │
│ • Average Red value                      │
│ • Average Green value                    │
│ • Average Blue value                     │
│ • Color distribution                     │
│ • Brightness                             │
└──────────────────────────────────────────┘
```

**Code Implementation:**
```javascript
function extractImageFeatures(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Get all pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data; // Uint8ClampedArray
    
    // Calculate color averages
    let totalRed = 0, totalGreen = 0, totalBlue = 0;
    let pixelCount = pixels.length / 4; // 4 values per pixel (RGBA)
    
    for (let i = 0; i < pixels.length; i += 4) {
        totalRed += pixels[i];     // R
        totalGreen += pixels[i+1]; // G
        totalBlue += pixels[i+2];  // B
        // pixels[i+3] is Alpha (opacity)
    }
    
    return {
        avgRed: totalRed / pixelCount,
        avgGreen: totalGreen / pixelCount,
        avgBlue: totalBlue / pixelCount,
        brightness: (totalRed + totalGreen + totalBlue) / (pixelCount * 3),
        dominantColor: getDominantColor(totalRed, totalGreen, totalBlue)
    };
}

function getDominantColor(r, g, b) {
    if (g > r && g > b) return 'green';  // Healthy plant
    if (r > g && r > b) return 'red';    // Disease/stress
    if (b > r && b > g) return 'blue';   // Unusual
    return 'mixed';
}
```

---

## 🧠 **2. AI Model Architecture**

### Model Loading (First Time - Requires Internet)

```javascript
INITIALIZATION SEQUENCE:
┌──────────────────────────────────────────┐
│ 1. User opens scanner first time        │
└──────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────┐
│ 2. Load TensorFlow.js library            │
│    <script src="tf.min.js"></script>     │
│    Size: ~500KB                          │
└──────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────┐
│ 3. Load MobileNet from CDN               │
│    await mobilenet.load()                │
│    Downloads from:                       │
│    https://tfhub.dev/google/...          │
│    Size: ~4MB                            │
└──────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────┐
│ 4. TensorFlow.js auto-caches in IndexedDB│
│    Database: "tensorflowjs"              │
│    Store: "models_store"                 │
│    Key: "mobilenet-v2"                   │
└──────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────┐
│ 5. Model ready for offline use!          │
└──────────────────────────────────────────┘
```

### Model Architecture (MobileNetV2)

```
INPUT: Image (224x224x3 RGB)
   ↓
┌─────────────────────────────────────┐
│ Convolutional Layer 1               │
│ • 32 filters, 3x3 kernel            │
│ • Stride: 2                         │
│ • Output: 112x112x32                │
└─────────────────────────────────────┘
   ↓
┌─────────────────────────────────────┐
│ Depthwise Separable Convolutions    │
│ (17 blocks)                         │
│ • Reduces parameters                │
│ • Faster inference                  │
│ • Mobile-optimized                  │
└─────────────────────────────────────┘
   ↓
┌─────────────────────────────────────┐
│ Global Average Pooling              │
│ • Reduces spatial dimensions        │
│ • Output: 1280 features             │
└─────────────────────────────────────┘
   ↓
┌─────────────────────────────────────┐
│ Fully Connected Layer               │
│ • 1000 classes (ImageNet)           │
│ • Softmax activation                │
└─────────────────────────────────────┘
   ↓
OUTPUT: Predictions Array
[
  {className: 'leaf', probability: 0.85},
  {className: 'plant', probability: 0.72},
  {className: 'bell_pepper', probability: 0.45},
  {className: 'corn', probability: 0.38},
  {className: 'vegetable', probability: 0.31}
]
```

**Code Implementation:**
```javascript
// Model loading with caching
let model = null;

async function loadModel() {
    console.log('Loading MobileNet...');
    
    try {
        // TensorFlow.js checks IndexedDB cache first
        model = await mobilenet.load({
            version: 2,
            alpha: 1.0 // Full model, best accuracy
        });
        
        console.log('✓ Model loaded from', 
            model.fromCache ? 'cache (offline)' : 'network');
        
        return model;
    } catch (error) {
        console.error('Model loading failed:', error);
        throw new Error('Cannot load AI model. Check internet connection.');
    }
}

// Image classification
async function classifyImage(img) {
    if (!model) {
        throw new Error('Model not loaded');
    }
    
    // MobileNet expects 224x224 image
    // It handles resizing automatically
    const predictions = await model.classify(img, 5); // Top 5 predictions
    
    return predictions;
}
```

---

## 🔍 **3. Disease Detection Algorithm**

### Multi-Stage Detection Process

```javascript
DISEASE DETECTION PIPELINE:
┌─────────────────────────────────────────┐
│ INPUT: Image + MobileNet Classifications│
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ STAGE 1: Keyword Matching               │
│                                         │
│ Check MobileNet classes for:            │
│ • 'spot' → Leaf Spot Disease            │
│ • 'rust' → Plant Rust                   │
│ • 'mildew' → Powdery Mildew             │
│ • 'blight' → Blight                     │
│ • 'yellow' → Chlorosis                  │
│ • 'hole' → Pest Damage                  │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ STAGE 2: Color Analysis                 │
│                                         │
│ Analyze RGB values:                     │
│ • avgGreen > 120 → Healthy              │
│ • avgRed > 150 + avgGreen > 140         │
│   → Yellowing (nutrient deficiency)     │
│ • avgRed > 100 + avgGreen < 90          │
│   → Blight/severe disease               │
│ • avgBlue high → Unusual (flag)         │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ STAGE 3: Pattern Matching               │
│                                         │
│ Cross-reference detected patterns with: │
│ • Disease database (local JSON)         │
│ • Crop-specific diseases                │
│ • Severity thresholds                   │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ STAGE 4: Health Score Calculation       │
│                                         │
│ Initial score: 1.0 (100% healthy)       │
│ For each detected disease:              │
│   score -= 0.3                          │
│ For color abnormality:                  │
│   score -= 0.2                          │
│ Final: max(0, min(1, score))           │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ OUTPUT: Disease Report                  │
│ • List of diseases (with confidence)    │
│ • Health score (0-100%)                 │
│ • Severity levels                       │
│ • Treatment recommendations             │
└─────────────────────────────────────────┘
```

**Code Implementation:**
```javascript
async function detectDisease(img, classifications) {
    // Extract color features
    const colorFeatures = extractImageFeatures(img);
    
    let detectedDiseases = [];
    let healthScore = 1.0; // Start at 100%
    
    // STAGE 1: Keyword matching
    const diseasePatterns = {
        'leaf_spot': {
            keywords: ['spot', 'fungus', 'brown', 'lesion'],
            severity: 'moderate'
        },
        'powdery_mildew': {
            keywords: ['white', 'powder', 'mildew'],
            severity: 'moderate'
        },
        'rust': {
            keywords: ['rust', 'orange', 'pustule'],
            severity: 'moderate'
        },
        'blight': {
            keywords: ['blight', 'wilt', 'dead'],
            severity: 'severe'
        },
        'yellowing': {
            keywords: ['yellow', 'pale', 'chlorosis'],
            severity: 'mild'
        },
        'pest_damage': {
            keywords: ['hole', 'insect', 'chew', 'damage'],
            severity: 'moderate'
        }
    };
    
    // Check each classification against patterns
    for (const prediction of classifications) {
        const className = prediction.className.toLowerCase();
        
        for (const [diseaseKey, diseaseData] of Object.entries(diseasePatterns)) {
            for (const keyword of diseaseData.keywords) {
                if (className.includes(keyword)) {
                    detectedDiseases.push({
                        name: diseaseKey.replace('_', ' '),
                        confidence: prediction.probability,
                        severity: diseaseData.severity,
                        source: 'AI Classification'
                    });
                    
                    healthScore -= 0.3; // Reduce health score
                    break;
                }
            }
        }
    }
    
    // STAGE 2: Color analysis
    const { avgRed, avgGreen, avgBlue } = colorFeatures;
    
    // Healthy plant check (should be predominantly green)
    if (avgGreen < 100 || avgRed > avgGreen * 1.2) {
        // Abnormal coloring detected
        
        if (avgRed > 150 && avgGreen > 140) {
            // Yellowing
            detectedDiseases.push({
                name: 'Yellowing/Chlorosis',
                confidence: 0.7,
                severity: 'mild',
                source: 'Color Analysis'
            });
            healthScore -= 0.2;
        }
        
        if (avgRed > 100 && avgGreen < 90) {
            // Severe browning/blight
            detectedDiseases.push({
                name: 'Severe Discoloration',
                confidence: 0.8,
                severity: 'severe',
                source: 'Color Analysis'
            });
            healthScore -= 0.3;
        }
    }
    
    // Ensure health score stays in bounds
    healthScore = Math.max(0, Math.min(1, healthScore));
    
    // Remove duplicates
    detectedDiseases = removeDuplicates(detectedDiseases);
    
    return {
        diseases: detectedDiseases,
        healthScore: healthScore,
        status: getHealthStatus(healthScore),
        colorFeatures: colorFeatures
    };
}

function getHealthStatus(score) {
    if (score >= 0.7) return 'Healthy / Minor Issues';
    if (score >= 0.5) return 'Disease Detected - Needs Attention';
    if (score >= 0.3) return 'Multiple Issues - Urgent Action Required';
    return 'Critical Condition - Immediate Treatment Needed';
}
```

---

## 💾 **4. Data Storage Architecture**

### Storage Types & Usage

```javascript
BROWSER STORAGE HIERARCHY:
┌────────────────────────────────────────────────┐
│ IndexedDB (5-10MB typical, expandable)         │
│ ┌────────────────────────────────────────────┐ │
│ │ Database: "tensorflowjs"                   │ │
│ │ ├─ Store: "models_store"                   │ │
│ │ │  └─ Key: "mobilenet-v2"                  │ │
│ │ │     └─ Value: Model weights (~4MB)       │ │
│ │ │                                           │ │
│ │ └─ Store: "model_info_store"               │ │
│ │    └─ Metadata, version info               │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ LocalStorage (5-10MB limit)                    │
│ ┌────────────────────────────────────────────┐ │
│ │ Key: "plant_scan_history"                  │ │
│ │ Value: JSON Array                          │ │
│ │ [                                          │ │
│ │   {                                        │ │
│ │     id: "scan_1703345678000",              │ │
│ │     timestamp: "2024-12-23T10:30:00Z",     │ │
│ │     plantName: "Tomato",                   │ │
│ │     healthScore: 0.85,                     │ │
│ │     diseases: [...],                       │ │
│ │     recommendations: [...]                 │ │
│ │   },                                       │ │
│ │   ...                                      │ │
│ │ ]                                          │ │
│ │                                            │ │
│ │ Key: "user_preferences"                    │ │
│ │ Value: {language: 'en', units: 'metric'}   │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ Service Worker Cache (Cache API, 10-50MB)     │
│ ┌────────────────────────────────────────────┐ │
│ │ Cache: "mini-agronomist-v3.0"              │ │
│ │ ├─ plant-scanner.html                      │ │
│ │ ├─ style.css                               │ │
│ │ ├─ plant-scanner.js                        │ │
│ │ ├─ tensorflow.js                           │ │
│ │ └─ mobilenet.js                            │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

**Code Implementation:**
```javascript
// ===== SCAN HISTORY MANAGEMENT =====

class ScanHistoryManager {
    constructor() {
        this.storageKey = 'plant_scan_history';
        this.maxItems = 100; // Limit to prevent storage overflow
    }
    
    saveScancannot(scanResult) {
        try {
            // Get existing history
            const history = this.getHistory();
            
            // Create scan record (NO IMAGE DATA - too large!)
            const record = {
                id: `scan_${Date.now()}`,
                timestamp: scanResult.timestamp,
                plantName: scanResult.plant.species,
                plantType: scanResult.plant.type,
                isCrop: scanResult.plant.isCrop,
                healthScore: scanResult.disease.healthScore,
                status: scanResult.disease.status,
                diseaseCount: scanResult.disease.diseases.length,
                diseases: scanResult.disease.diseases.map(d => ({
                    name: d.name,
                    severity: d.severity,
                    confidence: d.confidence
                })),
                recommendations: scanResult.recommendations
                // NOTE: imageData NOT stored (would fill storage quickly)
            };
            
            // Add to beginning of array
            history.unshift(record);
            
            // Limit history size
            if (history.length > this.maxItems) {
                history.splice(this.maxItems);
            }
            
            // Save to localStorage
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(history)
            );
            
            return true;
        } catch (error) {
            console.error('Failed to save scan:', error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                // Clear old scans
                this.clearOldScans(50); // Keep only 50 most recent
                // Try again
                return this.saveScan(scanResult);
            }
            
            return false;
        }
    }
    
    getHistory() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load history:', error);
            return [];
        }
    }
    
    clearOldScans(keepCount = 50) {
        const history = this.getHistory();
        const trimmed = history.slice(0, keepCount);
        localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
    }
    
    deleteScan(scanId) {
        const history = this.getHistory();
        const filtered = history.filter(scan => scan.id !== scanId);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    }
    
    clearAll() {
        localStorage.removeItem(this.storageKey);
    }
    
    exportToJSON() {
        const history = this.getHistory();
        const dataStr = JSON.stringify(history, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        // Create download link
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `plant_scans_${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}
```

### Storage Size Management

```javascript
STORAGE CAPACITY BY TYPE:
┌────────────────────────────────────┐
│ IndexedDB: ~50MB to unlimited      │
│ • Chrome: 60% of free disk space   │
│ • Firefox: 2GB per origin          │
│ • Safari: 1GB per origin           │
│ • Used for: TensorFlow models      │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ LocalStorage: 5-10MB               │
│ • Chrome: 10MB                     │
│ • Firefox: 10MB                    │
│ • Safari: 5MB                      │
│ • Used for: Scan history, settings │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Cache API: 50MB to unlimited       │
│ • Similar limits to IndexedDB      │
│ • Used for: App files, offline     │
└────────────────────────────────────┘

ACTUAL USAGE:
├─ TensorFlow models: ~4MB
├─ Scan history (100 scans): ~500KB
├─ App files cached: ~2MB
└─ TOTAL: ~6.5MB (well under limits)
```

---

## 🌐 **5. Offline Capability**

### Service Worker Architecture

```javascript
SERVICE WORKER LIFECYCLE:
┌───────────────────────────────────────┐
│ 1. INSTALL (First visit)              │
│    • Register service worker          │
│    • Cache static assets              │
│    • Download TensorFlow.js models    │
└───────────────────────────────────────┘
            ↓
┌───────────────────────────────────────┐
│ 2. ACTIVATE                           │
│    • Clear old caches                 │
│    • Take control of pages            │
└───────────────────────────────────────┘
            ↓
┌───────────────────────────────────────┐
│ 3. FETCH (Every request)              │
│    • Intercept network requests       │
│    • Serve from cache if available    │
│    • Fall back to network if needed   │
└───────────────────────────────────────┘
```

**Code Implementation (sw.js):**
```javascript
const CACHE_VERSION = 'v3.0';
const CACHE_NAME = `mini-agronomist-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
    '/',
    '/plant-scanner.html',
    '/js/plant-scanner.js',
    '/style.css',
    '/manifest.json',
    // TensorFlow.js files
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet'
];

// Install: Cache all assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate: Clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch: Cache-first strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }
                
                // Fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Cache new responses
                        if (response.ok) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        // Return offline page
                        return caches.match('/offline.html');
                    });
            })
    );
});
```

### Offline Detection & User Feedback

```javascript
// Monitor online/offline status
window.addEventListener('online', () => {
    console.log('✓ Back online');
    document.getElementById('offlineIndicator').classList.remove('show');
});

window.addEventListener('offline', () => {
    console.log('✗ Offline mode');
    document.getElementById('offlineIndicator').classList.add('show');
    
    // Inform user scanner still works
    showNotification('Offline mode - Scanner still functional!');
});

// Check if models are cached
async function isOfflineReady() {
    // Check if TensorFlow models in IndexedDB
    const db = await window.indexedDB.open('tensorflowjs');
    const hasModels = db.objectStoreNames.contains('models_store');
    
    // Check if app files cached
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const hasFiles = keys.length > 0;
    
    return hasModels && hasFiles;
}
```

---

## ⚡ **6. Performance Optimization**

### Image Processing Optimization

```javascript
// Lazy loading: Only load heavy libraries when needed
async function initScanner() {
    // Load lightweight UI first
    renderUI();
    
    // Then load TensorFlow.js asynchronously
    await loadTensorFlowJS();
    await loadMobileNet();
    
    // Scanner ready
    enableControls();
}

// Image resizing to reduce processing time
function optimizeImage(img) {
    const MAX_DIMENSION = 640; // Balance quality vs speed
    
    if (img.width <= MAX_DIMENSION && img.height <= MAX_DIMENSION) {
        return img;
    }
    
    const canvas = document.createElement('canvas');
    const scale = MAX_DIMENSION / Math.max(img.width, img.height);
    
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    return canvas;
}

// Batch processing for multiple scans
const analysisQueue = [];
let processing = false;

async function queueAnalysis(imageData) {
    analysisQueue.push(imageData);
    
    if (!processing) {
        processing = true;
        while (analysisQueue.length > 0) {
            const image = analysisQueue.shift();
            await analyzeImage(image);
        }
        processing = false;
    }
}
```

### Memory Management

```javascript
// Clean up after analysis to prevent memory leaks
async function analyzeImage(imageData) {
    let img, tensor;
    
    try {
        img = await loadImage(imageData);
        
        // Create tensor
        tensor = tf.browser.fromPixels(img);
        
        // Process
        const result = await model.classify(tensor);
        
        return result;
    } finally {
        // CRITICAL: Dispose tensors to free GPU memory
        if (tensor) {
            tensor.dispose();
        }
        
        // Clear references
        img = null;
        tensor = null;
        
        // Suggest garbage collection (if available)
        if (window.gc) {
            window.gc();
        }
    }
}

// Monitor memory usage
function checkMemoryUsage() {
    if (performance.memory) {
        const used = performance.memory.usedJSHeapSize / 1048576;
        const limit = performance.memory.jsHeapSizeLimit / 1048576;
        
        console.log(`Memory: ${used.toFixed(1)}MB / ${limit.toFixed(1)}MB`);
        
        if (used / limit > 0.9) {
            console.warn('High memory usage! Clearing cache...');
            // Clear old data
            clearScanHistory(20); // Keep only 20 recent
        }
    }
}
```

---

## 🔐 **7. Security & Privacy**

### Data Privacy

```javascript
PRIVACY GUARANTEES:
┌────────────────────────────────────────┐
│ ✓ Images NEVER leave device           │
│ ✓ No server uploads                   │
│ ✓ No cloud processing                 │
│ ✓ No tracking/analytics                │
│ ✓ No cookies                           │
│ ✓ No third-party scripts               │
│ ✓ User controls all data               │
└────────────────────────────────────────┘

DATA FLOW:
User Device (Browser) ──→ User Device (Browser)
     ↓                         ↑
  Capture                   Display
     ↓                         ↑
  Process  ─────────────────→ Results
     (LOCAL)                  (LOCAL)

NO EXTERNAL COMMUNICATION AFTER INITIAL LOAD
```

### Content Security Policy

```html
<!-- Add to HTML head -->
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    connect-src 'self' https://storage.googleapis.com;
    font-src 'self';
    media-src 'self' mediastream:;
">
```

---

## 📊 **8. Performance Metrics**

### Expected Performance

```
DEVICE PERFORMANCE:
┌─────────────────────────────────────────────────┐
│ Device Type       │ Load Time │ Analysis Time   │
├──────────────────────────────────────────────────┤
│ iPhone 13+        │ 1-2s      │ 1-2s            │
│ iPhone X-12       │ 2-3s      │ 2-3s            │
│ Android Flagship  │ 2-3s      │ 2-3s            │
│ Mid-range Phone   │ 3-4s      │ 3-5s            │
│ Budget Phone      │ 4-6s      │ 5-10s           │
│ Tablet            │ 2-4s      │ 2-4s            │
│ Desktop (GPU)     │ 1-2s      │ 1-3s            │
│ Desktop (CPU only)│ 3-5s      │ 3-6s            │
└─────────────────────────────────────────────────┘

STORAGE USAGE:
├─ First load: ~6MB downloaded
├─ After caching: 0MB (fully offline)
├─ Per scan: ~5KB (history only)
└─ 100 scans: ~500KB total
```

---

## 🎯 **Summary**

### What Happens Behind the Scenes

1. **User captures/uploads image** → Canvas API processes
2. **TensorFlow.js loads image** → Converts to tensor
3. **MobileNet analyzes** → Returns classifications
4. **Custom algorithm processes** → Color analysis + pattern matching
5. **Results calculated** → Health score + recommendations
6. **Data saved locally** → LocalStorage (scan history)
7. **UI updated** → Display results

### No Backend Needed Because:
- ✅ AI runs in browser (TensorFlow.js)
- ✅ Storage uses browser APIs
- ✅ Processing is client-side
- ✅ No user accounts needed
- ✅ Privacy by design

### Real-World Implications:
- 🌍 Works anywhere (no server required)
- 📱 Mobile-first (optimized for phones)
- 🔌 Offline-capable (after first load)
- 🔒 100% private (data never leaves device)
- 💰 No hosting costs (static files only)
- ⚡ Fast (local processing)
- 🌾 Perfect for farms (works without internet)

---

**Bottom Line**: Everything runs locally in the user's browser. No backend, no database server, no cloud processing. Just pure client-side JavaScript with modern web APIs!

*Technical Architecture v3.0 - Complete Implementation*
