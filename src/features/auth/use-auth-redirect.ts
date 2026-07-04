import { useLocation } from 'react-router-dom';
import { useAuth } from './use-auth';

export function useAuthRedirectTarget(): string | null {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (user && !user.isEmailVerified) {
    return '/verify-email';
  }

  return (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';
}
