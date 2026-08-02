import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { LoadingState } from './LoadingState';

export function ActiveAccountRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingState layout="auth" message="Signing you in…" />
      </div>
    );
  }

  if (user && !user.isActive) {
    return <Navigate to="/account-suspended" replace />;
  }

  return <Outlet />;
}
