import express from 'express';
import {
  signup,
  login,
  googleAuth,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  refresh,
  verifyEmail,
  resendVerification,
} from '../controllers/auth.controller.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/auth.validator.js';
import validate from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);
router.post('/refresh', refresh);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', forgotPasswordValidator, validate, resendVerification);
router.get('/me', optionalAuth, getMe);
router.post('/logout', protect, logout);

export default router;
