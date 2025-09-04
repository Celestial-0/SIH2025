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
- `GET /model/info` - Get model information
- `GET /docs` - Interactive API documentation (Swagger UI)

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

## 🤖 Model Requirements

The application expects the following model files in a `dist/` directory:
- `crop_recommender.pkl` - Trained machine learning model
- `label_encoder.pkl` - Label encoder for crop names

## 📝 API Usage Example

### Single Prediction

```bash
curl -X POST "http://localhost:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "N": 90,
       "P": 42,
       "K": 43,
       "temperature": 20.8,
       "humidity": 82.0,
       "ph": 6.5,
       "rainfall": 202.9
     }'
```

### Response

```json
{
  "predicted_crop": "rice",
  "confidence": 0.95,
  "input_parameters": {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 20.8,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.9
  },
  "all_probabilities": {
    "rice": 0.95,
    "wheat": 0.03,
    "corn": 0.02
  }
}
```

## 📝 Notes

- The API includes CORS middleware configured for development (allow all origins)
- For production deployment, configure CORS origins appropriately
- Health check endpoint is available at `/health` for monitoring
- Interactive API documentation is available at `/docs`
- To learn more about FastAPI, visit the [FastAPI Documentation](https://fastapi.tiangolo.com/tutorial/)
- To learn about Hypercorn configuration, read their [Documentation](https://hypercorn.readthedocs.io/)
