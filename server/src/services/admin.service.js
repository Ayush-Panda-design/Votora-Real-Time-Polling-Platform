import User from '../models/User.js';
import Poll from '../models/Poll.js';
import Response from '../models/Response.js';
import UserActivity from '../models/UserActivity.js';

/**
 * Platform-wide overview stats for the admin dashboard.
 */
export const getAdminStatsService = async () => {
  const [totalUsers, totalPolls, totalResponses, recentUsers] = await Promise.all([
    User.countDocuments(),
    Poll.countDocuments(),
    Response.countDocuments(),
    User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email avatar role createdAt lastLoginAt authProvider'),
  ]);

  // Signups per day (last 14 days)
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const signupsByDay = await User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', count: 1, _id: 0 } },
  ]);

  // Activity events last 7 days
  const activitySince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentActivity = await UserActivity.find({ createdAt: { $gte: activitySince } })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('userId', 'name email avatar');

  // Users active in last 24 hours
  const activeSince24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeUsers24h = await User.countDocuments({ lastSessionAt: { $gte: activeSince24h } });

  return {
    totalUsers,
    totalPolls,
    totalResponses,
    activeUsers24h,
    recentUsers,
    signupsByDay,
    recentActivity,
  };
};

/**
 * Paginated list of all users with their stats.
 */
export const getAllUsersService = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const skip = (page - 1) * limit;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        'name email avatar role authProvider occupation createdAt lastLoginAt lastSessionAt totalLogins sessionCount registrationIP registrationLocation loginHistory onboardingCompleted isEmailVerified'
      ),
    User.countDocuments(query),
  ]);

  // Add poll/response counts per user in batch
  const userIds = users.map((u) => u._id);
  const [pollCounts, responseCounts] = await Promise.all([
    Poll.aggregate([
      { $match: { createdBy: { $in: userIds } } },
      { $group: { _id: '$createdBy', count: { $sum: 1 } } },
    ]),
    Response.aggregate([
      { $match: { respondent: { $in: userIds } } },
      { $group: { _id: '$respondent', count: { $sum: 1 } } },
    ]),
  ]);

  const pollCountMap = Object.fromEntries(pollCounts.map((p) => [p._id.toString(), p.count]));
  const responseCountMap = Object.fromEntries(responseCounts.map((r) => [r._id.toString(), r.count]));

  const enrichedUsers = users.map((u) => ({
    ...u.toObject(),
    pollsCreated: pollCountMap[u._id.toString()] || 0,
    pollsResponded: responseCountMap[u._id.toString()] || 0,
  }));

  return { users: enrichedUsers, total, page, limit, pages: Math.ceil(total / limit) };
};

/**
 * Full detail for a single user (for the admin user detail panel).
 */
export const getUserDetailService = async (userId) => {
  const user = await User.findById(userId).select(
    'name email avatar role authProvider occupation interests createdAt lastLoginAt lastSessionAt totalLogins sessionCount registrationIP registrationLocation loginHistory onboardingCompleted isEmailVerified'
  );
  if (!user) return null;

  const [polls, responses, activityCount] = await Promise.all([
    Poll.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(10).select('title status totalResponses createdAt pollCode'),
    Response.find({ respondent: userId }).sort({ createdAt: -1 }).limit(10).populate('pollId', 'title pollCode'),
    UserActivity.countDocuments({ userId }),
  ]);

  return {
    user: user.toObject(),
    polls,
    responses,
    activityCount,
  };
};

/**
 * Paginated activity log for a single user.
 */
export const getUserActivityService = async (userId, { page = 1, limit = 30 } = {}) => {
  const skip = (page - 1) * limit;
  const [activity, total] = await Promise.all([
    UserActivity.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    UserActivity.countDocuments({ userId }),
  ]);
  return { activity, total, page, limit, pages: Math.ceil(total / limit) };
};

/**
 * Platform-wide recent activity feed (all users).
 */
export const getPlatformActivityService = async ({ page = 1, limit = 30 } = {}) => {
  const skip = (page - 1) * limit;
  const [activity, total] = await Promise.all([
    UserActivity.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email avatar'),
    UserActivity.countDocuments(),
  ]);
  return { activity, total, page, limit, pages: Math.ceil(total / limit) };
};

/**
 * Update a user's role.
 */
export const updateUserRoleService = async (userId, role) => {
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: false });
  if (!user) return null;
  return user;
};

/**
 * Delete a user account along with their polls and responses.
 */
export const adminDeleteUserService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;
  await Promise.all([
    Poll.deleteMany({ createdBy: userId }),
    Response.deleteMany({ respondent: userId }),
    UserActivity.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);
  return true;
};
