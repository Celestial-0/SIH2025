# Production-Grade Async Handler

A comprehensive, production-ready async handler for Express.js applications with TypeScript support.

## Features

✅ **Comprehensive Error Handling** - Automatic catching and proper error propagation  
✅ **Type Safety** - Full TypeScript support with proper type definitions  
✅ **Performance Monitoring** - Request timing and performance logging  
✅ **Memory Leak Prevention** - Automatic cleanup of request-specific data  
✅ **Request Tracing** - Unique request IDs for debugging and monitoring  
✅ **Database Error Handling** - Specialized MongoDB/Mongoose error handling  
✅ **Security** - Automatic cleanup of sensitive data  
✅ **Production Ready** - Optimized for production environments  

## Installation

The async handler is already included in your project at `src/utils/asyncHandler.ts`.

## Basic Usage

### 1. Route Handlers

```typescript
import { asyncHandler } from '../utils/asyncHandler';

// Simple route handler
export const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});
  
  // Automatic success response
  return {
    users,
    count: users.length
  };
});

// Route handler with manual response
export const createUser = asyncHandler(async (req, res, next) => {
  const { email, name } = req.body;
  
  if (!email || !name) {
    throw new AppError('Email and name are required', 400, 'MISSING_FIELDS');
  }
  
  const user = await User.create({ email, name });
  
  sendSuccessResponse(res, { user }, 'User created successfully', 201);
});
```

### 2. Middleware Functions

```typescript
import { asyncMiddleware } from '../utils/asyncHandler';

export const validateAuth = asyncMiddleware(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new AppError('Access token required', 401, 'MISSING_TOKEN');
  }
  
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  
  req.user = user;
  next();
});
```

### 3. Database Operations

```typescript
import { handleDbOperation } from '../utils/asyncHandler';

export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Automatic MongoDB error handling
  const user = await handleDbOperation(
    () => User.findById(userId),
    'User'
  );
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  return { user };
});
```

### 4. External API Calls

```typescript
import { wrapAsync } from '../utils/asyncHandler';

export const fetchExternalData = asyncHandler(async (req, res) => {
  const data = await wrapAsync(
    async () => {
      const response = await fetch('https://api.external.com/data');
      if (!response.ok) throw new Error('External API failed');
      return response.json();
    },
    'Failed to fetch external data',
    502
  );
  
  return { data };
});
```

## Error Handling

### Custom Error Class

```typescript
import { AppError } from '../utils/asyncHandler';

// Throw custom errors with specific status codes
throw new AppError('User not found', 404, 'USER_NOT_FOUND');
throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
```

### Automatic Database Error Handling

The `handleDbOperation` function automatically handles common MongoDB errors:

- **ValidationError** → 400 Bad Request
- **Duplicate Key Error (11000)** → 409 Conflict  
- **CastError** → 400 Bad Request (Invalid ID format)
- **DocumentNotFoundError** → 404 Not Found

### Response Helpers

```typescript
import { sendSuccessResponse, sendErrorResponse } from '../utils/asyncHandler';

// Success responses
sendSuccessResponse(res, data, 'Operation successful', 200);

// Error responses
sendErrorResponse(res, 'Something went wrong', 500);
sendErrorResponse(res, new AppError('Not found', 404), 404);
```

## Production Features

### Request Tracing
Every request gets a unique ID for debugging and monitoring:
```
[req_1642781234567_abc123def] GET /api/users completed in 245ms
```

### Performance Monitoring
- Automatic request timing
- Slow request logging (>1000ms)
- Memory usage tracking

### Security Features
- Automatic cleanup of sensitive data (passwords, etc.)
- Prevention of response header conflicts
- Memory leak prevention

### Error Logging
Comprehensive error logging with context:
```json
{
  "error": "User not found",
  "stack": "...",
  "statusCode": 404,
  "errorCode": "USER_NOT_FOUND",
  "userId": "user123",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

## Configuration

### Environment Variables

```bash
NODE_ENV=production  # Controls error stack trace visibility
JWT_SECRET=your_jwt_secret
```

### TypeScript Types

The async handler includes proper TypeScript definitions:

```typescript
// Extended request interface with user and files
interface ExtendedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  files?: any;
}
```

## Best Practices

### 1. Always Use Async Handler
```typescript
// ✅ Good
export const getUsers = asyncHandler(async (req, res) => {
  // Your async code here
});

// ❌ Bad - Manual error handling
export const getUsers = async (req, res) => {
  try {
    // Your async code here
  } catch (error) {
    // Manual error handling
  }
};
```

### 2. Use Specific Error Types
```typescript
// ✅ Good - Specific errors
throw new AppError('User not found', 404, 'USER_NOT_FOUND');

// ❌ Bad - Generic errors
throw new Error('Something went wrong');
```

### 3. Database Operations
```typescript
// ✅ Good - Use handleDbOperation
const user = await handleDbOperation(
  () => User.findById(userId),
  'User'
);

// ❌ Bad - Manual database error handling
const user = await User.findById(userId);
```

### 4. Response Consistency
```typescript
// ✅ Good - Use response helpers
sendSuccessResponse(res, data, 'Success message');

// ✅ Good - Auto response
return { data }; // Automatic success response

// ❌ Bad - Manual responses
res.json({ success: true, data });
```

## Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "User not found",
  "errorCode": "USER_NOT_FOUND",
  "requestId": "req_1642781234567_abc123def",
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

## Success Response Format

All success responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "requestId": "req_1642781234567_abc123def",
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

## Contributing

When adding new features to the async handler:

1. Maintain TypeScript compatibility
2. Add comprehensive error handling
3. Include proper logging
4. Update documentation
5. Add example usage

## License

ISC - See package.json for details.