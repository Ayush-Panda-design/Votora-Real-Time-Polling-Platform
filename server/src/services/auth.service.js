import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';
import { AUTH_PROVIDERS } from '../constants/index.js';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const issueTokens = async (user) => {
  const token = generateToken(user._id);
  const refreshToken = crypto.randomBytes(40).toString('hex');
  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  const safeUser = user.toObject();
  delete safeUser.password;
  return { token, refreshToken, user: safeUser };
};

const createEmailVerifyToken = async (user) => {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  user.emailVerifyToken = hashToken(verifyToken);
  user.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  user.isEmailVerified = false;
  await user.save({ validateBeforeSave: false });
  return verifyToken;
};

export const signupService = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const user = await User.create({ name, email, password, authProvider: AUTH_PROVIDERS.LOCAL });
  const emailVerifyToken = await createEmailVerifyToken(user);
  const safeUser = user.toObject();
  delete safeUser.password;
  return { user: safeUser, emailVerifyToken };
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || user.authProvider !== AUTH_PROVIDERS.LOCAL)
    throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  if (!user.isEmailVerified)
    throw new ApiError(403, 'Please verify your email before logging in.');

  user.lastLoginAt = new Date();
  const { token, refreshToken, user: safeUser } = await issueTokens(user);
  return { token, refreshToken, user: safeUser };
};

export const googleAuthService = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture: avatar } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      avatar,
      authProvider: AUTH_PROVIDERS.GOOGLE,
      onboardingCompleted: false,
      isEmailVerified: true,
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.authProvider = AUTH_PROVIDERS.GOOGLE;
    user.isEmailVerified = true;
    if (!user.avatar) user.avatar = avatar;
    await user.save();
  }

  user.lastLoginAt = new Date();
  const { token, refreshToken, user: safeUser } = await issueTokens(user);
  return { token, refreshToken, user: safeUser };
};

export const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) throw new ApiError(401, 'No refresh token');

  const user = await User.findOne({
    refreshTokenHash: hashToken(refreshToken),
    refreshTokenExpires: { $gt: new Date() },
  }).select('+refreshTokenHash +refreshTokenExpires');

  if (!user) throw new ApiError(401, 'Invalid or expired refresh token');

  return issueTokens(user);
};

export const verifyEmailService = async (token) => {
  const user = await User.findOne({
    emailVerifyToken: hashToken(token),
    emailVerifyExpires: { $gt: new Date() },
  }).select('+emailVerifyToken +emailVerifyExpires');

  if (!user) throw new ApiError(400, 'Invalid or expired verification link');

  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
};

export const resendVerificationService = async (email) => {
  const user = await User.findOne({ email, authProvider: AUTH_PROVIDERS.LOCAL });
  if (!user || user.isEmailVerified) return null;
  const emailVerifyToken = await createEmailVerifyToken(user);
  return emailVerifyToken;
};

export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email, authProvider: AUTH_PROVIDERS.LOCAL });
  if (!user) return null;

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  return resetToken;
};

export const resetPasswordService = async ({ token, password }) => {
  const user = await User.findOne({
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const { token: jwt, refreshToken, user: safeUser } = await issueTokens(user);
  return { token: jwt, refreshToken, user: safeUser };
};

export const logoutService = async (userId) => {
  if (!userId) return;
  await User.findByIdAndUpdate(userId, {
    refreshTokenHash: undefined,
    refreshTokenExpires: undefined,
  });
};
