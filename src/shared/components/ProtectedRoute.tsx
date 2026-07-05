import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { LoadingState } from './LoadingState';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingState layout="auth" message="Signing you in…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
