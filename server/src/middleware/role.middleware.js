import ApiError from '../utils/ApiError.js';
import { USER_ROLES } from '../constants/index.js';


export const adminOnly = (req, res, next) => {
  if (req.user?.role !== USER_ROLES.ADMIN) {
    throw new ApiError(403, 'Access denied. Admins only.');
  }
  next();
};
