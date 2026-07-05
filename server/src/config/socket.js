import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { registerPollSocketHandlers } from '../sockets/poll.socket.js';
import { registerAnalyticsSocketHandlers } from '../sockets/analytics.socket.js';
import { registerUserSocketHandlers } from '../sockets/user.socket.js';
import { getClientOrigins } from './clientOrigins.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: getClientOrigins(),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    socket.userId = null;
    try {
      let token = socket.handshake.auth?.token;
      if (!token) {
        const raw = socket.handshake.headers.cookie || '';
        const cookies = cookie.parse(raw);
        token = cookies.token;
      }
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
      }
    } catch {
      socket.userId = null;
    }
    next();
  });
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}${socket.userId ? ` (user ${socket.userId})` : ''}`);

    registerPollSocketHandlers(io, socket);
    registerAnalyticsSocketHandlers(io, socket);
    registerUserSocketHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialised!');
  return io;
};
