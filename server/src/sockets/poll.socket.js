import { SOCKET_EVENTS } from '../constants/index.js';
import { emitParticipantCount } from '../services/socket.service.js';

const normalizePollId = (pollId) => String(pollId);

const getRoomCount = (io, pollId) => {
  const room = io.sockets.adapter.rooms.get(`poll:${normalizePollId(pollId)}`);
  return room ? room.size : 0;
};

export const registerPollSocketHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.JOIN_POLL, (pollId) => {
    if (!pollId) return;
    const id = normalizePollId(pollId);
    socket.join(`poll:${id}`);
    emitParticipantCount(id, getRoomCount(io, id));
  });

  socket.on(SOCKET_EVENTS.LEAVE_POLL, (pollId) => {
    if (!pollId) return;
    const id = normalizePollId(pollId);
    socket.leave(`poll:${id}`);
    emitParticipantCount(id, getRoomCount(io, id));
  });

  socket.on(SOCKET_EVENTS.START_TIMER, async ({ pollId }) => {
    if (!socket.userId || !pollId) return;

    try {
      const { startPollTimerService } = await import('../services/poll.service.js');
      const { emitTimerStarted } = await import('../services/socket.service.js');
      const poll = await startPollTimerService(pollId, socket.userId);
      emitTimerStarted(poll._id, poll.timerEndTime, poll.createdBy?.toString());
    } catch (err) {
      console.error('Error starting timer:', err.message);
    }
  });
};
