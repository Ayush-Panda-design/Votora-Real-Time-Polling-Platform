import Poll from '../models/Poll.js';
import Analytics from '../models/Analytics.js';
import generatePollCode from '../utils/generatePollCode.js';
import ApiError from '../utils/ApiError.js';
import { POLL_STATUS } from '../constants/index.js';
import xss from 'xss';

export const createPollService = async (data, userId) => {
  let poll;
  let attempts = 0;
  const maxAttempts = 5;


  const { createdBy: _cb, pollCode: _pc, status: _st, isPublished: _ip, totalResponses: _tr, ...safeData } = data;

  while (attempts < maxAttempts) {
    try {
      const pollCode = generatePollCode();
      const sanitizedData = {
        ...safeData,
        title: xss(safeData.title),
        description: xss(safeData.description || ''),
      };
      poll = await Poll.create({ ...sanitizedData, createdBy: userId, pollCode });
      
      
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

  return poll;
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


const EDITABLE_FIELDS = ['title', 'description', 'isAnonymous', 'requiresAuth', 'expiresAt', 'questions', 'isQuiz', 'cheatProtection'];

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
  console.log(`[Debug] Searching for public poll with code: "${pollCode}"`);
 
  const poll = await Poll.findOne({ pollCode: pollCode.toUpperCase() }).select('-createdBy -questions.correctOption');
  
  if (!poll) {
    console.warn(`[Debug] Poll NOT found for code: "${pollCode}"`);
    throw new ApiError(404, 'Poll not found');
  }

  if (poll.isExpired() && !poll.isPublished) {
    poll.status = POLL_STATUS.EXPIRED;
    await poll.save();
    throw new ApiError(410, 'This poll has expired');
  }

  return poll;
};

export const getPublicResultsService = async (pollCode) => {
  const poll = await Poll.findOne({ pollCode });
  if (!poll) throw new ApiError(404, 'Poll not found');
  if (!poll.isPublished) throw new ApiError(403, 'Results not yet published');

  const analytics = await Analytics.findOne({ pollId: poll._id });
  return { poll, analytics };
};
