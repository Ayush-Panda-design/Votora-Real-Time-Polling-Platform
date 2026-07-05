import { getClientOrigins, isAllowedClientOrigin } from '../config/clientOrigins.js';

/**
 * Lightweight CSRF protection for cookie-based auth.
 * Verifies Origin/Referer matches CLIENT_URL on state-changing requests.
 */
export const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const allowedOrigins = getClientOrigins();

  const origin = req.get('origin');
  if (origin && isAllowedClientOrigin(origin)) return next();

  const referer = req.get('referer');
  if (referer && allowedOrigins.some((url) => referer.startsWith(url))) return next();
  // Same-origin browser requests from axios include Origin; allow missing in dev tools only in development
  if (process.env.NODE_ENV === 'development' && !origin && !referer) return next();

  return res.status(403).json({ success: false, message: 'Cross-origin request blocked' });
};
