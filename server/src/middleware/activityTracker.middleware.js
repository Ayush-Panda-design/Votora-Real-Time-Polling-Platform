import UserActivity from '../models/UserActivity.js';

/**
 * Resolves an IP address to a geo location using ip-api.com (free, no API key).
 * Returns an empty location object on failure (non-blocking).
 */
export const resolveGeo = async (ip) => {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
    return { city: 'Localhost', country: 'Local', countryCode: 'LO', region: '' };
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,countryCode,regionName`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return { city: '', country: '', countryCode: '', region: '' };
    const data = await res.json();
    if (data.status !== 'success') return { city: '', country: '', countryCode: '', region: '' };
    return {
      city: data.city || '',
      country: data.country || '',
      countryCode: data.countryCode || '',
      region: data.regionName || '',
    };
  } catch {
    return { city: '', country: '', countryCode: '', region: '' };
  }
};

/**
 * Extract real IP from request (handles reverse proxies).
 */
export const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || '';
};

/**
 * Middleware: records API activity for authenticated users.
 * Non-blocking — fires and forgets so it never slows down the request.
 */
export const activityTracker = (req, res, next) => {
  // Only track authenticated users
  res.on('finish', async () => {
    try {
      if (!req.user?._id) return;
      // Skip tracking admin API calls and auth internals to avoid noise
      if (req.path.startsWith('/admin') || req.path.startsWith('/auth/me') || req.path.startsWith('/auth/refresh')) return;

      const ip = getClientIp(req);
      const userAgent = req.headers['user-agent'] || '';
      const method = req.method;
      const path = req.path;

      // Map API path to a human-readable page label
      let type = 'page_visit';
      let page = path;
      const meta = {};

      if (method === 'POST' && path.includes('/polls') && !path.includes('/responses')) {
        type = 'poll_created';
        page = 'Create Poll';
      } else if (method === 'POST' && path.includes('/responses')) {
        type = 'poll_responded';
        page = 'Poll Response';
      } else if (method === 'GET' && path.includes('/analytics')) {
        type = 'poll_viewed';
        page = 'Analytics';
      } else if (method === 'GET' && path.includes('/polls') && path !== '/polls') {
        type = 'poll_viewed';
        page = 'Poll View';
      } else if (method === 'POST' && path.includes('/auth/login')) {
        type = 'login';
        page = 'Login';
      } else if (method === 'POST' && path.includes('/auth/logout')) {
        type = 'logout';
        page = 'Logout';
      }

      // Resolve geo asynchronously without blocking
      const location = await resolveGeo(ip);

      await UserActivity.create({
        userId: req.user._id,
        type,
        page,
        ip,
        userAgent,
        location,
        metadata: meta,
      });
    } catch {
      // Silently ignore activity tracking errors
    }
  });
  next();
};
