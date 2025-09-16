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

# Global variables for model and encoders
model = None
soil_encoder = None
crop_encoder = None

def load_models():
    """Load the trained model and encoders"""
    global model, soil_encoder, crop_encoder
    
    try:
        current_dir = Path(__file__).parent
        model_path = current_dir / "dist/random_forest_model.pkl"
        soil_encoder_path = current_dir / "dist/soil_encoder.pkl"
        crop_encoder_path = current_dir / "dist/crop_encoder.pkl"
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at {model_path}")
        if not soil_encoder_path.exists():
            raise FileNotFoundError(f"Soil encoder file not found at {soil_encoder_path}")
        if not crop_encoder_path.exists():
            raise FileNotFoundError(f"Crop encoder file not found at {crop_encoder_path}")
        
        model = joblib.load(model_path)
        soil_encoder = joblib.load(soil_encoder_path)
        crop_encoder = joblib.load(crop_encoder_path)
        
        logger.info("Models and encoders loaded successfully")
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
    soil_type: str = Field(..., description="Type of soil (Clay, Sandy, Loamy, Peaty, Saline)")
    soil_ph: float = Field(..., description="pH value of soil", ge=0, le=14)
    temperature: float = Field(..., description="Temperature in Celsius", ge=0, le=50)
    humidity: float = Field(..., description="Humidity percentage", ge=0, le=100)
    wind_speed: float = Field(..., description="Wind speed in km/h", ge=0, le=50)
    N: float = Field(..., description="Nitrogen content in soil", ge=0, le=500)
    P: float = Field(..., description="Phosphorus content in soil", ge=0, le=500)
    K: float = Field(..., description="Potassium content in soil", ge=0, le=500)
    annual_rainfall: float = Field(..., description="Annual rainfall in mm", ge=0, le=2000)

    class Config:
        json_schema_extra = {
            "example": {
                "soil_type": "Clay",
                "soil_ph": 6.5,
                "temperature": 28.0,
                "humidity": 70.0,
                "wind_speed": 5.0,
                "N": 80.0,
                "P": 40.0,
                "K": 50.0,
                "annual_rainfall": 200.0
            }
        }

# Define the response model
class CropRecommendation(BaseModel):
    predicted_crop: str
    confidence: float
    input_parameters: Dict[str, Any]
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
    if model is None or soil_encoder is None or crop_encoder is None:
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
    if model is None or soil_encoder is None or crop_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Models are not loaded. Please check the model files."
        )
    
    try:
        # Prepare the input data
        new_data = {
            "Soil_Type": soil_params.soil_type,
            "Soil_pH": soil_params.soil_ph,
            "Temperature": soil_params.temperature,
            "Humidity": soil_params.humidity,
            "Wind_Speed": soil_params.wind_speed,
            "N": soil_params.N,
            "P": soil_params.P,
            "K": soil_params.K,
            "Annual_Rainfall": soil_params.annual_rainfall
        }
        
        # Convert to DataFrame
        new_df = pd.DataFrame([new_data])
        
        # Encode Soil_Type
        new_df["Soil_Type"] = soil_encoder.transform(new_df["Soil_Type"])
        
        # Reorder columns to match training data
        new_df = new_df[['Soil_Type', 'Soil_pH', 'Temperature', 'Humidity',
                         'Wind_Speed', 'N', 'P', 'K', 'Annual_Rainfall']]
        
        # Make prediction
        prediction_encoded = model.predict(new_df)[0]
        predicted_crop = crop_encoder.inverse_transform([prediction_encoded])[0]
        
        # Get prediction probabilities if available
        probabilities = None
        confidence = 1.0
        
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(new_df)[0]
            confidence = float(np.max(proba))
            
            # Create probability dictionary
            crop_names = crop_encoder.inverse_transform(range(len(proba)))
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
    if model is None or soil_encoder is None or crop_encoder is None:
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
            # Prepare the input data
            new_data = {
                "Soil_Type": soil_params.soil_type,
                "Soil_pH": soil_params.soil_ph,
                "Temperature": soil_params.temperature,
                "Humidity": soil_params.humidity,
                "Wind_Speed": soil_params.wind_speed,
                "N": soil_params.N,
                "P": soil_params.P,
                "K": soil_params.K,
                "Annual_Rainfall": soil_params.annual_rainfall
            }
            
            # Convert to DataFrame
            new_df = pd.DataFrame([new_data])
            
            # Encode Soil_Type
            new_df["Soil_Type"] = soil_encoder.transform(new_df["Soil_Type"])
            
            # Reorder columns to match training data
            new_df = new_df[['Soil_Type', 'Soil_pH', 'Temperature', 'Humidity',
                             'Wind_Speed', 'N', 'P', 'K', 'Annual_Rainfall']]
            
            # Make prediction
            prediction_encoded = model.predict(new_df)[0]
            predicted_crop = crop_encoder.inverse_transform([prediction_encoded])[0]
            
            # Get confidence if available
            confidence = 1.0
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba(new_df)[0]
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
    if crop_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Crop encoder is not loaded."
        )
    
    try:
        crops = crop_encoder.classes_.tolist()
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

@app.get("/soil-types")
async def get_available_soil_types():
    """
    Get list of all soil types that the model can accept
    """
    if soil_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Soil encoder is not loaded."
        )
    
    try:
        soil_types = soil_encoder.classes_.tolist()
        return {
            "available_soil_types": sorted(soil_types),
            "total_soil_types": len(soil_types)
        }
    except Exception as e:
        logger.error(f"Error getting soil types: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving soil types list: {str(e)}"
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
            "features": ["Soil_Type", "Soil_pH", "Temperature", "Humidity", "Wind_Speed", "N", "P", "K", "Annual_Rainfall"],
            "n_features": 9,
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

@app.post("/validate")
async def validate_soil_parameters(soil_params: SoilParameters):
    """
    Validate soil parameters without making a prediction
    """
    if soil_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Soil encoder is not loaded."
        )
    
    try:
        # Check if soil type is valid
        available_soil_types = soil_encoder.classes_.tolist()
        if soil_params.soil_type not in available_soil_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid soil type. Available types: {available_soil_types}"
            )
        
        # Validate parameter ranges
        validation_errors = []
        
        if not (0 <= soil_params.soil_ph <= 14):
            validation_errors.append("Soil pH must be between 0 and 14")
        if not (0 <= soil_params.temperature <= 50):
            validation_errors.append("Temperature must be between 0 and 50°C")
        if not (0 <= soil_params.humidity <= 100):
            validation_errors.append("Humidity must be between 0 and 100%")
        if not (0 <= soil_params.wind_speed <= 50):
            validation_errors.append("Wind speed must be between 0 and 50 km/h")
        if not (0 <= soil_params.N <= 200):
            validation_errors.append("Nitrogen content must be between 0 and 200")
        if not (0 <= soil_params.P <= 200):
            validation_errors.append("Phosphorus content must be between 0 and 200")
        if not (0 <= soil_params.K <= 200):
            validation_errors.append("Potassium content must be between 0 and 200")
        if not (0 <= soil_params.annual_rainfall <= 2000):
            validation_errors.append("Annual rainfall must be between 0 and 2000 mm")
        
        if validation_errors:
            raise HTTPException(
                status_code=400,
                detail={"validation_errors": validation_errors}
            )
        
        return {
            "status": "valid",
            "message": "All parameters are valid",
            "parameters": soil_params.model_dump()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error validating parameters: {str(e)}"
        )
