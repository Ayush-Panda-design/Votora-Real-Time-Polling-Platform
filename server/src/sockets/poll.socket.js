import { SOCKET_EVENTS } from '../constants/index.js';
import { emitParticipantCount } from '../services/socket.service.js';

const getRoomCount = (io, pollId) => {
  const room = io.sockets.adapter.rooms.get(`poll:${pollId}`);
  return room ? room.size : 0;
};

export const registerPollSocketHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.JOIN_POLL, (pollId) => {
    const room = `poll:${pollId}`;
    socket.join(room);
    emitParticipantCount(pollId, getRoomCount(io, pollId));
  });

  socket.on(SOCKET_EVENTS.LEAVE_POLL, (pollId) => {
    socket.leave(`poll:${pollId}`);
    emitParticipantCount(pollId, getRoomCount(io, pollId));
  });

  socket.on(SOCKET_EVENTS.START_TIMER, async ({ pollId }) => {
    if (!socket.userId || !pollId) return;

    try {
      const { startPollTimerService } = await import('../services/poll.service.js');
      const { emitTimerStarted } = await import('../services/socket.service.js');
      const poll = await startPollTimerService(pollId, socket.userId);
      emitTimerStarted(pollId, poll.timerEndTime, poll.createdBy?.toString());
    } catch (err) {
      console.error('Error starting timer:', err.message);
    }
  });
};
