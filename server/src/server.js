import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import startExpiryJob from './jobs/expiry.job.js';
import ensureUploadDirs from './utils/ensureDirs.js';
import { getClientOrigins } from './config/clientOrigins.js';

const PORT = process.env.PORT || 5013;

const start = async () => {
  ensureUploadDirs();
  await connectDB();


  const httpServer = http.createServer(app);


  initSocket(httpServer);


  startExpiryJob();

  httpServer.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV}`);
    console.log(` Allowed client origins: ${getClientOrigins().join(', ')}`);
    if (process.env.NODE_ENV === 'production' && !process.env.GOOGLE_CLIENT_ID) {
      console.warn(' GOOGLE_CLIENT_ID is not set — Google sign-in will fail');
    }
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
