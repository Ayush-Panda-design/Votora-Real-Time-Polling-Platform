import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AUTH_PROVIDERS, USER_ROLES } from '../constants/index.js';

const loginHistorySchema = new mongoose.Schema(
  {
    ip: { type: String, default: '' },
    location: {
      city: { type: String, default: '' },
      country: { type: String, default: '' },
      countryCode: { type: String, default: '' },
      region: { type: String, default: '' },
    },
    userAgent: { type: String, default: '' },
    authProvider: { type: String, default: 'local' },
    loginAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    authProvider: { type: String, enum: Object.values(AUTH_PROVIDERS), default: AUTH_PROVIDERS.LOCAL },
    role: { type: String, enum: Object.values(USER_ROLES), default: USER_ROLES.USER },
    occupation: { type: String, default: '' }, 
    avatar: { type: String, default: '' },
    interests: [{ type: String }],
    onboardingCompleted: { type: Boolean, default: false },
    googleId: { type: String },
    lastLoginAt: { type: Date, default: null },
    lastSessionAt: { type: Date, default: null },
    sessionCount: { type: Number, default: 0 },
    totalLogins: { type: Number, default: 0 },
    registrationIP: { type: String, default: '' },
    registrationLocation: {
      city: { type: String, default: '' },
      country: { type: String, default: '' },
      countryCode: { type: String, default: '' },
      region: { type: String, default: '' },
    },
    loginHistory: { type: [loginHistorySchema], default: [] },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    isEmailVerified: { type: Boolean, default: true },
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
    refreshTokenHash: { type: String, select: false },
    refreshTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);


userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
