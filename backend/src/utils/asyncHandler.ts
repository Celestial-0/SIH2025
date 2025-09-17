import { Request, Response, NextFunction } from 'express';

/**
 * Extended Request interface to include custom properties
 */
interface ExtendedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  files?: any;
}

/**
 * Type for async route handlers
 */
export type AsyncRequestHandler = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Type for async middleware functions
 */
export type AsyncMiddleware = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errorCode: string | undefined;
  
  constructor(
    message: string,
    statusCode: number = 500,
    errorCode?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    
    // Maintain proper stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
    
    // Set the name of the error
    this.name = this.constructor.name;
  }
}

/**
 * Production-grade async handler wrapper for Express route handlers
 * 
 * Features:
 * - Comprehensive error handling with proper HTTP status codes
 * - Request/response validation
 * - Performance monitoring
 * - Memory leak prevention
 * - Graceful error propagation
 * - TypeScript type safety
 * 
 * @param fn - The async function to wrap
 * @returns Wrapped function with error handling
 */
export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const extendedReq = req as ExtendedRequest;
    
    // Track request start time for performance monitoring
    const startTime = Date.now();
    
    // Add request ID for tracing (if not already present)
    if (!extendedReq.headers['x-request-id']) {
      extendedReq.headers['x-request-id'] = generateRequestId();
    }
    
    // Validate request and response objects
    if (!extendedReq || !res || !next) {
      const error = new AppError(
        'Invalid request/response objects',
        500,
        'INVALID_REQUEST_OBJECTS'
      );
      return next(error);
    }
    
    // Check if response is already sent to prevent double responses
    if (res.headersSent) {
      console.warn(`[${extendedReq.headers['x-request-id']}] Headers already sent for ${extendedReq.method} ${extendedReq.path}`);
      return;
    }
    
    // Execute the async function with comprehensive error handling
    Promise.resolve(fn(extendedReq, res, next))
      .then((result) => {
        // Log successful completion
        const duration = Date.now() - startTime;
        if (process.env['NODE_ENV'] !== 'production' || duration > 1000) {
          console.log(`[${extendedReq.headers['x-request-id']}] ${extendedReq.method} ${extendedReq.path} completed in ${duration}ms`);
        }
        
        // If the handler returns a value and response hasn't been sent, send it
        if (result !== undefined && !res.headersSent) {
          res.json({
            success: true,
            data: result,
            requestId: extendedReq.headers['x-request-id']
          });
        }
      })
      .catch((error) => {
        // Log the error with context
        const duration = Date.now() - startTime;
        console.error(`[${extendedReq.headers['x-request-id']}] Error in ${extendedReq.method} ${extendedReq.path} after ${duration}ms:`, {
          error: error.message,
          stack: error.stack,
          statusCode: error.statusCode,
          errorCode: error.errorCode,
          userId: extendedReq.user?.id || 'anonymous',
          ip: extendedReq.ip || extendedReq.connection?.remoteAddress,
          userAgent: extendedReq.get('User-Agent')
        });
        
        // Prevent memory leaks by cleaning up request-specific data
        cleanupRequest(extendedReq);
        
        // Pass error to Express error handler
        next(error);
      });
  };
};

/**
 * Specialized async handler for middleware functions
 * 
 * @param fn - The async middleware function to wrap
 * @returns Wrapped middleware with error handling
 */
export const asyncMiddleware = (fn: AsyncMiddleware) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const extendedReq = req as ExtendedRequest;
    
    // Add request ID if not present
    if (!extendedReq.headers['x-request-id']) {
      extendedReq.headers['x-request-id'] = generateRequestId();
    }
    
    Promise.resolve(fn(extendedReq, res, next))
      .catch((error) => {
        console.error(`[${extendedReq.headers['x-request-id']}] Middleware error:`, {
          error: error.message,
          stack: error.stack,
          middleware: fn.name || 'anonymous'
        });
        
        next(error);
      });
  };
};

/**
 * Wrapper for async operations within route handlers
 * Useful for wrapping specific async operations that might fail
 * 
 * @param operation - The async operation to wrap
 * @param errorMessage - Custom error message for failures
 * @param statusCode - HTTP status code for failures
 * @returns Promise that resolves to the operation result or throws AppError
 */
export const wrapAsync = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed',
  statusCode: number = 500
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    // If it's already an AppError, preserve it
    if (error instanceof AppError) {
      throw error;
    }
    
    // Wrap other errors in AppError
    throw new AppError(
      `${errorMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      statusCode,
      'WRAPPED_ASYNC_ERROR'
    );
  }
};

/**
 * Handle database operations with specific error handling
 * 
 * @param operation - Database operation to execute
 * @param entityName - Name of the entity being operated on
 * @returns Promise that resolves to the operation result
 */
export const handleDbOperation = async <T>(
  operation: () => Promise<T>,
  entityName: string = 'Resource'
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      throw new AppError(
        `Validation failed for ${entityName}: ${error.message}`,
        400,
        'VALIDATION_ERROR'
      );
    }
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      throw new AppError(
        `${entityName} with this ${field} already exists`,
        409,
        'DUPLICATE_RESOURCE'
      );
    }
    
    if (error.name === 'CastError') {
      throw new AppError(
        `Invalid ${entityName} ID format`,
        400,
        'INVALID_ID_FORMAT'
      );
    }
    
    if (error.name === 'DocumentNotFoundError') {
      throw new AppError(
        `${entityName} not found`,
        404,
        'RESOURCE_NOT_FOUND'
      );
    }
    
    // For unknown database errors, log details and throw generic error
    console.error('Unknown database error:', error);
    throw new AppError(
      `Database operation failed for ${entityName}`,
      500,
      'DATABASE_ERROR'
    );
  }
};

/**
 * Generate a unique request ID for tracing
 * 
 * @returns Unique request identifier
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clean up request-specific data to prevent memory leaks
 * 
 * @param req - Express request object
 */
function cleanupRequest(req: ExtendedRequest): void {
  try {
    // Clear sensitive data from request
    if (req.body && typeof req.body === 'object') {
      delete req.body.password;
      delete req.body.confirmPassword;
      delete req.body.oldPassword;
    }
    
    // Clear any large buffers or files
    if (req.files) {
      delete req.files;
    }
    
    // Clear any custom properties that might hold large objects
    const customProps = Object.keys(req).filter(key => 
      !['params', 'query', 'body', 'headers', 'method', 'url', 'path'].includes(key)
    );
    
    customProps.forEach(prop => {
      if (typeof (req as any)[prop] === 'object' && (req as any)[prop] !== null) {
        delete (req as any)[prop];
      }
    });
  } catch (error) {
    // If cleanup fails, log but don't throw
    console.warn('Failed to cleanup request:', error);
  }
}

/**
 * Helper function to create standardized API responses
 * 
 * @param res - Express response object
 * @param data - Data to send in response
 * @param message - Success message
 * @param statusCode - HTTP status code
 * @param requestId - Request ID for tracing
 */
export const sendSuccessResponse = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200,
  requestId?: string
) => {
  if (res.headersSent) {
    console.warn('Attempted to send response after headers were sent');
    return;
  }
  
  res.status(statusCode).json({
    success: true,
    message,
    data,
    requestId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Helper function to create standardized error responses
 * 
 * @param res - Express response object
 * @param error - Error object or message
 * @param statusCode - HTTP status code
 * @param requestId - Request ID for tracing
 */
export const sendErrorResponse = (
  res: Response,
  error: string | Error | AppError,
  statusCode: number = 500,
  requestId?: string
) => {
  if (res.headersSent) {
    console.warn('Attempted to send error response after headers were sent');
    return;
  }
  
  let errorMessage = 'Internal server error';
  let errorCode: string | undefined;
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof AppError) {
    errorMessage = error.message;
    errorCode = error.errorCode;
    statusCode = error.statusCode;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    errorCode,
    requestId,
    timestamp: new Date().toISOString(),
    ...(process.env['NODE_ENV'] !== 'production' && error instanceof Error && {
      stack: error.stack
    })
  });
};

// Export default async handler for convenience
export default asyncHandler;
