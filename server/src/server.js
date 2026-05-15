import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import startExpiryJob from './jobs/expiry.job.js';

const PORT = process.env.PORT || 5013;

const start = async () => {
 
  await connectDB();


  const httpServer = http.createServer(app);


  initSocket(httpServer);


  startExpiryJob();

  httpServer.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
