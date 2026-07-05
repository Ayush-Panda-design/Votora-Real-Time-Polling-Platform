/** Strip socket metadata so payloads merge cleanly into page state.stats */
export const normalizeSocketStats = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const { pollId, _id, __v, createdAt, updatedAt, ...stats } = payload;
  return stats;
};

export const mergeAnalyticsStats = (prevStats, incoming) => {
  const next = normalizeSocketStats(incoming);
  if (!next) return prevStats;
  return { ...prevStats, ...next };
};
