import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import pollRoutes from './routes/poll.routes.js';
import responseRoutes from './routes/response.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import errorMiddleware from './middleware/error.middleware.js';
import { apiLimiter, authLimiter } from './middleware/rateLimit.middleware.js';
import { csrfProtection } from './middleware/csrf.middleware.js';
import { getClientOrigins, isAllowedClientOrigin, getAuthConfigStatus } from './config/clientOrigins.js';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
  // Required for @react-oauth/google (GIS postMessage from accounts.google.com)
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

app.use(cors({
  origin(origin, callback) {
    const allowedOrigins = getClientOrigins();
    if (isAllowedClientOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ') || '(none configured)'}`));
  },
  credentials: true,
}));



app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api', csrfProtection);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use('/public', express.static('public'));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const authConfig = getAuthConfigStatus();
  res.json({
    status: authConfig.clientOriginsConfigured ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    auth: authConfig,
  });
});


app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorMiddleware);

export default app;
