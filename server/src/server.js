import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import startExpiryJob from './jobs/expiry.job.js';
import ensureUploadDirs from './utils/ensureDirs.js';
import { assertProductionClientConfig, getAuthConfigStatus, getClientOrigins } from './config/clientOrigins.js';

const PORT = process.env.PORT || 5013;

const start = async () => {
  ensureUploadDirs();
  assertProductionClientConfig();
  await connectDB();


  const httpServer = http.createServer(app);


  initSocket(httpServer);


  startExpiryJob();

  httpServer.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV}`);
    console.log(` Allowed client origins: ${getClientOrigins().join(', ') || '(none — set CLIENT_URL)'}`);
    const authConfig = getAuthConfigStatus();
    if (process.env.NODE_ENV === 'production' && !authConfig.googleSignInConfigured) {
      console.warn(' GOOGLE_CLIENT_ID is not set — Google sign-in will fail until configured');
    }
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
