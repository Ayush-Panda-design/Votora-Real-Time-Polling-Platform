import { SOCKET_EVENTS } from '../constants/index.js';


export const registerAnalyticsSocketHandlers = (io, socket) => {
  socket.on('subscribe_analytics', (pollId) => {
    const room = `analytics:${pollId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} subscribed to analytics for poll ${pollId}`);
  });

  socket.on('unsubscribe_analytics', (pollId) => {
    socket.leave(`analytics:${pollId}`);
  });
};
