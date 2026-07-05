import { useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { filterNavSections } from '@/shared/navigation';

export function useVisibleNavSections() {
  const { authorization, isLoading, isAuthenticated } = useAuth();

  const isAuthorizationPending =
    isLoading || (isAuthenticated && authorization === null);

  const sections = useMemo(() => {
    if (isAuthorizationPending || !authorization) {
      return [];
    }

    return filterNavSections(authorization);
  }, [authorization, isAuthorizationPending]);

  return {
    sections,
    isAuthorizationPending,
    capabilities: authorization?.capabilities ?? [],
  };
}
