import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getDefaultNavPath } from '@/shared/navigation';
import { LoadingState } from './LoadingState';

export function HomeRedirect() {
  const { authorization, isLoading, isAuthenticated } = useAuth();

  if (isLoading || (isAuthenticated && !authorization)) {
    return <LoadingState message="Loading…" />;
  }

  return <Navigate to={getDefaultNavPath(authorization)} replace />;
}
