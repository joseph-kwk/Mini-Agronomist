// Model Persistence System
// Handles saving, loading, and versioning of prediction models

class ModelPersistence {
  constructor() {
    this.modelRegistry = new Map();
    this.versionHistory = [];
    this.storagePrefix = 'mini_agronomist_model_';
  }

  // ========================================
  // TENSORFLOW.JS MODEL PERSISTENCE
  // ========================================

  async saveModel(model, modelName, metadata = {}) {
    try {
      console.log(`💾 Saving model: ${modelName}`);
      
      // Check if TensorFlow.js is available
      if (typeof tf === 'undefined') {
        throw new Error('TensorFlow.js is not loaded');
      }

      // Save to IndexedDB
      const savePath = `indexeddb://${this.storagePrefix}${modelName}`;
      await model.save(savePath);

      // Save metadata
      const modelInfo = {
        name: modelName,
        savePath,
        savedAt: new Date(),
        version: this.generateVersion(),
        metadata: {
          ...metadata,
          modelType: model.constructor.name,
          inputShape: model.inputs[0].shape,
          outputShape: model.outputs[0].shape,
          trainable: model.trainable,
          layers: model.layers.length
        }
      };

      this.modelRegistry.set(modelName, modelInfo);
      this.versionHistory.push(modelInfo);
      
      this.saveRegistry();
      
      console.log(`✅ Model saved successfully: ${modelName} (v${modelInfo.version})`);
      return modelInfo;
      
    } catch (error) {
      console.error(`❌ Failed to save model ${modelName}:`, error);
      throw error;
    }
  }

  async loadModel(modelName) {
    try {
      console.log(`📂 Loading model: ${modelName}`);
      
      if (typeof tf === 'undefined') {
        throw new Error('TensorFlow.js is not loaded');
      }

      const modelInfo = this.modelRegistry.get(modelName);
      
      if (!modelInfo) {
        throw new Error(`Model ${modelName} not found in registry`);
      }

      const model = await tf.loadLayersModel(modelInfo.savePath);
      
      console.log(`✅ Model loaded successfully: ${modelName}`);
      return { model, metadata: modelInfo.metadata };
      
    } catch (error) {
      console.error(`❌ Failed to load model ${modelName}:`, error);
      throw error;
    }
  }

  async deleteModel(modelName) {
    try {
      console.log(`🗑️ Deleting model: ${modelName}`);
      
      const modelInfo = this.modelRegistry.get(modelName);
      
      if (!modelInfo) {
        throw new Error(`Model ${modelName} not found`);
      }

      // Remove from IndexedDB
      if (typeof tf !== 'undefined') {
        await tf.io.removeModel(modelInfo.savePath);
      }

      // Remove from registry
      this.modelRegistry.delete(modelName);
      this.saveRegistry();
      
      console.log(`✅ Model deleted: ${modelName}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to delete model ${modelName}:`, error);
      throw error;
    }
  }

  // ========================================
  // STATISTICAL MODEL PERSISTENCE
  // ========================================

  saveStatisticalModel(model, modelName, metadata = {}) {
    try {
      console.log(`💾 Saving statistical model: ${modelName}`);
      
      const modelData = {
        name: modelName,
        type: 'statistical',
        savedAt: new Date(),
        version: this.generateVersion(),
        data: this.serializeModel(model),
        metadata
      };

      // Save to localStorage
      const key = `${this.storagePrefix}stat_${modelName}`;
      localStorage.setItem(key, JSON.stringify(modelData));

      this.modelRegistry.set(modelName, {
        name: modelName,
        savePath: key,
        savedAt: modelData.savedAt,
        version: modelData.version,
        metadata: modelData.metadata
      });

      this.saveRegistry();
      
      console.log(`✅ Statistical model saved: ${modelName}`);
      return modelData;
      
    } catch (error) {
      console.error(`❌ Failed to save statistical model ${modelName}:`, error);
      throw error;
    }
  }

  loadStatisticalModel(modelName) {
    try {
      console.log(`📂 Loading statistical model: ${modelName}`);
      
      const key = `${this.storagePrefix}stat_${modelName}`;
      const stored = localStorage.getItem(key);
      
      if (!stored) {
        throw new Error(`Statistical model ${modelName} not found`);
      }

      const modelData = JSON.parse(stored);
      const model = this.deserializeModel(modelData.data);
      
      console.log(`✅ Statistical model loaded: ${modelName}`);
      return { model, metadata: modelData.metadata };
      
    } catch (error) {
      console.error(`❌ Failed to load statistical model ${modelName}:`, error);
      throw error;
    }
  }

  // ========================================
  // MODEL SERIALIZATION
  // ========================================

  serializeModel(model) {
    // Serialize model state to JSON-compatible format
    const serialized = {
      className: model.constructor.name,
      state: {}
    };

    // Extract model properties
    for (const [key, value] of Object.entries(model)) {
      if (this.isSerializable(value)) {
        serialized.state[key] = value;
      } else if (value instanceof Map) {
        serialized.state[key] = { type: 'Map', data: Array.from(value.entries()) };
      } else if (value instanceof Set) {
        serialized.state[key] = { type: 'Set', data: Array.from(value) };
      } else if (Array.isArray(value)) {
        serialized.state[key] = value;
      }
    }

    return serialized;
  }

  deserializeModel(serialized) {
    // Reconstruct model from serialized data
    const model = {};
    
    for (const [key, value] of Object.entries(serialized.state)) {
      if (value && typeof value === 'object' && value.type === 'Map') {
        model[key] = new Map(value.data);
      } else if (value && typeof value === 'object' && value.type === 'Set') {
        model[key] = new Set(value.data);
      } else {
        model[key] = value;
      }
    }

    return model;
  }

  isSerializable(value) {
    return (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  }

  // ========================================
  // REGISTRY MANAGEMENT
  // ========================================

  saveRegistry() {
    try {
      const registry = {
        models: Array.from(this.modelRegistry.entries()),
        versionHistory: this.versionHistory,
        lastUpdated: new Date()
      };
      
      localStorage.setItem(`${this.storagePrefix}registry`, JSON.stringify(registry));
    } catch (error) {
      console.warn('Could not save model registry:', error);
    }
  }

  loadRegistry() {
    try {
      const stored = localStorage.getItem(`${this.storagePrefix}registry`);
      
      if (stored) {
        const registry = JSON.parse(stored);
        this.modelRegistry = new Map(registry.models);
        this.versionHistory = registry.versionHistory || [];
        console.log(`✅ Model registry loaded (${this.modelRegistry.size} models)`);
      }
    } catch (error) {
      console.warn('Could not load model registry:', error);
    }
  }

  // ========================================
  // VERSION MANAGEMENT
  // ========================================

  generateVersion() {
    const now = new Date();
    return `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}.${this.versionHistory.length + 1}`;
  }

  getModelVersion(modelName) {
    const modelInfo = this.modelRegistry.get(modelName);
    return modelInfo?.version || null;
  }

  getVersionHistory(modelName = null) {
    if (modelName) {
      return this.versionHistory.filter(v => v.name === modelName);
    }
    return this.versionHistory;
  }

  // ========================================
  // MODEL LISTING AND INFO
  // ========================================

  listModels() {
    const models = Array.from(this.modelRegistry.values());
    
    console.log('📋 Available Models:');
    console.table(models.map(m => ({
      Name: m.name,
      Version: m.version,
      'Saved At': new Date(m.savedAt).toLocaleString(),
      Layers: m.metadata?.layers || 'N/A'
    })));
    
    return models;
  }

  getModelInfo(modelName) {
    return this.modelRegistry.get(modelName);
  }

  modelExists(modelName) {
    return this.modelRegistry.has(modelName);
  }

  // ========================================
  // EXPORT/IMPORT
  // ========================================

  async exportModelToFile(modelName) {
    try {
      const modelInfo = this.modelRegistry.get(modelName);
      
      if (!modelInfo) {
        throw new Error(`Model ${modelName} not found`);
      }

      // For TensorFlow.js models, provide download instructions
      if (modelInfo.savePath.includes('indexeddb://')) {
        console.log(`To export TensorFlow.js model, use:`);
        console.log(`await model.save('downloads://${modelName}');`);
        return null;
      }

      // For statistical models
      const key = modelInfo.savePath;
      const modelData = localStorage.getItem(key);
      
      if (!modelData) {
        throw new Error(`Model data not found for ${modelName}`);
      }

      // Create download blob
      const blob = new Blob([modelData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelName}_v${modelInfo.version}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      console.log(`✅ Model exported: ${modelName}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to export model ${modelName}:`, error);
      throw error;
    }
  }

  async importModelFromFile(file, modelName) {
    try {
      const text = await file.text();
      const modelData = JSON.parse(text);
      
      if (modelData.type === 'statistical') {
        // Import statistical model
        const key = `${this.storagePrefix}stat_${modelName}`;
        localStorage.setItem(key, text);
        
        this.modelRegistry.set(modelName, {
          name: modelName,
          savePath: key,
          savedAt: new Date(),
          version: modelData.version || this.generateVersion(),
          metadata: modelData.metadata
        });
        
        this.saveRegistry();
        console.log(`✅ Statistical model imported: ${modelName}`);
        return true;
      } else {
        console.log('For TensorFlow.js models, upload model.json and weights files to server');
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Failed to import model:`, error);
      throw error;
    }
  }

  // ========================================
  // CLEANUP
  // ========================================

  async clearAllModels() {
    try {
      console.log('🗑️ Clearing all models...');
      
      const modelNames = Array.from(this.modelRegistry.keys());
      
      for (const name of modelNames) {
        try {
          await this.deleteModel(name);
        } catch (error) {
          console.warn(`Could not delete model ${name}:`, error);
        }
      }
      
      this.modelRegistry.clear();
      this.versionHistory = [];
      this.saveRegistry();
      
      console.log('✅ All models cleared');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to clear models:', error);
      throw error;
    }
  }

  // ========================================
  // UTILITIES
  // ========================================

  getStorageSize() {
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.storagePrefix)) {
        const item = localStorage.getItem(key);
        totalSize += item.length;
      }
    }
    
    return {
      bytes: totalSize,
      kilobytes: (totalSize / 1024).toFixed(2),
      megabytes: (totalSize / 1024 / 1024).toFixed(2)
    };
  }
}

// Export for use in other modules
export default ModelPersistence;
