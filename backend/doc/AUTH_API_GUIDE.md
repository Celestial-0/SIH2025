# Authentication API Usage Examples

## Overview
The authentication system provides comprehensive user management for the AgriMind platform with the following features:

- **User Registration & Login** with farmer-specific fields
- **JWT-based Authentication** with access and refresh tokens
- **Profile Management** with agricultural data
- **Password Management** with secure reset functionality
- **Role-based Access Control** based on farmer types
- **Subscription Management** with API usage limits
- **Comprehensive Validation** using Zod schemas

## Available Endpoints

### Public Endpoints (No Authentication Required)

#### 1. User Sign Up
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "username": "farmer_john",
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "9876543210",
  "dateOfBirth": "1990-05-15T00:00:00.000Z",
  "farmerType": "individual",
  "farmSize": 5.5,
  "primaryCrops": ["wheat", "rice", "corn"],
  "farmLocation": {
    "state": "Punjab",
    "district": "Ludhiana",
    "pincode": "141001",
    "village": "Doraha",
    "coordinates": {
      "latitude": 30.7500,
      "longitude": 75.8400
    }
  },
  "farmingExperience": 10,
  "educationLevel": "graduate",
  "preferredLanguage": "english",
  "subscriptionType": "free"
}
```

#### 2. User Sign In
```http
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

#### 3. Forgot Password
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "farmer@example.com"
}
```

#### 4. Reset Password
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

#### 5. Refresh Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

### Protected Endpoints (Authentication Required)

#### 6. Get User Profile
```http
GET /api/v1/auth/profile?includeHistory=true&includeUsage=true
Authorization: Bearer your_access_token_here
```

#### 7. Update User Profile
```http
PUT /api/v1/auth/profile
Authorization: Bearer your_access_token_here
Content-Type: application/json

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

#### 8. Change Password
```http
PUT /api/v1/auth/change-password
Authorization: Bearer your_access_token_here
Content-Type: application/json

{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

#### 9. Sign Out
```http
POST /api/v1/auth/signout
Authorization: Bearer your_access_token_here
```

#### 10. Sign Out All Devices
```http
POST /api/v1/auth/signout-all
Authorization: Bearer your_access_token_here
```

#### 11. Delete Account
```http
DELETE /api/v1/auth/account
Authorization: Bearer your_access_token_here
Content-Type: application/json

{
  "password": "SecurePass123!"
}
```

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

## Authentication Flow

### 1. Registration Flow
1. User submits registration form
2. Server validates input using Zod schemas
3. Password is hashed using bcrypt
4. User is created in database
5. JWT tokens are generated
6. Tokens are set as secure HTTP-only cookies
7. User profile is returned

### 2. Login Flow
1. User submits credentials
2. Server validates email and password
3. JWT tokens are generated
4. Login activity is logged
5. Tokens are set as cookies
6. User profile is returned

### 3. Token Refresh Flow
1. When access token expires, client sends refresh token
2. Server validates refresh token
3. New access and refresh tokens are generated
4. Old refresh token is replaced
5. New tokens are returned

## Authentication Middleware

The system includes several middleware functions:

### `authenticateToken`
- Validates JWT access tokens
- Attaches user info to request object
- Used for all protected routes

### `authorizeFarmerType`
- Restricts access based on farmer type
- Usage: `authorizeFarmerType(['commercial', 'cooperative'])`

### `checkSubscription`
- Validates subscription level
- Usage: `checkSubscription('premium')`

### `checkAPIUsage`
- Enforces API usage limits
- Usage: `checkAPIUsage('cropRecommendations')`

### `requireEmailVerification`
- Ensures user has verified their email
- Used for sensitive operations

## Security Features

### Password Security
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Hashed using bcrypt with salt rounds 12

### Token Security
- JWT tokens with configurable expiration
- Refresh token rotation
- Secure HTTP-only cookies
- CSRF protection via SameSite cookies

### Input Validation
- Comprehensive Zod schemas
- Sanitization of user inputs
- Protection against injection attacks

### Rate Limiting & API Limits
- API usage tracking by subscription type
- Automatic limit enforcement
- Subscription-based feature access

## Environment Variables

Create a `.env` file with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/AgriMind

# Node Environment
NODE_ENV=development
```

## Error Codes

| Error Code | Description |
|-----------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `EMAIL_EXISTS` | User with email already exists |
| `USERNAME_EXISTS` | Username already taken |
| `INVALID_CREDENTIALS` | Incorrect email or password |
| `NOT_AUTHENTICATED` | No valid authentication token |
| `USER_NOT_FOUND` | User account not found |
| `INVALID_CURRENT_PASSWORD` | Current password is incorrect |
| `INVALID_RESET_TOKEN` | Password reset token is invalid or expired |
| `API_LIMIT_EXCEEDED` | Monthly API usage limit exceeded |
| `SUBSCRIPTION_EXPIRED` | User subscription has expired |
| `EMAIL_VERIFICATION_REQUIRED` | Email verification needed |

## Best Practices

### Frontend Integration
1. Store tokens securely (HTTP-only cookies recommended)
2. Implement automatic token refresh
3. Handle authentication errors gracefully
4. Provide clear error messages to users

### Security Recommendations
1. Use HTTPS in production
2. Implement rate limiting
3. Monitor for suspicious activities
4. Regular security audits
5. Keep dependencies updated

### Error Handling
1. Log errors with request IDs for tracing
2. Don't expose sensitive information in error messages
3. Implement retry mechanisms for network errors
4. Provide user-friendly error messages

This authentication system provides a robust foundation for the AgriMind platform with enterprise-grade security and scalability features.