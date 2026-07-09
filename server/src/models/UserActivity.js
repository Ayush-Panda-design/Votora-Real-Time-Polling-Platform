import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['page_visit', 'session_start', 'session_end', 'poll_created', 'poll_responded', 'poll_viewed', 'login', 'logout'],
      required: true,
    },
    page: { type: String, default: '' },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    location: {
      city: { type: String, default: '' },
      country: { type: String, default: '' },
      countryCode: { type: String, default: '' },
      region: { type: String, default: '' },
    },
    sessionId: { type: String, default: '' },
    duration: { type: Number, default: null }, // seconds
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ createdAt: -1 });
userActivitySchema.index({ type: 1, createdAt: -1 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
export default UserActivity;
