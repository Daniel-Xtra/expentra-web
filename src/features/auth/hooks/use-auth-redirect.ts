import { useLocation } from 'react-router-dom';
import { getDefaultNavPath } from '@/shared/navigation';
import { useAuth } from './use-auth';

function isPublicAuthEntry(pathname: string) {
  return pathname === '/' || pathname === '/login';
}

export function useAuthRedirectTarget(): string | null {
  const { isAuthenticated, isLoading, user, authorization } = useAuth();
  const location = useLocation();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (user && !user.isActive) {
    return '/account-suspended';
  }

  if (user && !user.isEmailVerified) {
    return '/verify-email';
  }

  // Wait for authorization so we never send signed-in users back to the login route.
  if (!authorization) {
    return null;
  }

  const fromPath = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
  if (fromPath && !isPublicAuthEntry(fromPath)) {
    return fromPath;
  }

  return getDefaultNavPath(authorization);
}
