import express from 'express';
import {
  getAdminOverview,
  getAllUsers,
  getUserDetail,
  getUserActivityLog,
  getPlatformActivity,
  updateUserRole,
  adminDeleteUser,
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/overview', getAdminOverview);
router.get('/activity', getPlatformActivity);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.get('/users/:id/activity', getUserActivityLog);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', adminDeleteUser);

export default router;
