# Backend API Documentation

## Api's:

### Authentication
- **User Sign Up**: `POST /api/v1/auth/signup`

- **User Sign In**: `POST /api/v1/auth/signin`


- **Get User Profile**: `GET /api/v1/auth/profile` (Protected Route)
- **Update User Profile**: `PUT /api/v1/auth/profile` (Protected Route)
- **Change Password**: `PUT /api/v1/auth/change-password` (Protected Route)
- **Forgot Password**: `POST /api/v1/auth/forgot-password`
- **Reset Password**: `POST /api/v1/auth/reset-password`



### ML Model
- **Predict Crop**: `POST /api/v1/model/crop_recommendation` (Protected Route)
- **Predict Crop with Parameters**: `POST /api/v1/model/crop_recommendation_with_params` (Protected Route)

### DL Model
- **Predict Disease with Image**: `POST /api/v1/model/disease_detection` (Protected Route)


### Chat 
- **Chat with AI**: `POST /api/v1/chat` (Protected Route)

### Weather
- **Get Weather Data**: `GET /api/v1/weather` (Protected Route)

