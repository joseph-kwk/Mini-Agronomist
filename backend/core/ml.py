import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

MODELS_DIR = "saved_models"

if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)

# In-memory interaction for simpler serverless-like feel, 
# but persisting to disk for restart tolerance.
active_models = {}

def train_model(features, targets, model_name="default"):
    """
    Train a Random Forest Regressor.
    """
    X = np.array(features)
    y = np.array(targets)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Save model
    model_path = os.path.join(MODELS_DIR, f"{model_name}.joblib")
    joblib.dump(model, model_path)
    
    active_models[model_name] = model
    
    return {
        "status": "success",
        "model_name": model_name,
        "score": model.score(X, y) # R^2 score on training data
    }

def predict_yield(features, model_name="default"):
    """
    Predict yield using a trained model.
    """
    # Load if not in memory
    if model_name not in active_models:
        model_path = os.path.join(MODELS_DIR, f"{model_name}.joblib")
        if os.path.exists(model_path):
            active_models[model_name] = joblib.load(model_path)
        else:
            # If default doesn't exist, create a dummy one for demo purposes
            if model_name == "default" or model_name == "demo_model":
                 return _dummy_predict(features)
            raise ValueError(f"Model {model_name} not found")
            
    model = active_models[model_name]
    predictions = model.predict(np.array(features))
    
    # Return first prediction if single input, else list
    return predictions.tolist()

def _dummy_predict(features):
    # Fallback for demo if no training happened yet
    # Just return a reasonable random number based on features
    preds = []
    for feat in features:
        # Assuming feat is [avg_temp, rainfall, ...]
        # Simple linear combo + noise
        val = 3.0 + (feat[0] * 0.05) + (feat[1] * 0.002) 
        preds.append(val)
    return preds

def get_available_models():
    """List available models."""
    models = list(active_models.keys())
    # Also check disk
    if os.path.exists(MODELS_DIR):
        for f in os.listdir(MODELS_DIR):
            if f.endswith(".joblib"):
                name = f.replace(".joblib", "")
                if name not in models:
                    models.append(name)
    return models
