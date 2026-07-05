/** Auth API paths that may return 401 without triggering a global login redirect. */
const AUTH_ENDPOINTS = [
  '/auth/me',
  '/auth/refresh',
  '/auth/login',
  '/auth/google',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/resend-verification',
  '/auth/verify-email',
  '/auth/logout',
];

export const isAuthEndpoint = (url = '') => AUTH_ENDPOINTS.some((path) => url.includes(path));

export const isPublicAppPath = (path) =>
  path === '/'
  || path.startsWith('/login')
  || path.startsWith('/signup')
  || path.startsWith('/onboarding')
  || path.startsWith('/forgot-password')
  || path.startsWith('/reset-password')
  || path.startsWith('/verify-email')
  || path.startsWith('/poll/');
