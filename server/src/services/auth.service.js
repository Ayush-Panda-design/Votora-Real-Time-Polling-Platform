import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';
import { AUTH_PROVIDERS, ADMIN_EMAILS, USER_ROLES } from '../constants/index.js';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { resolveGeo } from '../middleware/activityTracker.middleware.js';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Records a login event into the user's loginHistory (keeps last 20).
 * Also bumps totalLogins and updates lastSessionAt.
 */
const recordLoginHistory = async (user, { ip, userAgent, authProvider }) => {
  const location = await resolveGeo(ip);
  const entry = { ip, location, userAgent: userAgent || '', authProvider, loginAt: new Date() };
  // Keep only the latest 20 entries
  const history = [...(user.loginHistory || []), entry];
  if (history.length > 20) history.splice(0, history.length - 20);
  user.loginHistory = history;
  user.totalLogins = (user.totalLogins || 0) + 1;
  user.lastSessionAt = new Date();
};

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

export const signupService = async ({ name, email, password, ip, userAgent }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  // Auto-assign admin role for designated admin emails
  const isAdmin = ADMIN_EMAILS.includes(email);
  const role = isAdmin ? USER_ROLES.ADMIN : USER_ROLES.USER;

  // Admin emails are pre-verified — no email verification step needed
  const user = await User.create({
    name, email, password,
    authProvider: AUTH_PROVIDERS.LOCAL,
    role,
    isEmailVerified: isAdmin ? true : false,
  });

  // Record registration geo asynchronously
  if (ip) {
    resolveGeo(ip).then((location) => {
      user.registrationIP = ip;
      user.registrationLocation = location;
      user.save({ validateBeforeSave: false }).catch(() => {});
    }).catch(() => {});
  }

  // Admins skip email verification; regular users get a verify token
  if (isAdmin) {
    const safeUser = user.toObject();
    delete safeUser.password;
    return { user: safeUser, emailVerifyToken: null, adminSkippedVerify: true };
  }

  const emailVerifyToken = await createEmailVerifyToken(user);
  const safeUser = user.toObject();
  delete safeUser.password;
  return { user: safeUser, emailVerifyToken };
};

export const loginService = async ({ email, password, ip, userAgent }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || user.authProvider !== AUTH_PROVIDERS.LOCAL)
    throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  // Admin emails bypass email verification entirely
  // Also fix any existing admin accounts that may be unverified in the DB
  if (ADMIN_EMAILS.includes(user.email)) {
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
    }
    user.role = USER_ROLES.ADMIN;
  } else if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email before logging in.');
  }

  user.lastLoginAt = new Date();
  await recordLoginHistory(user, { ip, userAgent, authProvider: AUTH_PROVIDERS.LOCAL });

  const { token, refreshToken, user: safeUser } = await issueTokens(user);
  return { token, refreshToken, user: safeUser };
};

export const googleAuthService = async (idToken, { ip, userAgent } = {}) => {
  if (!idToken) throw new ApiError(400, 'Google ID token is required');
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(500, 'Google sign-in is not configured on the server (missing GOOGLE_CLIENT_ID)');
  }

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch {
    throw new ApiError(401, 'Invalid Google token. Ensure GOOGLE_CLIENT_ID matches VITE_GOOGLE_CLIENT_ID.');
  }

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture: avatar } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    const role = ADMIN_EMAILS.includes(email) ? USER_ROLES.ADMIN : USER_ROLES.USER;
    user = await User.create({
      name,
      email,
      googleId,
      avatar,
      authProvider: AUTH_PROVIDERS.GOOGLE,
      onboardingCompleted: false,
      isEmailVerified: true,
      role,
      registrationIP: ip || '',
    });
    // Async geo lookup for registration
    if (ip) {
      resolveGeo(ip).then((location) => {
        user.registrationLocation = location;
        user.save({ validateBeforeSave: false }).catch(() => {});
      }).catch(() => {});
    }
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.authProvider = AUTH_PROVIDERS.GOOGLE;
    user.isEmailVerified = true;
    if (!user.avatar) user.avatar = avatar;
    await user.save();
  }

  // Auto-promote admin email
  if (ADMIN_EMAILS.includes(user.email)) user.role = USER_ROLES.ADMIN;

  user.lastLoginAt = new Date();
  await recordLoginHistory(user, { ip, userAgent, authProvider: AUTH_PROVIDERS.GOOGLE });

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
