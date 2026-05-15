import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import {
  getProfileStatsService,
  updateProfileService,
  changePasswordService,
  deleteAccountService
} from '../services/user.service.js';

export const updateOnboarding = asyncHandler(async (req, res) => {
  const { interests, role: occupation } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { occupation, interests, onboardingCompleted: true },
    { new: true, runValidators: false }
  );
  res.status(200).json({ success: true, user });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, user });
});

export const getProfileStats = asyncHandler(async (req, res) => {
  const stats = await getProfileStatsService(req.user._id);
  res.status(200).json({ success: true, stats });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateProfileService(req.user._id, req.body);
  res.status(200).json({ success: true, user });
});

export const changePassword = asyncHandler(async (req, res) => {
  await changePasswordService(req.user._id, req.body);
  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await deleteAccountService(req.user._id);
  res.status(200).json({ success: true, message: 'Account deleted successfully' });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please upload an image');

  const avatarUrl = `/public/uploads/avatars/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { new: true }
  );

  res.status(200).json({ success: true, user });
});
