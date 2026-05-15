import User from '../models/User.js';
import Poll from '../models/Poll.js';
import Response from '../models/Response.js';
import ApiError from '../utils/ApiError.js';
import bcrypt from 'bcryptjs';

export const getProfileStatsService = async (userId) => {
  const polls = await Poll.find({ createdBy: userId });
  const pollIds = polls.map(p => p._id);

  const totalPolls = polls.length;
  const activePolls = polls.filter(p => p.status === 'active').length;
  const totalResponses = polls.reduce((sum, p) => sum + (p.totalResponses || 0), 0);

  
  const mostPopularPoll = polls.length > 0 
    ? [...polls].sort((a, b) => (b.totalResponses || 0) - (a.totalResponses || 0))[0]
    : null;


  const avgResponses = totalPolls > 0 ? (totalResponses / totalPolls).toFixed(1) : 0;

 
  const responses = await Response.find({ pollId: { $in: pollIds } });
  const hourCounts = new Array(24).fill(0);
  responses.forEach(r => {
    const hour = new Date(r.createdAt).getHours();
    hourCounts[hour]++;
  });

  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakTime = `${peakHour}:00 - ${peakHour + 1}:00`;

 
  const uniqueDays = new Set(polls.map(p => new Date(p.createdAt).toDateString()));
  const streak = uniqueDays.size;

  return {
    totalPolls,
    activePolls,
    totalResponses,
    mostPopularPoll: mostPopularPoll ? { title: mostPopularPoll.title, responses: mostPopularPoll.totalResponses } : null,
    avgResponses,
    peakTime,
    streak,
  };
};

export const updateProfileService = async (userId, data) => {
  const { name, occupation, avatar } = data;
  const user = await User.findByIdAndUpdate(
    userId,
    { name, occupation, avatar },
    { new: true, runValidators: true }
  );
  return user;
};

export const changePasswordService = async (userId, { oldPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new ApiError(401, 'Incorrect current password');

  user.password = newPassword;
  await user.save();
  return true;
};

export const deleteAccountService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

 
  await Poll.deleteMany({ createdBy: userId });
  
  
  await user.deleteOne();
};
