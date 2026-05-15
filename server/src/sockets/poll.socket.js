import { SOCKET_EVENTS } from '../constants/index.js';


const roomParticipants = {};


export const registerPollSocketHandlers = (io, socket) => {

  socket.on(SOCKET_EVENTS.JOIN_POLL, (pollId) => {
    const room = `poll:${pollId}`;
    socket.join(room);

    roomParticipants[pollId] = (roomParticipants[pollId] || 0) + 1;
    io.to(room).emit(SOCKET_EVENTS.PARTICIPANT_COUNT, { pollId, count: roomParticipants[pollId] });

    console.log(`Socket ${socket.id} joined room ${room}. Participants: ${roomParticipants[pollId]}`);
  });


  socket.on(SOCKET_EVENTS.LEAVE_POLL, (pollId) => {
    const room = `poll:${pollId}`;
    socket.leave(room);

    if (roomParticipants[pollId] > 0) roomParticipants[pollId]--;
    io.to(room).emit(SOCKET_EVENTS.PARTICIPANT_COUNT, { pollId, count: roomParticipants[pollId] || 0 });
  });


  socket.on('disconnect', () => {
   
    Object.keys(roomParticipants).forEach((pollId) => {
      if (socket.rooms?.has(`poll:${pollId}`)) {
        if (roomParticipants[pollId] > 0) roomParticipants[pollId]--;
        io.to(`poll:${pollId}`).emit(SOCKET_EVENTS.PARTICIPANT_COUNT, {
          pollId,
          count: roomParticipants[pollId] || 0,
        });
      }
    });
  });

 
  socket.on(SOCKET_EVENTS.START_TIMER, async ({ pollId }) => {
    try {
     
      const Poll = (await import('../models/Poll.js')).default;
      const poll = await Poll.findById(pollId);
      if (poll && poll.timeLimitSystem === 'timer' && poll.timerDuration) {
        poll.timerEndTime = new Date(Date.now() + poll.timerDuration * 60 * 1000);
        await poll.save();
        io.to(`poll:${pollId}`).emit(SOCKET_EVENTS.TIMER_STARTED, { endTime: poll.timerEndTime });
      }
    } catch (err) {
      console.error('Error starting timer:', err);
    }
  });
};
