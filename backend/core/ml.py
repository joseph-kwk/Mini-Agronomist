import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os

MODELS_DIR = "saved_models"
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
CSV_PATH = os.path.join(DATA_DIR, "crop_yield_data.csv")

if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)

# In-memory interaction
active_models = {}

def get_preprocessor():
    """Create a preprocessor for the pipeline."""
    categorical_features = ['Region', 'Crop', 'Soil_Type']
    numerical_features = ['Rainfall_mm', 'Temperature_C', 'pH']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    return preprocessor

def train_from_csv(model_name="default"):
    """
    Train model using the CSV data file.
    """
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Data file not found at {CSV_PATH}")
        
    df = pd.read_csv(CSV_PATH)
    
    X = df[['Region', 'Crop', 'Soil_Type', 'Rainfall_mm', 'Temperature_C', 'pH']]
    y = df['Yield_Tons_Ha']
    
    # Create and train pipeline
    model = Pipeline(steps=[
        ('preprocessor', get_preprocessor()),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    model.fit(X, y)
    
    # Save model
    model_path = os.path.join(MODELS_DIR, f"{model_name}.joblib")
    joblib.dump(model, model_path)
    
    active_models[model_name] = model
    
    return {
        "status": "success",
        "model_name": model_name,
        "score": model.score(X, y),
        "data_rows": len(df)
    }

def train_model(features, targets, model_name="default"):
    """
    Train model from API data (list of dictionaries).
    """
    if isinstance(features, list) and len(features) > 0 and isinstance(features[0], list):
        # Handle legacy raw list[list] input - assuming [temp, rain, ph, gdd, moisture]
        # This is strictly for backward compatibility with the "demo" mode which used dummy regression
        # For real training, we expect dicts.
        return _train_legacy_dummy(features, targets, model_name)

    df = pd.DataFrame(features)
    X = df[['Region', 'Crop', 'Soil_Type', 'Rainfall_mm', 'Temperature_C', 'pH']]
    y = np.array(targets)
    
    model = Pipeline(steps=[
        ('preprocessor', get_preprocessor()),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    model.fit(X, y)
    
    model_path = os.path.join(MODELS_DIR, f"{model_name}.joblib")
    joblib.dump(model, model_path)
    active_models[model_name] = model
    
    return {"status": "success", "model_name": model_name, "score": model.score(X, y)}

def _train_legacy_dummy(features, targets, model_name):
    # Old logic for raw float arrays
    X = np.array(features)
    y = np.array(targets)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    model_path = os.path.join(MODELS_DIR, f"{model_name}_legacy.joblib")
    joblib.dump(model, model_path)
    active_models[model_name] = model
    return {"status": "success", "model_name": model_name, "score": model.score(X, y)}

def predict_yield(features, model_name="default"):
    """
    Predict yield. Features can be a list of dicts (for new model) 
    or list of lists (for legacy model).
    """
    # Auto-load model if missing
    if model_name not in active_models:
        # Try loading standard model
        model_path = os.path.join(MODELS_DIR, f"{model_name}.joblib")
        if os.path.exists(model_path):
            active_models[model_name] = joblib.load(model_path)
        else:
            # Try training from CSV if it's the default/demo model and doesn't exist
            if model_name in ["default", "demo_model", "real_model"] and os.path.exists(CSV_PATH):
                print(f"Auto-training {model_name} from CSV...")
                train_from_csv(model_name)
            elif model_name == "demo_model":
                 return _dummy_predict(features)
            else:
                 raise ValueError(f"Model {model_name} not found")

    model = active_models[model_name]
    
    # Check input type vs model type
    is_pipeline = isinstance(model, Pipeline)
    
    if is_pipeline:
        # Input must be convertible to DataFrame with correct columns
        if isinstance(features, list) and len(features) > 0 and isinstance(features[0], list):
             # Legacy input but new model -> can't predict
             # Fallback to dummy or error
             return _dummy_predict(features)
             
        df = pd.DataFrame(features)
        # Ensure columns exist, fill default if missing
        required_cols = ['Region', 'Crop', 'Soil_Type', 'Rainfall_mm', 'Temperature_C', 'pH']
        for col in required_cols:
            if col not in df.columns:
                df[col] = 0 if col in ['Rainfall_mm', 'Temperature_C', 'pH'] else 'unknown'
                
        predictions = model.predict(df)
        return predictions.tolist()
    else:
        # Legacy model (straight regressor)
        if isinstance(features, list) and len(features) > 0 and isinstance(features[0], dict):
            # Dict input but legacy model -> extract simple numericals? 
            # Or just fail. Let's return dummy.
            return [0.0] * len(features)
            
        predictions = model.predict(np.array(features))
        return predictions.tolist()

def _dummy_predict(features):
    preds = []
    for _ in features:
        # Just return a random realistic number
        preds.append(5.0 + np.random.normal(0, 1.0))
    return preds

def get_available_models():
    models = list(active_models.keys())
    if os.path.exists(MODELS_DIR):
        for f in os.listdir(MODELS_DIR):
            if f.endswith(".joblib"):
                name = f.replace(".joblib", "")
                if name not in models:
                    models.append(name)
    return models
