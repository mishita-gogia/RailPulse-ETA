import { Navigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { token, role, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-slate-900" />;
  if (!token || !role) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'passenger' ? '/passenger' : '/'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
