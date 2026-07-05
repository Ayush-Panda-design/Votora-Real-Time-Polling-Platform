import axios from 'axios';

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

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const isAuthCheck = original?.url?.includes('/auth/me');
    const isRefresh = original?.url?.includes('/auth/refresh');
    const path = window.location.pathname;
    const isPublicPage =
      path === '/' ||
      path.startsWith('/login') ||
      path.startsWith('/signup') ||
      path.startsWith('/forgot-password') ||
      path.startsWith('/reset-password') ||
      path.startsWith('/verify-email') ||
      path.startsWith('/poll/');

    if (
      err.response?.status === 401 &&
      !isAuthCheck &&
      !isRefresh &&
      !original?._retry &&
      !isPublicPage
    ) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh').finally(() => { refreshPromise = null; });
        }
        await refreshPromise;
        return api(original);
      } catch {
        window.location.href = '/login';
      }
    }

    if (err.response?.status === 401 && !isAuthCheck && !isPublicPage && !isRefresh) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
