import { useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const IDLE_CHECK_INTERVAL_MS = 60_000;
const IDLE_LOGOUT_REASON_KEY = 'expentra_idle_logout';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;

export function getIdleLogoutMessage(): string | null {
  const message = sessionStorage.getItem(IDLE_LOGOUT_REASON_KEY);
  if (!message) {
    return null;
  }
  sessionStorage.removeItem(IDLE_LOGOUT_REASON_KEY);
  return message;
}

export function useIdleSessionTimeout() {
  const { isAuthenticated, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || isLoading) {
      return;
    }

    let lastActivityAt = Date.now();

    const markActivity = () => {
      lastActivityAt = Date.now();
    };

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, markActivity, { passive: true });
    }

    const intervalId = window.setInterval(() => {
      if (Date.now() - lastActivityAt < IDLE_TIMEOUT_MS) {
        return;
      }

      sessionStorage.setItem(
        IDLE_LOGOUT_REASON_KEY,
        'You were signed out after 30 minutes of inactivity.',
      );
      void signOut();
    }, IDLE_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, markActivity);
      }
    };
  }, [isAuthenticated, isLoading, signOut]);
}
