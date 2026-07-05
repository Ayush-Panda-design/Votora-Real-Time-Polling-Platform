import axios from 'axios';
import { isAuthEndpoint, isPublicAppPath } from '../utils/authEndpoints';
import { getAccessToken, setAccessToken, clearAccessToken } from './authSession';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

const shouldHandle401 = (err, original) => {
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

    if (shouldHandle401(err, original) && !original?._retry) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh')
            .then((res) => {
              if (res.data?.accessToken) setAccessToken(res.data.accessToken);
              return res;
            })
            .finally(() => { refreshPromise = null; });
        }
        await refreshPromise;
        return api(original);
      } catch {
        clearAccessToken();
        // Do NOT use window.location.href — it wipes Redux and causes post-login loops
      }
    }

    return Promise.reject(err);
  },
);

export default api;
