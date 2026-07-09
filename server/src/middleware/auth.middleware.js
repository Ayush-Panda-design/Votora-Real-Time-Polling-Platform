import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ADMIN_EMAILS, USER_ROLES } from '../constants/index.js';


export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) throw new ApiError(401, 'Not authenticated. Please log in.');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) throw new ApiError(401, 'User no longer exists.');

  // Auto-promote designated admin emails if not already admin
  if (ADMIN_EMAILS.includes(user.email) && user.role !== USER_ROLES.ADMIN) {
    user.role = USER_ROLES.ADMIN;
    await user.save({ validateBeforeSave: false });
  }

  req.user = user;
  next();
});



export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  req.user = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  }
  next();
});
