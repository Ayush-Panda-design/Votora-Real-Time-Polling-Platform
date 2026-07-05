import { SOCKET_EVENTS } from '../constants/index.js';

export const registerAnalyticsSocketHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.SUBSCRIBE_ANALYTICS, async (pollId) => {
    if (!socket.userId || !pollId) return;

    try {
      const Poll = (await import('../models/Poll.js')).default;
      const poll = await Poll.findById(pollId).select('createdBy');
      if (!poll || poll.createdBy.toString() !== socket.userId) return;

      socket.join(`analytics:${pollId}`);
    } catch {
      // ignore invalid poll id
    }
  });

  socket.on(SOCKET_EVENTS.UNSUBSCRIBE_ANALYTICS, (pollId) => {
    if (pollId) socket.leave(`analytics:${pollId}`);
  });
};
