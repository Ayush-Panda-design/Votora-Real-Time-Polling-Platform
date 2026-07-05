const SOCKET_META_KEYS = ['pollId', '_id', '__v', 'createdAt', 'updatedAt'];

/** Strip socket metadata so payloads merge cleanly into page state.stats */
export const normalizeSocketStats = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const stats = { ...payload };
  SOCKET_META_KEYS.forEach((key) => delete stats[key]);
  return stats;
};

export const mergeAnalyticsStats = (prevStats, incoming) => {
  const next = normalizeSocketStats(incoming);
  if (!next) return prevStats;
  return { ...prevStats, ...next };
};
