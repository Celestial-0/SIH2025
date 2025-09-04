from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager
import joblib
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
import logging
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model and encoder
model = None
label_encoder = None

def load_models():
    """Load the trained model and label encoder"""
    global model, label_encoder
    
    try:
        current_dir = Path(__file__).parent
        model_path = current_dir / "dist/crop_recommender.pkl"
        encoder_path = current_dir / "dist/label_encoder.pkl"
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at {model_path}")
        if not encoder_path.exists():
            raise FileNotFoundError(f"Label encoder file not found at {encoder_path}")
        
        model = joblib.load(model_path)
        label_encoder = joblib.load(encoder_path)
        
        logger.info("Models loaded successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        return False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    success = load_models()
    if not success:
        logger.error("Failed to load models on startup")
    yield
    # Shutdown (cleanup if needed)

# Initialize FastAPI app
app = FastAPI(
    title="Crop Recommendation API",
    description="A machine learning API for crop recommendation based on soil and climate parameters",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the input data model
class SoilParameters(BaseModel):
    N: float = Field(..., description="Nitrogen content in soil", ge=0, le=200)
    P: float = Field(..., description="Phosphorus content in soil", ge=0, le=200)
    K: float = Field(..., description="Potassium content in soil", ge=0, le=200)
    temperature: float = Field(..., description="Temperature in Celsius", ge=0, le=50)
    humidity: float = Field(..., description="Humidity percentage", ge=0, le=100)
    ph: float = Field(..., description="pH value of soil", ge=0, le=14)
    rainfall: float = Field(..., description="Rainfall in mm", ge=0, le=500)

    class Config:
        json_schema_extra = {
            "example": {
                "N": 90,
                "P": 42,
                "K": 43,
                "temperature": 20.8,
                "humidity": 82.0,
                "ph": 6.5,
                "rainfall": 202.9
            }
        }

# Define the response model
class CropRecommendation(BaseModel):
    predicted_crop: str
    confidence: float
    input_parameters: Dict[str, float]
    all_probabilities: Optional[Dict[str, float]] = None

class HealthCheck(BaseModel):
    status: str
    message: str
    version: str = "1.0.0"

@app.get("/", response_model=HealthCheck)
async def root():
    """Root endpoint for health check"""
    return HealthCheck(
        status="healthy",
        message="Crop Recommendation API is running successfully"
    )

@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    if model is None or label_encoder is None:
        return HealthCheck(
            status="unhealthy",
            message="Models are not loaded properly"
        )
    
    return HealthCheck(
        status="healthy",
        message="All models are loaded and ready"
    )

@app.post("/predict", response_model=CropRecommendation)
async def predict_crop(soil_params: SoilParameters):
    """
    Predict the best crop based on soil and climate parameters
    """
    if model is None or label_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Models are not loaded. Please check the model files."
        )
    
    try:
        # Convert input to numpy array in the correct order
        input_features = np.array([[
            soil_params.N,
            soil_params.P,
            soil_params.K,
            soil_params.temperature,
            soil_params.humidity,
            soil_params.ph,
            soil_params.rainfall
        ]])
        
        # Make prediction
        prediction_encoded = model.predict(input_features)[0]
        predicted_crop = label_encoder.inverse_transform([prediction_encoded])[0]
        
        # Get prediction probabilities if available
        probabilities = None
        confidence = 1.0
        
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(input_features)[0]
            confidence = float(np.max(proba))
            
            # Create probability dictionary
            crop_names = label_encoder.inverse_transform(range(len(proba)))
            probabilities = {
                crop: float(prob) for crop, prob in zip(crop_names, proba)
            }
            # Sort by probability
            probabilities = dict(sorted(probabilities.items(), key=lambda x: x[1], reverse=True))
        
        return CropRecommendation(
            predicted_crop=predicted_crop,
            confidence=confidence,
            input_parameters=soil_params.model_dump(),
            all_probabilities=probabilities
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error making prediction: {str(e)}"
        )

@app.post("/predict/batch")
async def predict_crops_batch(soil_params_list: List[SoilParameters]):
    """
    Predict crops for multiple soil parameter sets
    """
    if model is None or label_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Models are not loaded. Please check the model files."
        )
    
    if len(soil_params_list) > 100:
        raise HTTPException(
            status_code=400,
            detail="Batch size too large. Maximum 100 predictions per request."
        )
    
    try:
        predictions = []
        
        for soil_params in soil_params_list:
            # Convert input to numpy array
            input_features = np.array([[
                soil_params.N,
                soil_params.P,
                soil_params.K,
                soil_params.temperature,
                soil_params.humidity,
                soil_params.ph,
                soil_params.rainfall
            ]])
            
            # Make prediction
            prediction_encoded = model.predict(input_features)[0]
            predicted_crop = label_encoder.inverse_transform([prediction_encoded])[0]
            
            # Get confidence if available
            confidence = 1.0
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba(input_features)[0]
                confidence = float(np.max(proba))
            
            predictions.append(CropRecommendation(
                predicted_crop=predicted_crop,
                confidence=confidence,
                input_parameters=soil_params.model_dump()
            ))
        
        return predictions
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error making batch predictions: {str(e)}"
        )

@app.get("/crops")
async def get_available_crops():
    """
    Get list of all crops that the model can predict
    """
    if label_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Label encoder is not loaded."
        )
    
    try:
        crops = label_encoder.classes_.tolist()
        return {
            "available_crops": sorted(crops),
            "total_crops": len(crops)
        }
    except Exception as e:
        logger.error(f"Error getting crops: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving crop list: {str(e)}"
        )

@app.get("/model/info")
async def get_model_info():
    """
    Get information about the loaded model
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded."
        )
    
    try:
        model_info = {
            "model_type": type(model).__name__,
            "features": ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"],
            "n_features": 7,
        }
        
        # Add additional info if available
        if hasattr(model, 'n_estimators'):
            model_info["n_estimators"] = model.n_estimators
        if hasattr(model, 'max_depth'):
            model_info["max_depth"] = model.max_depth
            
        return model_info
        
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving model information: {str(e)}"
        )
