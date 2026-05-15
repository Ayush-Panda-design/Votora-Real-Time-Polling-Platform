
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};


export const buildPollUrl = (pollCode) =>
  `${window.location.origin}/poll/${pollCode}`;


export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
];

export const getChartColor = (index) =>
  CHART_COLORS[index % CHART_COLORS.length];

/** Check if poll is active */
export const isPollActive = (poll) => {
  if (!poll) return false;
  if (poll.status === 'expired') return false;
  if (poll.expiresAt && new Date() > new Date(poll.expiresAt)) return false;
  return true;
};


export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace('/api', '');
  return `${baseUrl}${path}`;
};
