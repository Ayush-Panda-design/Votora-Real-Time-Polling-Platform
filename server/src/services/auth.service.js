import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';
import { AUTH_PROVIDERS, COOKIE_OPTIONS } from '../constants/index.js';


export const signupService = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const user = await User.create({ name, email, password, authProvider: AUTH_PROVIDERS.LOCAL });
  const token = generateToken(user._id);
  return { token, user };
};


export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || user.authProvider !== AUTH_PROVIDERS.LOCAL)
    throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const token = generateToken(user._id);
  const safeUser = user.toObject();
  delete safeUser.password;
  return { token, user: safeUser };
};

import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


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
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.authProvider = AUTH_PROVIDERS.GOOGLE;
    if (!user.avatar) user.avatar = avatar;
    await user.save();
  }

  const token = generateToken(user._id);
  return { token, user };
};
