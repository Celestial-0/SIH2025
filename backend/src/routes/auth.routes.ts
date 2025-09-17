import { Router } from 'express';
import {
  signUp,
  signIn,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  signOut,
  signOutAllDevices,
  deleteAccount
} from '../controllers/auth.controller';
import {
  validateBody,
  validateQuery,
  signUpSchema,
  signInSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileQuerySchema
} from '../validations/auth.validations';
import { authenticateToken } from '@middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.post('/signup', validateBody(signUpSchema), signUp);
router.post('/signin', validateBody(signInSchema), signIn);
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);
router.post('/refresh-token', refreshToken);

// Protected routes (authentication required)
router.get('/profile', 
  authenticateToken, 
  validateQuery(profileQuerySchema), 
  getProfile
);

router.put('/profile', 
  authenticateToken, 
  validateBody(updateProfileSchema), 
  updateProfile
);

router.put('/change-password', 
  authenticateToken, 
  validateBody(changePasswordSchema), 
  changePassword
);

router.post('/signout', authenticateToken, signOut);
router.post('/signout-all', authenticateToken, signOutAllDevices);
router.delete('/account', authenticateToken, deleteAccount);

export default router;