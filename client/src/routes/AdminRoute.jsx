import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../components/ui/Spinner';

/**
 * AdminRoute — only renders children if the current user has role === 'admin'.
 * Redirects to /dashboard for everyone else.
 */
const AdminRoute = () => {
  const { user, authChecked } = useSelector((s) => s.auth);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-votora-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
