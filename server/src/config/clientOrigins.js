const normalizeOrigin = (value) => value?.trim().replace(/\/$/, '');

/** Comma-separated list in CLIENT_URL, e.g. https://app.vercel.app,https://preview.vercel.app */
export const getClientOrigins = () => {
  const raw = process.env.CLIENT_URL || 'http://localhost:5173';
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

export const primaryClientOrigin = () => getClientOrigins()[0];
