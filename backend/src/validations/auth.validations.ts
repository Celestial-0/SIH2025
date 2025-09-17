import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string()
  .email('Please provide a valid email address')
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .transform((email) => email.trim());

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .transform((username) => username.toLowerCase().trim());

const phoneSchema = z.string()
  .regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number')
  .optional()
  .or(z.literal(''));

const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
  .transform((name) => name.trim());

const coordinatesSchema = z.object({
  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
}).optional();

const farmLocationSchema = z.object({
  state: z.string()
    .min(1, 'State is required')
    .max(50, 'State name must be less than 50 characters'),
  district: z.string()
    .min(1, 'District is required')
    .max(50, 'District name must be less than 50 characters'),
  pincode: z.string()
    .regex(/^[1-9][0-9]{5}$/, 'Please provide a valid 6-digit pincode'),
  village: z.string()
    .max(50, 'Village name must be less than 50 characters')
    .optional(),
  coordinates: coordinatesSchema
}).optional();

// Sign Up Validation Schema
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  username: usernameSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phoneNumber: phoneSchema,
  dateOfBirth: z.string()
    .datetime('Please provide a valid date of birth in ISO format')
    .optional()
    .or(z.literal('')),
  farmerType: z.enum(['individual', 'commercial', 'cooperative', 'research'], {
    message: 'Farmer type must be one of: individual, commercial, cooperative, research'
  }),
  farmSize: z.number()
    .positive('Farm size must be a positive number')
    .max(10000, 'Farm size cannot exceed 10,000 acres/hectares')
    .optional(),
  primaryCrops: z.array(z.string().min(1, 'Crop name cannot be empty'))
    .max(10, 'You can specify up to 10 primary crops')
    .optional(),
  farmLocation: farmLocationSchema,
  farmingExperience: z.number()
    .int('Farming experience must be a whole number')
    .min(0, 'Farming experience cannot be negative')
    .max(80, 'Farming experience cannot exceed 80 years')
    .optional(),
  educationLevel: z.enum(['none', 'primary', 'secondary', 'graduate', 'postgraduate'], {
    message: 'Education level must be one of: none, primary, secondary, graduate, postgraduate'
  }).optional(),
  preferredLanguage: z.string()
    .min(2, 'Preferred language must be at least 2 characters')
    .max(20, 'Preferred language must be less than 20 characters')
    .default('english'),
  subscriptionType: z.enum(['free', 'basic', 'premium', 'enterprise'])
    .default('free')
    .optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password and confirm password do not match',
  path: ['confirmPassword']
}).refine((data) => {
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 16 && age <= 100;
  }
  return true;
}, {
  message: 'Age must be between 16 and 100 years',
  path: ['dateOfBirth']
});

// Sign In Validation Schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
});

// Update Profile Validation Schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phoneNumber: phoneSchema,
  dateOfBirth: z.string()
    .datetime('Please provide a valid date of birth in ISO format')
    .optional(),
  farmerType: z.enum(['individual', 'commercial', 'cooperative', 'research']).optional(),
  farmSize: z.number()
    .positive('Farm size must be a positive number')
    .max(10000, 'Farm size cannot exceed 10,000 acres/hectares')
    .optional(),
  primaryCrops: z.array(z.string().min(1, 'Crop name cannot be empty'))
    .max(10, 'You can specify up to 10 primary crops')
    .optional(),
  farmLocation: farmLocationSchema,
  farmingExperience: z.number()
    .int('Farming experience must be a whole number')
    .min(0, 'Farming experience cannot be negative')
    .max(80, 'Farming experience cannot exceed 80 years')
    .optional(),
  educationLevel: z.enum(['none', 'primary', 'secondary', 'graduate', 'postgraduate']).optional(),
  preferredLanguage: z.string()
    .min(2, 'Preferred language must be at least 2 characters')
    .max(20, 'Preferred language must be less than 20 characters')
    .optional(),
  preferences: z.object({
    units: z.enum(['metric', 'imperial']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
      weatherAlerts: z.boolean().optional(),
      cropRecommendations: z.boolean().optional(),
      marketPrices: z.boolean().optional()
    }).optional(),
    dataSharing: z.object({
      researchPurposes: z.boolean().optional(),
      governmentSchemes: z.boolean().optional(),
      marketAnalytics: z.boolean().optional()
    }).optional()
  }).optional()
}).refine((data) => {
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 16 && age <= 100;
  }
  return true;
}, {
  message: 'Age must be between 16 and 100 years',
  path: ['dateOfBirth']
});

// Change Password Validation Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New password and confirm password do not match',
  path: ['confirmPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword']
});

// Forgot Password Validation Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema
});

// Reset Password Validation Schema
export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required')
    .max(500, 'Invalid reset token format'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New password and confirm password do not match',
  path: ['confirmPassword']
});

// Validation for query parameters
export const profileQuerySchema = z.object({
  includeHistory: z.string()
    .transform((val) => val === 'true')
    .optional(),
  includeUsage: z.string()
    .transform((val) => val === 'true')
    .optional()
});

// Validation for pagination
export const paginationSchema = z.object({
  page: z.string()
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, 'Page must be greater than 0')
    .optional()
    .default(1),
  limit: z.string()
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional()
    .default(10)
});

// Export all schemas with proper typing
export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ProfileQueryData = z.infer<typeof profileQuerySchema>;
export type PaginationData = z.infer<typeof paginationSchema>;

// Middleware function to validate request body
export const validateBody = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.code === 'invalid_type' ? undefined : req.body[err.path[0]]
        }));
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
          errors,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
        errorCode: 'INTERNAL_VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
};

// Middleware function to validate query parameters
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          value: req.query[err.path[0]]
        }));
        
        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          errorCode: 'QUERY_VALIDATION_ERROR',
          errors,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal query validation error',
        errorCode: 'INTERNAL_QUERY_VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
};

// Middleware function to validate route parameters
export const validateParams = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          value: req.params[err.path[0]]
        }));
        
        return res.status(400).json({
          success: false,
          error: 'Parameter validation failed',
          errorCode: 'PARAMETER_VALIDATION_ERROR',
          errors,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal parameter validation error',
        errorCode: 'INTERNAL_PARAMETER_VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
};