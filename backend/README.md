# AgriMind Backend API Documentation

## Overview

AgriMind is a comprehensive agricultural platform that provides farmers with AI-powered crop recommendations, disease detection, weather forecasting, and intelligent chat assistance. The backend API is built with Node.js, Express, TypeScript, and MongoDB, featuring robust authentication, validation, and security measures.

## Features

- 🔐 **JWT-based Authentication** with refresh token rotation
- 👨‍🌾 **Farmer-specific User Profiles** with agricultural data
- 🤖 **AI/ML Integration** for crop recommendations and disease detection
- 💬 **Intelligent Chat System** for agricultural guidance
- 🌤️ **Weather Data Integration** for informed farming decisions
- 📊 **API Usage Tracking** with subscription-based limits
- 🛡️ **Enterprise-grade Security** with comprehensive validation
- 📱 **Role-based Access Control** for different farmer types

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Configure environment variables (see [Environment Variables](#environment-variables))

5. Start the development server
```bash
npm run dev
```

The server will start on `http://localhost:8000` (or your configured PORT).

## API Endpoints

### Authentication APIs

#### Public Endpoints (No Authentication Required)

##### User Sign Up
```http
POST /api/v1/auth/signup
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "farmer@example.com",                    // Required
  "password": "SecurePass123!",                     // Required
  "confirmPassword": "SecurePass123!",              // Required
  "username": "farmer_john",                        // Required
  "firstName": "John",                              // Required
  "lastName": "Smith",                              // Required
  "phoneNumber": "9876543210",                      // Optional
  "dateOfBirth": "1990-05-15T00:00:00.000Z",       // Optional
  "farmerType": "individual",                       // Required
  "farmSize": 5.5,                                  // Optional
  "primaryCrops": ["wheat", "rice", "corn"],        // Optional
  "farmLocation": {                                 // Optional
    "state": "Punjab",
    "district": "Ludhiana",
    "pincode": "141001",
    "village": "Doraha",
    "coordinates": {
      "latitude": 30.7500,
      "longitude": 75.8400
    }
  },
  "farmingExperience": 10,                          // Optional
  "educationLevel": "graduate",                     // Optional
  "preferredLanguage": "english"                    // Required
}
```

**Successful Response:**
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "68cb1c993ca1d89752c30a5c",
            "email": "farmer@example.com",
            "username": "farmer_john",
            "firstName": "John",
            "lastName": "Smith",
            "phoneNumber": "9876543210",
            "dateOfBirth": "1990-05-15T00:00:00.000Z",
            "farmerType": "individual",
            "farmSize": 5.5,
            "primaryCrops": [
                "wheat",
                "rice",
                "corn"
            ],
            "farmLocation": {
                "state": "Punjab",
                "district": "Ludhiana",
                "pincode": "141001",
                "village": "Doraha",
                "coordinates": {
                    "latitude": 30.75,
                    "longitude": 75.84
                }
            },
            "farmingExperience": 10,
            "educationLevel": "graduate",
            "preferredLanguage": "english",
            "subscriptionType": "free",
            "isEmailVerified": false,
            "isPhoneVerified": false,
            "isFarmerVerified": false,
            "preferences": {
                "units": "metric",
                "notifications": {
                    "email": true,
                    "sms": false,
                    "push": true,
                    "weatherAlerts": true,
                    "cropRecommendations": true,
                    "marketPrices": true
                },
                "dataSharing": {
                    "researchPurposes": false,
                    "governmentSchemes": true,
                    "marketAnalytics": false
                }
            },
            "apiUsage": [],
            "createdAt": "2025-09-17T20:39:53.523Z",
            "updatedAt": "2025-09-17T20:39:53.523Z"
        },
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2IxYzk5M2NhMWQ4OTc1MmMzMGE1YyIsImVtYWlsIjoiZmFybWVyQGV4YW1wbGUuY29tIiwidXNlcm5hbWUiOiJmYXJtZXJfam9obiIsImZhcm1lclR5cGUiOiJpbmRpdmlkdWFsIiwic3Vic2NyaXB0aW9uVHlwZSI6ImZyZWUiLCJpYXQiOjE3NTgxNDE1OTMsImV4cCI6MTc1ODE0MjQ5M30.MJWcvhKO9wwGwKWno5EZ5z5MVjiUadzV8qDbCA1lDX0",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2IxYzk5M2NhMWQ4OTc1MmMzMGE1YyIsImVtYWlsIjoiZmFybWVyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzU4MTQxNTkzLCJleHAiOjE3NTg3NDYzOTN9.CiePLKKjEx5hGKCSWqHKiHdPOSSAZknvy0v3vPw33xQ",
        "expiresIn": 900
    },
    "requestId": "req_1758141593083_jm0hscay1",
    "timestamp": "2025-09-17T20:39:53.646Z"
}
```

##### User Sign In
```http
POST /api/v1/auth/signin
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

##### Forgot Password
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "farmer@example.com"
}
```

##### Reset Password
```http
POST /api/v1/auth/reset-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

##### Refresh Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json
```

#### Protected Endpoints (Authentication Required)

##### Get User Profile
```http
GET /api/v1/auth/profile?includeHistory=true&includeUsage=true
Authorization: Bearer your_access_token_here
```

##### Update User Profile
```http
PUT /api/v1/auth/profile
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "9876543210",
  "farmSize": 7.5,
  "primaryCrops": ["wheat", "rice", "sugarcane"],
  "preferences": {
    "units": "metric",
    "notifications": {
      "email": true,
      "sms": true,
      "weatherAlerts": true
    }
  }
}
```

##### Change Password
```http
PUT /api/v1/auth/change-password
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

##### Sign Out
```http
POST /api/v1/auth/signout
Authorization: Bearer your_access_token_here
```

##### Sign Out All Devices
```http
POST /api/v1/auth/signout-all
Authorization: Bearer your_access_token_here
```

##### Delete Account
```http
DELETE /api/v1/auth/account
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "password": "SecurePass123!"
}
```

### ML/AI Model APIs

#### Crop Recommendation
```http
POST /api/v1/model/crop_recommendation
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Description:** Get AI-powered crop recommendations based on soil and environmental conditions.

#### Crop Recommendation with Parameters
```http
POST /api/v1/model/crop_recommendation_with_params
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Description:** Get detailed crop recommendations with custom parameters.

### Deep Learning Model APIs

#### Disease Detection
```http
POST /api/v1/model/disease_detection
Authorization: Bearer your_access_token_here
Content-Type: multipart/form-data
```

**Description:** Analyze crop images to detect diseases and provide treatment recommendations.

### Chat APIs

#### Chat with AI
```http
POST /api/v1/chat
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Description:** Interactive chat with AI assistant for agricultural guidance and support.

### Weather APIs

#### Get Weather Data
```http
GET /api/v1/weather
Authorization: Bearer your_access_token_here
```

**Description:** Get current weather conditions and forecasts for farming locations.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "requestId": "req_1234567890_abcdef123",
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE",
  "requestId": "req_1234567890_abcdef123",
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

## Authentication & Security

### JWT Token Authentication
- **Access Tokens**: Short-lived (15 minutes) for API access
- **Refresh Tokens**: Long-lived (7 days) for token renewal
- **Secure Storage**: HTTP-only cookies with SameSite protection
- **Token Rotation**: Automatic refresh token rotation for enhanced security

### Password Security
- Minimum 8 characters with complexity requirements
- Bcrypt hashing with salt rounds 12
- Secure password reset flow with time-limited tokens

### Input Validation
- Comprehensive Zod schema validation
- Sanitization of all user inputs
- Protection against injection attacks

### Role-Based Access Control
- **Individual Farmers**: Basic agricultural features
- **Commercial Farmers**: Advanced analytics and bulk operations
- **Cooperatives**: Multi-user management and reporting
- **Research**: Extended API access for academic purposes

## Subscription Tiers & API Limits

| Feature | Free | Basic | Premium | Enterprise |
|---------|------|-------|---------|------------|
| Crop Recommendations | 10/month | 100/month | 500/month | Unlimited |
| Image Processing | 5/month | 50/month | 200/month | Unlimited |
| Chat Messages | 50/month | 500/month | 2000/month | Unlimited |
| Weather API | ✅ | ✅ | ✅ | ✅ |
| Historical Data | 7 days | 30 days | 1 year | Unlimited |
| Priority Support | ❌ | ✅ | ✅ | ✅ |

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/AgriMind

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# External API Keys (Optional)
WEATHER_API_KEY=your-weather-api-key
ML_MODEL_ENDPOINT=your-ml-model-endpoint
```

## Error Codes

| Error Code | HTTP Status | Description |
|-----------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `EMAIL_EXISTS` | 409 | User with email already exists |
| `USERNAME_EXISTS` | 409 | Username already taken |
| `INVALID_CREDENTIALS` | 401 | Incorrect email or password |
| `NOT_AUTHENTICATED` | 401 | No valid authentication token |
| `ACCESS_TOKEN_EXPIRED` | 401 | Access token has expired |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token is invalid |
| `USER_NOT_FOUND` | 404 | User account not found |
| `INSUFFICIENT_PERMISSIONS` | 403 | Access denied for user role |
| `API_LIMIT_EXCEEDED` | 429 | Monthly API usage limit exceeded |
| `SUBSCRIPTION_EXPIRED` | 403 | User subscription has expired |
| `EMAIL_VERIFICATION_REQUIRED` | 403 | Email verification needed |

## Development

### Project Structure
```
src/
├── controllers/        # Route handlers and business logic
├── middleware/         # Authentication and validation middleware
├── models/            # Database models and schemas
├── routes/            # API route definitions
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and helpers
└── validations/       # Request validation schemas
```

### Scripts
```bash
npm run dev          # Start development server with hot reload
npm run start        # Start production server
npm run build        # Build TypeScript to JavaScript
npm run prod         # Build and start production server
npm run test         # Run test suite
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Database Models

#### User Model
The user model includes comprehensive farmer profile data:
- Personal information (name, contact, location)
- Agricultural profile (farm size, crops, experience)
- AI interaction history (recommendations, image analysis)
- Subscription and usage tracking
- Security and session management

## Testing

### Running Tests
```bash
npm run test                # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
```

### API Testing
Use tools like Postman, Insomnia, or curl to test endpoints:

```bash
# Example: Test user signup with minimal required fields
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "farmerType": "individual",
    "preferredLanguage": "english"
  }'

# Example: Test user signup with all optional fields
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "9876543210",
    "farmerType": "individual",
    "farmSize": 5.5,
    "primaryCrops": ["wheat", "rice"],
    "farmingExperience": 10,
    "educationLevel": "graduate",
    "preferredLanguage": "english"
  }'
```

## Deployment

### Production Setup
1. Set `NODE_ENV=production` in environment variables
2. Use strong, unique JWT secrets
3. Configure MongoDB with proper authentication
4. Set up HTTPS with SSL certificates
5. Implement rate limiting and monitoring
6. Configure proper CORS origins

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For detailed API examples and advanced usage, see [AUTH_API_GUIDE.md](./AUTH_API_GUIDE.md).

For issues and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation and examples

## License

This project is licensed under the ISC License - see the LICENSE file for details.

