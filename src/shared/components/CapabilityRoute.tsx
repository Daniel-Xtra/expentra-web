import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { canAccessRoute } from '@/shared/navigation';
import type { NavAccess } from '@/shared/navigation';
import { LoadingState } from './LoadingState';

type CapabilityRouteProps = {
  capabilities?: NavAccess;
  requiresManagedDepartment?: boolean;
  fallback?: string;
};

export function CapabilityRoute({
  capabilities,
  requiresManagedDepartment,
  fallback = '/expenses',
}: CapabilityRouteProps) {
  const { authorization, isLoading, isAuthenticated } = useAuth();

  if (!capabilities) {
    return <Outlet />;
  }

  if (isLoading || (isAuthenticated && !authorization)) {
    return <LoadingState message="Loading…" />;
  }

  if (
    !canAccessRoute(authorization, {
      capabilities,
      requiresManagedDepartment,
    })
  ) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
