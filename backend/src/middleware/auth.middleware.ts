import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { asyncHandler, AppError } from '../utils/asyncHandler';
import { TokenPayload } from '../types/auth.types';

// Extend Request interface
interface ExtendedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

// Environment variables with defaults
const JWT_SECRET = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key';

/**
 * Middleware to authenticate JWT tokens
 * Checks for token in Authorization header, cookies, or request body
 */
export const authenticateToken = asyncHandler(async (req: ExtendedRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  // Check cookies if no header token
  else if (req.cookies?.['accessToken']) {
    token = req.cookies['accessToken'];
  }
  // Check body as last resort (for refresh token endpoint)
  else if (req.body?.accessToken) {
    token = req.body.accessToken;
  }

  if (!token) {
    throw new AppError('Access token is required', 401, 'NO_ACCESS_TOKEN');
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // Find the user and attach to request
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: user.farmerType // Using farmerType as role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid access token', 401, 'INVALID_ACCESS_TOKEN');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Access token expired', 401, 'ACCESS_TOKEN_EXPIRED');
    }
    throw error;
  }
});

/**
 * Middleware to authenticate refresh tokens
 * Used specifically for refresh token endpoints
 */
export const authenticateRefreshToken = asyncHandler(async (req: ExtendedRequest, _res: Response, next: NextFunction) => {
  const refreshToken = req.cookies?.['refreshToken'] || req.body.refreshToken;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401, 'NO_REFRESH_TOKEN');
  }

  try {
    const JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] || 'your-super-secret-refresh-key';
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string; email: string };

    // Check if refresh token exists in user's refreshTokens array
    const user = await User.findOne({
      _id: decoded.id,
      refreshTokens: refreshToken
    });

    if (!user) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: user.farmerType
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
    }
    throw error;
  }
});

/**
 * Middleware to authorize specific farmer types
 * @param allowedTypes - Array of farmer types that are allowed
 */
export const authorizeFarmerType = (allowedTypes: string[]) => {
  return asyncHandler(async (req: ExtendedRequest, _res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (!allowedTypes.includes(user.farmerType)) {
      throw new AppError(
        `Access denied. Required farmer type: ${allowedTypes.join(', ')}`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  });
};

/**
 * Middleware to check subscription status
 * @param requiredSubscription - Minimum subscription type required
 */
export const checkSubscription = (requiredSubscription: 'free' | 'basic' | 'premium' | 'enterprise') => {
  const subscriptionHierarchy = {
    free: 0,
    basic: 1,
    premium: 2,
    enterprise: 3
  };

  return asyncHandler(async (req: ExtendedRequest, _res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if subscription is expired
    if (user.subscriptionExpiry && user.subscriptionExpiry < new Date()) {
      throw new AppError('Subscription expired', 403, 'SUBSCRIPTION_EXPIRED');
    }

    // Check subscription level
    const userLevel = subscriptionHierarchy[user.subscriptionType];
    const requiredLevel = subscriptionHierarchy[requiredSubscription];

    if (userLevel < requiredLevel) {
      throw new AppError(
        `This feature requires ${requiredSubscription} subscription or higher`,
        403,
        'INSUFFICIENT_SUBSCRIPTION'
      );
    }

    next();
  });
};

/**
 * Middleware to check API usage limits
 * @param apiType - Type of API being accessed
 */
export const checkAPIUsage = (apiType: 'cropRecommendations' | 'imageProcessing' | 'chatMessages') => {
  return asyncHandler(async (req: ExtendedRequest, _res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if user has exceeded API limit
    if (user.hasExceededAPILimit(apiType)) {
      throw new AppError(
        `You have exceeded your ${apiType} limit for this month. Please upgrade your subscription.`,
        429,
        'API_LIMIT_EXCEEDED'
      );
    }

    next();
  });
};

/**
 * Optional authentication middleware
 * Authenticates user if token is provided, but doesn't fail if no token
 */
export const optionalAuth = asyncHandler(async (req: ExtendedRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  // Check cookies if no header token
  else if (req.cookies?.['accessToken']) {
    token = req.cookies['accessToken'];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: user.farmerType
        };
      }
    } catch (error) {
      // Silently ignore token errors for optional auth
      console.warn('Optional auth token verification failed:', error);
    }
  }

  next();
});

/**
 * Middleware to verify email before certain actions
 */
export const requireEmailVerification = asyncHandler(async (req: ExtendedRequest, _res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (!user.isEmailVerified) {
    throw new AppError(
      'Email verification required. Please verify your email before accessing this feature.',
      403,
      'EMAIL_VERIFICATION_REQUIRED'
    );
  }

  next();
});

/**
 * Middleware to check if user account is active/not banned
 */
export const checkAccountStatus = asyncHandler(async (req: ExtendedRequest, _res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // You can add account status checks here if you add fields like 'isActive', 'isBanned', etc.
  // For now, just check if user exists

  next();
});