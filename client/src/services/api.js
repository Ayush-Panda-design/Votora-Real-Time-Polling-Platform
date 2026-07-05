import axios from 'axios';
import { isAuthEndpoint, isPublicAppPath } from '../utils/authEndpoints';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  return config;
});

let refreshPromise = null;

const redirectToLogin = () => {
  const path = window.location.pathname;
  if (!path.startsWith('/login') && !path.startsWith('/signup')) {
    window.location.href = '/login';
  }
};

const shouldAttemptRefresh = (err, original) => {
  const path = window.location.pathname;
  return (
    err.response?.status === 401
    && !isAuthEndpoint(original?.url)
    && !original?._retry
    && !isPublicAppPath(path)
  );
};

const shouldRedirectOn401 = (err, original) => {
  const path = window.location.pathname;
  return (
    err.response?.status === 401
    && !isAuthEndpoint(original?.url)
    && !isPublicAppPath(path)
  );
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (shouldAttemptRefresh(err, original)) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh').finally(() => { refreshPromise = null; });
        }
        await refreshPromise;
        return api(original);
      } catch {
        redirectToLogin();
        return Promise.reject(err);
      }
    }

    if (shouldRedirectOn401(err, original)) {
      redirectToLogin();
    }
    return Promise.reject(err);
  },
);

export default api;
