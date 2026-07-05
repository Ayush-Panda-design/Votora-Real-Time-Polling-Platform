import { SOCKET_EVENTS } from '../constants/index.js';

export const registerUserSocketHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.JOIN_USER, () => {
    if (!socket.userId) return;
    socket.join(`user:${socket.userId}`);
  });

  socket.on(SOCKET_EVENTS.LEAVE_USER, () => {
    if (!socket.userId) return;
    socket.leave(`user:${socket.userId}`);
  });
};
