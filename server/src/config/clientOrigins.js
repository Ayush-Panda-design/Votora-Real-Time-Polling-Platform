const normalizeOrigin = (value) => value?.trim().replace(/\/$/, '');

/**
 * Comma-separated list in CLIENT_URL, e.g.
 * https://app.vercel.app,https://preview-abc.vercel.app
 */
export const getClientOrigins = () => {
  const raw = process.env.CLIENT_URL?.trim();
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    return ['http://localhost:5173'];
  }

  const origins = raw
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  return origins.length ? origins : ['http://localhost:5173'];
};

export const isAllowedClientOrigin = (origin) => {
  if (!origin) return true;
  return getClientOrigins().includes(normalizeOrigin(origin));
};

export const isAllowedClientReferer = (referer) => {
  if (!referer) return false;
  return getClientOrigins().some((allowed) => referer.startsWith(allowed));
};

export const primaryClientOrigin = () => getClientOrigins()[0];

/** Fail fast in production when frontend origins are not configured. */
export const assertProductionClientConfig = () => {
  const origins = getClientOrigins();

  if (process.env.NODE_ENV === 'production' && origins.length === 0) {
    throw new Error(
      'CLIENT_URL is required in production. Set comma-separated frontend origins, e.g. https://app.vercel.app,https://preview.vercel.app',
    );
  }

  if (process.env.NODE_ENV === 'production' && origins.some((o) => /localhost|127\.0\.0\.1/.test(o))) {
    console.warn('[config] CLIENT_URL includes localhost in production — use deployed frontend URLs only.');
  }

  return origins;
};

export const getAuthConfigStatus = () => ({
  clientOriginsConfigured: getClientOrigins().length > 0,
  clientOriginCount: getClientOrigins().length,
  googleSignInConfigured: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
});
