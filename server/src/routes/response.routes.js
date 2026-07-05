import express from 'express';
import { submitResponse, getResponses, getResponseById } from '../controllers/response.controller.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { checkPollExpiry } from '../middleware/expiry.middleware.js';
import { submitResponseValidator } from '../validators/response.validator.js';
import validate from '../middleware/validation.middleware.js';

const router = express.Router();


router.post('/:pollId', optionalAuth, checkPollExpiry, submitResponseValidator, validate, submitResponse);


router.get('/:pollId', protect, getResponses);
router.get('/:pollId/:responseId', protect, getResponseById);

export default router;
