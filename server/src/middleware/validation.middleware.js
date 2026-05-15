import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    console.error(`[Validation Error] ${req.method} ${req.url}:`, messages);
    throw new ApiError(400, messages[0], errors.array());
  }
  next();
};

export default validate;
