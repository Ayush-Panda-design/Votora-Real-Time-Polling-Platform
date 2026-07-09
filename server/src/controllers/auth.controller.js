import asyncHandler from '../utils/asyncHandler.js';
import {
  signupService,
  loginService,
  googleAuthService,
  forgotPasswordService,
  resetPasswordService,
  refreshTokenService,
  verifyEmailService,
  resendVerificationService,
  logoutService,
} from '../services/auth.service.js';
import { COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from '../constants/index.js';

const sendTokenResponse = (res, { token, refreshToken, user }, statusCode = 200) => {
  res.cookie('token', token, COOKIE_OPTIONS);
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  }
  res.status(statusCode).json({ success: true, user, accessToken: token });
};

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || '';
  const userAgent = req.headers['user-agent'] || '';
  const { emailVerifyToken, adminSkippedVerify } = await signupService({ name, email, password, ip, userAgent });
  const payload = {
    success: true,
    message: adminSkippedVerify 
      ? 'Account created successfully. You can now log in.' 
      : 'Account created. Please verify your email before signing in.',
  };
  if (process.env.NODE_ENV === 'development' && emailVerifyToken) {
    payload.devVerifyToken = emailVerifyToken;
  }
  res.status(201).json(payload);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || '';
  const userAgent = req.headers['user-agent'] || '';
  const result = await loginService({ email, password, ip, userAgent });
  sendTokenResponse(res, result);
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || '';
  const userAgent = req.headers['user-agent'] || '';
  const result = await googleAuthService(idToken, { ip, userAgent });
  sendTokenResponse(res, result);
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const result = await refreshTokenService(refreshToken);
  sendTokenResponse(res, result);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await verifyEmailService(req.query.token);
  res.status(200).json({ success: true, message: 'Email verified successfully', user });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const emailVerifyToken = await resendVerificationService(req.body.email);
  const payload = {
    success: true,
    message: 'If that email exists and is unverified, a new link has been sent.',
  };
  if (process.env.NODE_ENV === 'development' && emailVerifyToken) {
    payload.devVerifyToken = emailVerifyToken;
  }
  res.status(200).json(payload);
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user ?? null });
});

export const logout = asyncHandler(async (req, res) => {
  await logoutService(req.user?._id);
  res.clearCookie('token');
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const resetToken = await forgotPasswordService(req.body.email);
  const payload = {
    success: true,
    message: 'If that email exists, a reset link has been sent.',
  };
  if (process.env.NODE_ENV === 'development' && resetToken) {
    payload.devResetToken = resetToken;
  }
  res.status(200).json(payload);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await resetPasswordService({ token, password });
  sendTokenResponse(res, result);
});
