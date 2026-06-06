import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../contexts/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
