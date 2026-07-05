import mongoose from 'mongoose';
import { POLL_STATUS } from '../constants/index.js';

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: { type: [String], required: true, validate: [(arr) => arr.length >= 2, 'At least 2 options required'] },
    correctOption: { type: Number, default: null },
    required: { type: Boolean, default: true },
  },
  { _id: true }
);

const pollSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isQuiz: { type: Boolean, default: false },
    cheatProtection: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: true },
    requiresAuth: { type: Boolean, default: false },
    accessCodeHash: { type: String, select: false, default: null },
    allowedDomains: { type: [String], default: [] },
    shuffleOptions: { type: Boolean, default: false },
    maxResponses: { type: Number, default: null, min: 1 },
    timeLimitSystem: { type: String, enum: ['none', 'expiry', 'timer'], default: 'none' },
    timerDuration: { type: Number, default: null },
    expiresAt: { type: Date, default: null },
    timerEndTime: { type: Date, default: null },
    isPublished: { type: Boolean, default: false },
    pollCode: { type: String, required: true, unique: true, uppercase: true },
    status: { type: String, enum: Object.values(POLL_STATUS), default: POLL_STATUS.ACTIVE },
    questions: { type: [questionSchema], validate: [(arr) => arr.length >= 1, 'At least 1 question required'] },
    totalResponses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

pollSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > new Date(this.expiresAt);
};

pollSchema.methods.requiresAccessCode = function () {
  return Boolean(this.accessCodeHash);
};

pollSchema.virtual('requiresAccessCodePublic').get(function () {
  return Boolean(this.accessCodeHash);
});

pollSchema.set('toJSON', { virtuals: true });
pollSchema.set('toObject', { virtuals: true });

const Poll = mongoose.model('Poll', pollSchema);
export default Poll;
