import Poll from '../models/Poll.js';
import Analytics from '../models/Analytics.js';
import generatePollCode from '../utils/generatePollCode.js';
import ApiError from '../utils/ApiError.js';
import { POLL_STATUS } from '../constants/index.js';
import xss from 'xss';
import { hashAccessCode, verifyAccessCode, sanitizePollForPublic } from '../utils/pollSecurity.js';

const preparePollData = async (data) => {
  const { accessCode, allowedDomains, ...rest } = data;
  const accessCodeHash = accessCode?.trim() ? await hashAccessCode(accessCode) : null;
  const domains = (Array.isArray(allowedDomains) ? allowedDomains : String(allowedDomains || '').split(','))
    .map((d) => String(d).trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);

  return {
    ...rest,
    title: xss(rest.title),
    description: xss(rest.description || ''),
    accessCodeHash,
    allowedDomains: domains,
  };
};

export const createPollService = async (data, userId) => {
  let poll;
  let attempts = 0;
  const maxAttempts = 5;

  const { createdBy: _cb, pollCode: _pc, status: _st, isPublished: _ip, totalResponses: _tr, ...raw } = data;
  const safeData = await preparePollData(raw);

  while (attempts < maxAttempts) {
    try {
      const pollCode = generatePollCode();
      poll = await Poll.create({ ...safeData, createdBy: userId, pollCode });
      break;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.pollCode) {
        attempts++;
        if (attempts === maxAttempts) throw new ApiError(500, 'Failed to generate a unique poll code after multiple attempts');
        continue;
      }
      throw error;
    }
  }

  await Analytics.findOneAndUpdate(
    { pollId: poll._id },
    { $setOnInsert: { pollId: poll._id, totalResponses: 0, questionStats: [] } },
    { upsert: true, new: true }
  );

  const result = poll.toObject();
  delete result.accessCodeHash;
  result.requiresAccessCode = Boolean(poll.accessCodeHash);
  return result;
};

export const getUserPollsService = async (userId) => {
  return Poll.find({ createdBy: userId }).sort({ createdAt: -1 });
};

export const getPollByIdService = async (pollId, userId) => {
  const poll = await Poll.findById(pollId).populate('createdBy', 'name email');
  if (!poll) throw new ApiError(404, 'Poll not found');
  if (poll.createdBy._id.toString() !== userId.toString())
    throw new ApiError(403, 'Not authorised to view this poll');
  return poll;
};


const EDITABLE_FIELDS = [
  'title', 'description', 'isAnonymous', 'requiresAuth', 'expiresAt', 'questions',
  'isQuiz', 'cheatProtection', 'allowedDomains', 'shuffleOptions', 'maxResponses',
  'timeLimitSystem', 'timerDuration',
];

export const updatePollService = async (pollId, userId, updates) => {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new ApiError(404, 'Poll not found');
  if (poll.createdBy.toString() !== userId.toString())
    throw new ApiError(403, 'Not authorised to update this poll');

 
  EDITABLE_FIELDS.forEach((field) => {
    if (updates[field] !== undefined) {
      let value = updates[field];
      if (field === 'title' || field === 'description') {
        value = xss(value);
      }
      poll[field] = value;
    }
  });

  await poll.save();
  return poll;
};

export const deletePollService = async (pollId, userId) => {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new ApiError(404, 'Poll not found');
  if (poll.createdBy.toString() !== userId.toString())
    throw new ApiError(403, 'Not authorised to delete this poll');

  await poll.deleteOne();
  await Analytics.deleteOne({ pollId });
  return poll;
};

export const publishPollService = async (pollId, userId) => {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new ApiError(404, 'Poll not found');
  if (poll.createdBy.toString() !== userId.toString())
    throw new ApiError(403, 'Not authorised');

  poll.isPublished = true;
  poll.status = POLL_STATUS.PUBLISHED;
  await poll.save();
  return poll;
};

export const startPollTimerService = async (pollId, userId) => {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new ApiError(404, 'Poll not found');
  if (poll.createdBy.toString() !== userId.toString())
    throw new ApiError(403, 'Not authorised to start this poll timer');
  if (poll.timeLimitSystem !== 'timer')
    throw new ApiError(400, 'This poll does not use a manual live timer');
  if (!poll.timerDuration)
    throw new ApiError(400, 'Timer duration is not configured');

  poll.timerEndTime = new Date(Date.now() + poll.timerDuration * 60 * 1000);
  await poll.save();
  return poll;
};

export const duplicatePollService = async (pollId, userId) => {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new ApiError(404, 'Poll not found');
  if (poll.createdBy.toString() !== userId.toString())
    throw new ApiError(403, 'Not authorised');

  // Generate new code
  let pollCode;
  let exists = true;
  while (exists) {
    pollCode = generatePollCode();
    exists = await Poll.findOne({ pollCode });
  }

  // Create new poll as draft
  const newPoll = await Poll.create({
    title: `${poll.title} (Copy)`,
    description: poll.description,
    questions: poll.questions,
    isAnonymous: poll.isAnonymous,
    requiresAuth: poll.requiresAuth,
    createdBy: userId,
    pollCode,
    status: POLL_STATUS.ACTIVE,
    isPublished: false,
    totalResponses: 0
  });


  await Analytics.findOneAndUpdate(
    { pollId: newPoll._id },
    { $setOnInsert: { pollId: newPoll._id, totalResponses: 0, questionStats: [] } },
    { upsert: true, new: true }
  );

  return newPoll;
};

export const getPublicPollService = async (pollCode) => {
  const poll = await Poll.findOne({ pollCode: pollCode.toUpperCase() })
    .select('+accessCodeHash');

  if (!poll) throw new ApiError(404, 'Poll not found');

  if (poll.isExpired() && !poll.isPublished) {
    poll.status = POLL_STATUS.EXPIRED;
    await poll.save();
    throw new ApiError(410, 'This poll has expired');
  }

  if (poll.accessCodeHash) {
    return sanitizePollForPublic(poll, { includeQuestions: false });
  }

  return sanitizePollForPublic(poll, { includeQuestions: true });
};

export const unlockPublicPollService = async (pollCode, accessCode) => {
  const poll = await Poll.findOne({ pollCode: pollCode.toUpperCase() })
    .select('+accessCodeHash');

  if (!poll) throw new ApiError(404, 'Poll not found');
  if (!poll.accessCodeHash) throw new ApiError(400, 'This poll does not require an access code');

  const valid = await verifyAccessCode(accessCode, poll.accessCodeHash);
  if (!valid) throw new ApiError(403, 'Invalid access code');

  if (poll.isExpired() && !poll.isPublished) {
    throw new ApiError(410, 'This poll has expired');
  }

  return sanitizePollForPublic(poll, { includeQuestions: true });
};

export const getPublicResultsService = async (pollCode) => {
  const poll = await Poll.findOne({ pollCode });
  if (!poll) throw new ApiError(404, 'Poll not found');
  if (!poll.isPublished) throw new ApiError(403, 'Results not yet published');

  const analytics = await Analytics.findOne({ pollId: poll._id });
  return { poll, analytics };
};
