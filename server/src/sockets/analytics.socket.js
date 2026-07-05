import { SOCKET_EVENTS } from '../constants/index.js';

const normalizePollId = (pollId) => String(pollId);

export const registerAnalyticsSocketHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.SUBSCRIBE_ANALYTICS, async (pollId) => {
    if (!socket.userId || !pollId) return;

    try {
      const Poll = (await import('../models/Poll.js')).default;
      const id = normalizePollId(pollId);
      const poll = await Poll.findById(id).select('createdBy');
      if (!poll || poll.createdBy.toString() !== socket.userId) return;

      socket.join(`analytics:${id}`);
    } catch {
      // ignore invalid poll id
    }
  });

  socket.on(SOCKET_EVENTS.UNSUBSCRIBE_ANALYTICS, (pollId) => {
    if (pollId) socket.leave(`analytics:${normalizePollId(pollId)}`);
  });
};
