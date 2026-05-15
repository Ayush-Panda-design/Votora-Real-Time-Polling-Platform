import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';


const PublicRoute = () => {
  const { token, user } = useSelector((s) => s.auth);
  if (token && user) {
    return <Navigate to={user.onboardingCompleted ? '/dashboard' : '/onboarding'} replace />;
  }
  return <Outlet />;
};

export default PublicRoute;
