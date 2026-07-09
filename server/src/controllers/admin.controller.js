import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import {
  getAdminStatsService,
  getAllUsersService,
  getUserDetailService,
  getUserActivityService,
  getPlatformActivityService,
  updateUserRoleService,
  adminDeleteUserService,
} from '../services/admin.service.js';
import { USER_ROLES, ADMIN_EMAIL, ADMIN_EMAILS } from '../constants/index.js';

/**
 * GET /api/admin/overview
 * Platform-wide stats: user counts, poll counts, response counts, recent activity.
 */
export const getAdminOverview = asyncHandler(async (req, res) => {
  const stats = await getAdminStatsService();
  res.status(200).json({ success: true, data: stats });
});

/**
 * GET /api/admin/users?page=1&limit=20&search=
 * Paginated list of all users.
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const result = await getAllUsersService({
    page: parseInt(page),
    limit: parseInt(limit),
    search: search.trim(),
  });
  res.status(200).json({ success: true, ...result });
});

/**
 * GET /api/admin/users/:id
 * Full detail for one user.
 */
export const getUserDetail = asyncHandler(async (req, res) => {
  const result = await getUserDetailService(req.params.id);
  if (!result) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, data: result });
});

/**
 * GET /api/admin/users/:id/activity?page=1&limit=30
 * Activity log for one user.
 */
export const getUserActivityLog = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const result = await getUserActivityService(req.params.id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  res.status(200).json({ success: true, ...result });
});

/**
 * GET /api/admin/activity?page=1&limit=30
 * Platform-wide activity feed.
 */
export const getPlatformActivity = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const result = await getPlatformActivityService({
    page: parseInt(page),
    limit: parseInt(limit),
  });
  res.status(200).json({ success: true, ...result });
});

/**
 * PATCH /api/admin/users/:id/role
 * Change a user's role. Cannot change the hardcoded admin's role.
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!Object.values(USER_ROLES).includes(role)) {
    throw new ApiError(400, `Invalid role. Must be one of: ${Object.values(USER_ROLES).join(', ')}`);
  }

  // Prevent changing the hardcoded admin's role
  const targetUser = await (await import('../models/User.js')).default.findById(req.params.id).select('email');
  if (ADMIN_EMAILS.includes(targetUser?.email)) {
    throw new ApiError(403, 'Cannot change the role of the designated admin account.');
  }

  const user = await updateUserRoleService(req.params.id, role);
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, user });
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user account (and their data). Cannot delete the admin.
 */
export const adminDeleteUser = asyncHandler(async (req, res) => {
  const targetUser = await (await import('../models/User.js')).default.findById(req.params.id).select('email');
  if (ADMIN_EMAILS.includes(targetUser?.email)) {
    throw new ApiError(403, 'Cannot delete the designated admin account.');
  }
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(403, 'Cannot delete your own account via admin panel.');
  }

  const result = await adminDeleteUserService(req.params.id);
  if (!result) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, message: 'User deleted successfully' });
});
