import express from 'express';
import { 
  updateOnboarding, 
  getProfile, 
  getProfileStats, 
  updateProfile, 
  changePassword, 
  deleteAccount,
  uploadAvatar
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.use(protect);

router.patch('/onboarding', updateOnboarding);
router.get('/profile', getProfile);
router.get('/profile/stats', getProfileStats);
router.patch('/profile', updateProfile);
router.patch('/profile/password', changePassword);
router.delete('/profile', deleteAccount);
router.post('/profile/avatar', upload.single('avatar'), uploadAvatar);

export default router;
