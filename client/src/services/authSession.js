const STORAGE_KEY = 'votora_access_token';

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private browsing / storage blocked */
  }
};

export const getAccessToken = () => {
  if (accessToken) return accessToken;
  try {
    accessToken = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    accessToken = null;
  }
  return accessToken;
};

export const clearAccessToken = () => setAccessToken(null);

// Restore token on module load (survives page refresh within the tab)
getAccessToken();
