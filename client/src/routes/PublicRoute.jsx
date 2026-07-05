import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../components/ui/Spinner';

const PublicRoute = () => {
  const { user, authChecked } = useSelector((s) => s.auth);

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-votora-bg"><Spinner size="lg" /></div>;
  }
  if (user) {
    return <Navigate to={user.onboardingCompleted ? '/dashboard' : '/onboarding'} replace />;
  }
  return <Outlet />;
};

export default PublicRoute;
