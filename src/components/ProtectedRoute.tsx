import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

export function ProtectedRoute({ role, children }: { role?: UserRole | UserRole[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) {
      return <Navigate to={`/${user.role}/dashboard`} replace />;
    }
  }
  return <>{children}</>;
}
