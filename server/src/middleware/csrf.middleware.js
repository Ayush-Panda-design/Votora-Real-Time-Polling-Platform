import { getClientOrigins, isAllowedClientOrigin, isAllowedClientReferer } from '../config/clientOrigins.js';

/**
 * Lightweight CSRF protection for cookie-based auth.
 * Uses the same origin allowlist as CORS (CLIENT_URL, comma-separated).
 */
export const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const origin = req.get('origin');
  if (origin && isAllowedClientOrigin(origin)) return next();

  const referer = req.get('referer');
  if (isAllowedClientReferer(referer)) return next();

  // Same-origin browser requests from axios include Origin; allow missing in dev tools only in development
  if (process.env.NODE_ENV === 'development' && !origin && !referer) return next();

  return res.status(403).json({
    success: false,
    message: 'Cross-origin request blocked',
    ...(process.env.NODE_ENV === 'development' && {
      hint: `Allowed origins: ${getClientOrigins().join(', ')}`,
    }),
  });
};
