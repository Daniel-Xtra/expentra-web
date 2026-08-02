import { useIdleSessionTimeout } from '@/features/auth/hooks/use-idle-session-timeout';

export function IdleSessionGuard() {
  useIdleSessionTimeout();
  return null;
}
