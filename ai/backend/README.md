# Crop Recommendation API

A FastAPI application for crop recommendation based on soil and climate parameters using machine learning.

## ✨ Features

- FastAPI framework
- Machine learning-based crop recommendation
- Soil parameter analysis
- Batch prediction support
- Health check endpoints
- [Hypercorn](https://hypercorn.readthedocs.io/) ASGI server
- Python 3

## 🚀 API Endpoints

- `GET /` - Root health check
- `GET /health` - Detailed health check
- `POST /predict` - Single crop prediction
- `POST /predict/batch` - Batch crop prediction
- `GET /crops` - Get available crops
- `GET /soil-types` - Get available soil types
- `GET /model/info` - Get model information
- `POST /validate` - Validate soil parameters without prediction
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation (ReDoc)

## 💁‍♀️ How to use

### Local Development

1. Clone the repository and navigate to the backend directory
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run locally using Hypercorn:
   ```bash
   hypercorn main:app --reload
   ```

### Railway Deployment

This application is configured for easy deployment on Railway:

1. Connect your GitHub repository to Railway
2. Deploy automatically using the included `railway.json` configuration
3. The application will start using Hypercorn on the specified port

## 📋 Requirements

- Python 3.8+
- FastAPI
- Hypercorn
- scikit-learn
- pandas
- numpy
- joblib
- pydantic

## 📊 Input Parameters

The API accepts the following soil and climate parameters:

- **soil_type**: Type of soil (Clay, Sandy, Loamy, Peaty, Saline)
- **soil_ph**: pH value of soil (0-14)
- **temperature**: Temperature in Celsius (0-50°C)
- **humidity**: Humidity percentage (0-100%)
- **wind_speed**: Wind speed in km/h (0-50 km/h)
- **N**: Nitrogen content in soil (0-200)
- **P**: Phosphorus content in soil (0-200)
- **K**: Potassium content in soil (0-200)
- **annual_rainfall**: Annual rainfall in mm (0-2000 mm)

## 🤖 Model Requirements

The application expects the following model files in a `dist/` directory:
- `random_forest_model.pkl` - Trained Random Forest machine learning model
- `soil_encoder.pkl` - Label encoder for soil types
- `crop_encoder.pkl` - Label encoder for crop names

## 📝 API Usage Example

### Single Prediction

```bash
curl -X POST "http://localhost:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "soil_type": "Clay",
       "soil_ph": 6.5,
       "temperature": 28.0,
       "humidity": 70.0,
       "wind_speed": 5.0,
       "N": 80.0,
       "P": 40.0,
       "K": 50.0,
       "annual_rainfall": 200.0
     }'
```

### Response

```json
{
  "predicted_crop": "Rice",
  "confidence": 0.95,
  "input_parameters": {
    "soil_type": "Clay",
    "soil_ph": 6.5,
    "temperature": 28.0,
    "humidity": 70.0,
    "wind_speed": 5.0,
    "N": 80.0,
    "P": 40.0,
    "K": 50.0,
    "annual_rainfall": 200.0
  },
  "all_probabilities": {
    "Rice": 0.95,
    "Wheat": 0.03,
    "Corn": 0.02
  }
}
```

### Get Available Crops

```bash
curl -X GET "http://localhost:8000/crops"
```

### Get Available Soil Types

```bash
curl -X GET "http://localhost:8000/soil-types"
```

### Validate Parameters

```bash
curl -X POST "http://localhost:8000/validate" \
     -H "Content-Type: application/json" \
     -d '{
       "soil_type": "Clay",
       "soil_ph": 6.5,
       "temperature": 28.0,
       "humidity": 70.0,
       "wind_speed": 5.0,
       "N": 80.0,
       "P": 40.0,
       "K": 50.0,
       "annual_rainfall": 200.0
     }'
```

### Batch Prediction

```bash
curl -X POST "http://localhost:8000/predict/batch" \
     -H "Content-Type: application/json" \
     -d '[
       {
         "soil_type": "Clay",
         "soil_ph": 6.5,
         "temperature": 28.0,
         "humidity": 70.0,
         "wind_speed": 5.0,
         "N": 80.0,
         "P": 40.0,
         "K": 50.0,
         "annual_rainfall": 200.0
       },
       {
         "soil_type": "Sandy",
         "soil_ph": 7.0,
         "temperature": 25.0,
         "humidity": 60.0,
         "wind_speed": 8.0,
         "N": 70.0,
         "P": 35.0,
         "K": 45.0,
         "annual_rainfall": 150.0
       }
     ]'
```

## 📝 Notes

- The API includes CORS middleware configured for development (allow all origins)
- For production deployment, configure CORS origins appropriately
- Health check endpoint is available at `/health` for monitoring
- Interactive API documentation is available at `/docs`
- To learn more about FastAPI, visit the [FastAPI Documentation](https://fastapi.tiangolo.com/tutorial/)
- To learn about Hypercorn configuration, read their [Documentation](https://hypercorn.readthedocs.io/)
