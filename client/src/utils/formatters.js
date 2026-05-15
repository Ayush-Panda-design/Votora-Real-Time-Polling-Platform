
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};


export const formatNumber = (n) => n?.toLocaleString() ?? '0';


export const formatPercent = (n) => `${Math.round(n ?? 0)}%`;


export const truncate = (str, len = 60) =>
  str?.length > len ? str.substring(0, len) + '…' : str ?? '';


export const timeUntilExpiry = (expiresAt) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0)  return `${hours}h ${mins}m`;
  return `${mins}m`;
};
