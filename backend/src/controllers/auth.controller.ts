import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/user.model';
import { 
  asyncHandler, 
  AppError, 
  sendSuccessResponse, 
  handleDbOperation
} from '../utils/asyncHandler';
import {
  AuthenticatedRequest,
  SignUpData,
  SignInData,
  UpdateProfileData,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
  UserResponse,
  TokenPayload,
  RefreshTokenPayload
} from '../types/auth.types';

// Environment variables with defaults
const JWT_SECRET = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] || 'your-super-secret-refresh-key';
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d';
const NODE_ENV = process.env['NODE_ENV'] || 'development';

// Helper function to generate tokens
const generateTokens = (user: IUser) => {
  const payload: TokenPayload = {
    id: (user._id as any).toString(),
    email: user.email,
    username: user.username,
    farmerType: user.farmerType,
    subscriptionType: user.subscriptionType
  };

  const refreshPayload: RefreshTokenPayload = {
    id: (user._id as any).toString(),
    email: user.email
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
  const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as any);

  return { accessToken, refreshToken };
};

// Helper function to set secure cookies
const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const cookieOptions = {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, cookieOptions);
};

// Helper function to clear cookies
const clearTokenCookies = (res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

// Helper function to format user response
const formatUserResponse = (user: IUser): UserResponse => {
  return {
    id: (user._id as any).toString(),
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
    ...(user.dateOfBirth && { dateOfBirth: user.dateOfBirth }),
    farmerType: user.farmerType,
    ...(user.farmSize && { farmSize: user.farmSize }),
    ...(user.primaryCrops && { primaryCrops: user.primaryCrops }),
    ...(user.farmLocation && { farmLocation: user.farmLocation }),
    ...(user.farmingExperience && { farmingExperience: user.farmingExperience }),
    ...(user.educationLevel && { educationLevel: user.educationLevel }),
    preferredLanguage: user.preferredLanguage,
    subscriptionType: user.subscriptionType,
    ...(user.subscriptionExpiry && { subscriptionExpiry: user.subscriptionExpiry }),
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    isFarmerVerified: user.isFarmerVerified,
    preferences: user.preferences,
    ...(user.apiUsage && { apiUsage: user.apiUsage }),
    ...(user.lastLogin && { lastLogin: user.lastLogin }),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// Helper function to generate password reset token
const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Sign Up Controller
export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const data: SignUpData = req.body;

  // Check if user already exists
  const existingUser = await handleDbOperation(
    () => User.findOne({ 
      $or: [
        { email: data.email },
        { username: data.username }
      ]
    }),
    'User'
  );

  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new AppError('User with this email already exists', 409, 'EMAIL_EXISTS');
    }
    if (existingUser.username === data.username) {
      throw new AppError('Username already taken', 409, 'USERNAME_EXISTS');
    }
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  // Create user data
  const userData = {
    ...data,
    password: hashedPassword,
    isEmailVerified: false,
    isPhoneVerified: false,
    isFarmerVerified: false,
    refreshTokens: [],
    apiUsage: [],
    loginHistory: [],
    preferences: {
      units: 'metric' as const,
      notifications: {
        email: true,
        sms: false,
        push: true,
        weatherAlerts: true,
        cropRecommendations: true,
        marketPrices: true
      },
      dataSharing: {
        researchPurposes: false,
        governmentSchemes: true,
        marketAnalytics: false
      }
    }
  };

  // Create user
  const user = await handleDbOperation(
    () => User.create(userData),
    'User'
  );

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token to user
  await handleDbOperation(
    () => User.findByIdAndUpdate(
      user._id,
      { $push: { refreshTokens: refreshToken } },
      { new: true }
    ),
    'User'
  );

  // Set cookies
  setTokenCookies(res, accessToken, refreshToken);

  // Log user activity
  const loginData = {
    timestamp: new Date(),
    ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    location: 'unknown' // You can implement IP geolocation here
  };

  await handleDbOperation(
    () => User.findByIdAndUpdate(
      user._id,
      { 
        $push: { loginHistory: loginData },
        lastLogin: new Date()
      }
    ),
    'User'
  );

  // Send response
  const userResponse = formatUserResponse(user);
  
  sendSuccessResponse(res, {
    user: userResponse,
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 // 15 minutes in seconds
  }, 'User registered successfully', 201, req.headers['x-request-id'] as string);
});

// Sign In Controller
export const signIn = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe }: SignInData = req.body;

  // Find user by email
  const user = await handleDbOperation(
    () => User.findOne({ email }).select('+password'),
    'User'
  );

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token to user
  await handleDbOperation(
    () => User.findByIdAndUpdate(
      user._id,
      { $push: { refreshTokens: refreshToken } },
      { new: true }
    ),
    'User'
  );

  // Set cookies (extend expiry if remember me is checked)
  if (rememberMe) {
    const extendedCookieOptions = {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    };
    
    res.cookie('accessToken', accessToken, {
      ...extendedCookieOptions,
      maxAge: 15 * 60 * 1000 // Still 15 minutes for access token
    });
    res.cookie('refreshToken', refreshToken, extendedCookieOptions);
  } else {
    setTokenCookies(res, accessToken, refreshToken);
  }

  // Log user activity
  const loginData = {
    timestamp: new Date(),
    ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    location: 'unknown' // You can implement IP geolocation here
  };

  await handleDbOperation(
    () => User.findByIdAndUpdate(
      user._id,
      { 
        $push: { loginHistory: loginData },
        lastLogin: new Date()
      }
    ),
    'User'
  );

  // Send response
  const userResponse = formatUserResponse(user);
  
  sendSuccessResponse(res, {
    user: userResponse,
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 // 15 minutes in seconds
  }, 'Sign in successful', 200, req.headers['x-request-id'] as string);
});

// Get Profile Controller
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  // Get user profile
  const user = await handleDbOperation(
    () => User.findById(userId),
    'User'
  );

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const userResponse = formatUserResponse(user);
  
  sendSuccessResponse(res, {
    user: userResponse
  }, 'Profile retrieved successfully', 200, req.headers['x-request-id'] as string);
});

// Update Profile Controller
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const updates: UpdateProfileData = req.body;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  // Remove undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  );

  // Update user profile
  const user = await handleDbOperation(
    () => User.findByIdAndUpdate(
      userId,
      { $set: cleanUpdates },
      { new: true, runValidators: true }
    ),
    'User'
  );

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const userResponse = formatUserResponse(user);
  
  sendSuccessResponse(res, {
    user: userResponse
  }, 'Profile updated successfully', 200, req.headers['x-request-id'] as string);
});

// Change Password Controller
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword }: ChangePasswordData = req.body;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  // Find user with password
  const user = await handleDbOperation(
    () => User.findById(userId).select('+password'),
    'User'
  );

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
  }

  // Hash new password
  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password and clear all refresh tokens for security
  await handleDbOperation(
    () => User.findByIdAndUpdate(
      userId,
      { 
        password: hashedNewPassword,
        refreshTokens: [] // Clear all refresh tokens
      }
    ),
    'User'
  );

  // Clear cookies to force re-authentication
  clearTokenCookies(res);

  sendSuccessResponse(res, null, 'Password changed successfully. Please sign in again.', 200, req.headers['x-request-id'] as string);
});

// Forgot Password Controller
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email }: ForgotPasswordData = req.body;

  // Find user by email
  const user = await handleDbOperation(
    () => User.findOne({ email }),
    'User'
  );

  if (!user) {
    // For security, don't reveal if email exists or not
    sendSuccessResponse(res, null, 'If an account with this email exists, a password reset link has been sent.', 200, req.headers['x-request-id'] as string);
    return;
  }

  // Generate reset token
  const resetToken = generatePasswordResetToken();
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Save reset token to user
  await handleDbOperation(
    () => User.findByIdAndUpdate(
      user._id,
      {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetTokenExpiry
      }
    ),
    'User'
  );

  // TODO: Send email with reset link
  // For now, just return success (in production, integrate with email service)
  console.log(`Password reset token for ${email}: ${resetToken}`);

  sendSuccessResponse(res, null, 'If an account with this email exists, a password reset link has been sent.', 200, req.headers['x-request-id'] as string);
});

// Reset Password Controller
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword }: ResetPasswordData = req.body;

  // Find user by reset token
  const user = await handleDbOperation(
    () => User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() }
    }),
    'User'
  );

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  // Hash new password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password and clear reset token and all refresh tokens
  await handleDbOperation(
    () => User.findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword,
        passwordResetToken: undefined,
        passwordResetExpiry: undefined,
        refreshTokens: [] // Clear all refresh tokens for security
      }
    ),
    'User'
  );

  sendSuccessResponse(res, null, 'Password reset successful. Please sign in with your new password.', 200, req.headers['x-request-id'] as string);
});

// Refresh Token Controller
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.['refreshToken'] || req.body.refreshToken;

  if (!refreshToken) {
    throw new AppError('Refresh token not provided', 401, 'NO_REFRESH_TOKEN');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as RefreshTokenPayload;

    // Find user and check if refresh token exists
    const user = await handleDbOperation(
      () => User.findOne({
        _id: decoded.id,
        refreshTokens: refreshToken
      }),
      'User'
    );

    if (!user) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Replace old refresh token with new one
    await handleDbOperation(
      () => User.findByIdAndUpdate(
        user._id,
        {
          $pull: { refreshTokens: refreshToken },
          $push: { refreshTokens: newRefreshToken }
        }
      ),
      'User'
    );

    // Set new cookies
    setTokenCookies(res, accessToken, newRefreshToken);

    sendSuccessResponse(res, {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    }, 'Token refreshed successfully', 200, req.headers['x-request-id'] as string);

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
    throw error;
  }
});

// Sign Out Controller
export const signOut = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const refreshToken = req.cookies?.['refreshToken'];

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  // Remove refresh token from user if provided
  if (refreshToken) {
    await handleDbOperation(
      () => User.findByIdAndUpdate(
        userId,
        { $pull: { refreshTokens: refreshToken } }
      ),
      'User'
    );
  }

  // Clear cookies
  clearTokenCookies(res);

  sendSuccessResponse(res, null, 'Sign out successful', 200, req.headers['x-request-id'] as string);
});

// Sign Out All Devices Controller
export const signOutAllDevices = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  // Clear all refresh tokens
  await handleDbOperation(
    () => User.findByIdAndUpdate(
      userId,
      { refreshTokens: [] }
    ),
    'User'
  );

  // Clear cookies
  clearTokenCookies(res);

  sendSuccessResponse(res, null, 'Signed out from all devices successfully', 200, req.headers['x-request-id'] as string);
});

// Delete Account Controller
export const deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { password } = req.body;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  if (!password) {
    throw new AppError('Password is required to delete account', 400, 'PASSWORD_REQUIRED');
  }

  // Find user with password
  const user = await handleDbOperation(
    () => User.findById(userId).select('+password'),
    'User'
  );

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid password', 400, 'INVALID_PASSWORD');
  }

  // Delete user account
  await handleDbOperation(
    () => User.findByIdAndDelete(userId),
    'User'
  );

  // Clear cookies
  clearTokenCookies(res);

  sendSuccessResponse(res, null, 'Account deleted successfully', 200, req.headers['x-request-id'] as string);
});