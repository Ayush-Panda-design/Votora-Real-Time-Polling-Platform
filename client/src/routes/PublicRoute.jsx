import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../components/ui/Spinner';

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];

const PublicRoute = () => {
  const { user, authChecked } = useSelector((s) => s.auth);
  const { pathname } = useLocation();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Never block login/signup forms while /auth/me is loading
  if (!authChecked && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-votora-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return (
      <Navigate
        to={user.onboardingCompleted === true ? '/dashboard' : '/onboarding'}
        replace
      />
    );
  }

  return <Outlet />;
};

export default PublicRoute;
