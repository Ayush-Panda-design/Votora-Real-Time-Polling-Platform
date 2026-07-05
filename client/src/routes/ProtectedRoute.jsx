import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../components/ui/Spinner';
import { getAccessToken } from '../services/authSession';

const ProtectedRoute = ({ requireOnboarding = false }) => {
  const { user, authChecked } = useSelector((s) => s.auth);
  const hasToken = Boolean(getAccessToken());

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-votora-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  // Allow through if Redux has user OR we have a bearer token (cross-origin prod)
  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (!user && hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-votora-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  if (requireOnboarding && user?.onboardingCompleted !== true) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
