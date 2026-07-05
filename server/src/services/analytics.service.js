import Analytics from '../models/Analytics.js';
import Poll from '../models/Poll.js';
import ApiError from '../utils/ApiError.js';
import calculateAnalytics from '../utils/calculateAnalytics.js';

const ANALYTICS_CACHE_MS = 15_000;

export const getAnalyticsService = async (pollId, userId) => {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new ApiError(404, 'Poll not found');
  if (poll.createdBy.toString() !== userId.toString())
    throw new ApiError(403, 'Not authorised to view analytics for this poll');

  const cached = await Analytics.findOne({ pollId });
  const cacheFresh = cached?.updatedAt
    && Date.now() - new Date(cached.updatedAt).getTime() < ANALYTICS_CACHE_MS;

  if (cacheFresh) {
    const stats = {
      totalResponses: cached.totalResponses,
      questionStats: cached.questionStats,
      responseTimeline: cached.responseTimeline ?? [],
      peakActivity: cached.peakActivity ?? null,
    };
    return { poll, analytics: cached, stats };
  }

  const stats = await calculateAnalytics(pollId);

  const analytics = await Analytics.findOneAndUpdate(
    { pollId },
    {
      totalResponses: stats.totalResponses,
      questionStats: stats.questionStats,
      responseTimeline: stats.responseTimeline,
      peakActivity: stats.peakActivity,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return { poll, analytics, stats };
};
