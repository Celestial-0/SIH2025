import { Request } from 'express';

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

// Sign Up Request Types
export interface SignUpRequest {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  farmerType: 'individual' | 'commercial' | 'cooperative' | 'research';
  farmSize?: number;
  primaryCrops?: string[];
  farmLocation?: {
    state: string;
    district: string;
    pincode: string;
    village?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  farmingExperience?: number;
  educationLevel?: 'none' | 'primary' | 'secondary' | 'graduate' | 'postgraduate';
  preferredLanguage: string;
  subscriptionType?: 'free' | 'basic' | 'premium' | 'enterprise';
}

// Sign In Request Types
export interface SignInRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Profile Update Request Types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  farmerType?: 'individual' | 'commercial' | 'cooperative' | 'research';
  farmSize?: number;
  primaryCrops?: string[];
  farmLocation?: {
    state: string;
    district: string;
    pincode: string;
    village?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  farmingExperience?: number;
  educationLevel?: 'none' | 'primary' | 'secondary' | 'graduate' | 'postgraduate';
  preferredLanguage?: string;
  preferences?: {
    units?: 'metric' | 'imperial';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      weatherAlerts?: boolean;
      cropRecommendations?: boolean;
      marketPrices?: boolean;
    };
    dataSharing?: {
      researchPurposes?: boolean;
      governmentSchemes?: boolean;
      marketAnalytics?: boolean;
    };
  };
}

// Password Change Request Types
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Forgot Password Request Types
export interface ForgotPasswordRequest {
  email: string;
}

// Reset Password Request Types
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Response Types
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: UserResponse;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  requestId?: string;
  timestamp: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  farmerType: 'individual' | 'commercial' | 'cooperative' | 'research';
  farmSize?: number;
  primaryCrops?: string[];
  farmLocation?: {
    state: string;
    district: string;
    pincode: string;
    village?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  farmingExperience?: number;
  educationLevel?: 'none' | 'primary' | 'secondary' | 'graduate' | 'postgraduate';
  preferredLanguage: string;
  subscriptionType: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry?: Date;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isFarmerVerified: boolean;
  preferences: {
    units: 'metric' | 'imperial';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      weatherAlerts: boolean;
      cropRecommendations: boolean;
      marketPrices: boolean;
    };
    dataSharing: {
      researchPurposes: boolean;
      governmentSchemes: boolean;
      marketAnalytics: boolean;
    };
  };
  apiUsage?: {
    month: string;
    cropRecommendations: number;
    imageProcessing: number;
    chatMessages: number;
    maxLimits: {
      cropRecommendations: number;
      imageProcessing: number;
      chatMessages: number;
    };
  }[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: UserResponse;
  };
  requestId?: string;
  timestamp: string;
}

export interface GenericResponse {
  success: boolean;
  message: string;
  data?: any;
  requestId?: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  errorCode?: string;
  requestId?: string;
  timestamp: string;
  stack?: string;
}

// Token Types
export interface TokenPayload {
  id: string;
  email: string;
  username: string;
  farmerType: string;
  subscriptionType: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  id: string;
  email: string;
  tokenVersion?: number;
  iat?: number;
  exp?: number;
}

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationErrorResponse extends ErrorResponse {
  errors: ValidationError[];
}

// Database operation types
export interface UserCreateData extends Omit<SignUpRequest, 'confirmPassword'> {
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isFarmerVerified?: boolean;
  refreshTokens?: string[];
  apiUsage?: any[];
  loginHistory?: any[];
  preferences?: any;
}

export interface UserUpdateData extends Partial<UpdateProfileRequest> {
  lastLogin?: Date;
  $push?: any;
  $pull?: any;
  $inc?: any;
}

// Session and Security Types
export interface LoginSession {
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
}

export interface PasswordResetData {
  passwordResetToken: string;
  passwordResetExpiry: Date;
}

// API Limits and Usage
export interface APIUsageData {
  month: string;
  cropRecommendations: number;
  imageProcessing: number;
  chatMessages: number;
  maxLimits: {
    cropRecommendations: number;
    imageProcessing: number;
    chatMessages: number;
  };
}

// Subscription Types
export type SubscriptionType = 'free' | 'basic' | 'premium' | 'enterprise';
export type FarmerType = 'individual' | 'commercial' | 'cooperative' | 'research';
export type EducationLevel = 'none' | 'primary' | 'secondary' | 'graduate' | 'postgraduate';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type DocumentType = 'land_record' | 'farmer_id' | 'cooperative_membership';

// Re-export validation types for convenience
export type { 
  SignUpData, 
  SignInData, 
  UpdateProfileData, 
  ChangePasswordData, 
  ForgotPasswordData, 
  ResetPasswordData 
} from '../validations/auth.validations';