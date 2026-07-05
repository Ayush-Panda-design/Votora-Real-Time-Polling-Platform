import { getIO } from '../config/socket.js';
import { SOCKET_EVENTS } from '../constants/index.js';

const normalizePollId = (pollId) => String(pollId);

const toIsoTime = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const analyticsDebounce = new Map();
const DEBOUNCE_MS = 350;

const flushAnalyticsEmit = (pollIdStr, updateData, createdByUserId) => {
  try {
    const io = getIO();

    io.to(`poll:${pollIdStr}`).emit(SOCKET_EVENTS.NEW_RESPONSE, {
      pollId: pollIdStr,
      totalResponses: updateData.totalResponses,
    });

    io.to(`poll:${pollIdStr}`).emit(SOCKET_EVENTS.ANALYTICS_UPDATE, updateData);
    io.to(`analytics:${pollIdStr}`).emit(SOCKET_EVENTS.ANALYTICS_UPDATE, updateData);

    if (createdByUserId) {
      emitPollStatsUpdate(createdByUserId, {
        pollId: pollIdStr,
        totalResponses: updateData.totalResponses,
      });
    }
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }
};

export const emitNewResponse = (pollId, analytics, createdByUserId) => {
  const pollIdStr = normalizePollId(pollId);
  const updateData = { ...analytics, pollId: pollIdStr };

  if (analyticsDebounce.has(pollIdStr)) {
    clearTimeout(analyticsDebounce.get(pollIdStr));
  }

  analyticsDebounce.set(
    pollIdStr,
    setTimeout(() => {
      analyticsDebounce.delete(pollIdStr);
      flushAnalyticsEmit(pollIdStr, updateData, createdByUserId);
    }, DEBOUNCE_MS)
  );
};

export const emitPollStatsUpdate = (userId, stats) => {
  try {
    const io = getIO();
    const pollIdStr = stats.pollId ? normalizePollId(stats.pollId) : null;
    const payload = pollIdStr ? { ...stats, pollId: pollIdStr } : stats;
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.POLL_STATS_UPDATE, payload);
    if (pollIdStr) {
      io.to(`poll:${pollIdStr}`).emit(SOCKET_EVENTS.POLL_STATS_UPDATE, payload);
    }
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }
};

export const emitPollListChanged = (userId, action, poll) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.POLL_LIST_CHANGED, { action, poll });
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }
};

export const emitPollExpired = (pollId, createdByUserId) => {
  try {
    const io = getIO();
    const pollIdStr = normalizePollId(pollId);
    io.to(`poll:${pollIdStr}`).emit(SOCKET_EVENTS.POLL_EXPIRED, { pollId: pollIdStr });
    if (createdByUserId) {
      emitPollStatsUpdate(createdByUserId, { pollId: pollIdStr, status: 'expired' });
    }
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }
};

export const emitPollPublished = (pollId, createdByUserId, poll) => {
  try {
    const io = getIO();
    const pollIdStr = normalizePollId(pollId);
    io.to(`poll:${pollIdStr}`).emit(SOCKET_EVENTS.POLL_PUBLISHED, { pollId: pollIdStr, poll });
    if (createdByUserId) {
      emitPollStatsUpdate(createdByUserId, { pollId: pollIdStr, isPublished: true, status: 'published' });
      emitPollListChanged(createdByUserId, 'updated', poll);
    }
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }
};

export const emitTimerStarted = (pollId, endTime, createdByUserId) => {
  try {
    const io = getIO();
    const pollIdStr = normalizePollId(pollId);
    const endTimeIso = toIsoTime(endTime);
    const payload = { pollId: pollIdStr, endTime: endTimeIso };

    io.to(`poll:${pollIdStr}`).emit(SOCKET_EVENTS.TIMER_STARTED, payload);

    if (createdByUserId) {
      emitPollStatsUpdate(createdByUserId, { pollId: pollIdStr, timerEndTime: endTimeIso });
    }
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }
};

export const emitParticipantCount = (pollId, count) => {
  try {
    const io = getIO();
    const pollIdStr = normalizePollId(pollId);
    io.to(`poll:${pollIdStr}`).emit(SOCKET_EVENTS.PARTICIPANT_COUNT, { pollId: pollIdStr, count });
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }
};
