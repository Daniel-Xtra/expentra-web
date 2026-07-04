import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/use-auth';
import { canAccess } from '@/shared/lib/capabilities';

type CapabilityGateProps = {
  capability: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function CapabilityGate({ capability, children, fallback = null }: CapabilityGateProps) {
  const { authorization } = useAuth();

  if (!canAccess(authorization?.capabilities, capability)) {
    return fallback;
  }

  return children;
}
