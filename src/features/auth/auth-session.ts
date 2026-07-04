import axios from 'axios';
import type { UserResponse } from '@/types/api';
import { getApiErrorMessage } from '@/shared/api/client';

const PENDING_USER_KEY = 'expentra_pending_user';
const LAST_VERIFY_RESEND_AT_KEY = 'expentra_last_verification_resend_at';
const RESEND_IN_FLIGHT_KEY = 'expentra_verification_resend_in_flight';
const RESEND_COOLDOWN_MS = 55_000;

export function persistPendingUser(user: UserResponse): void {
  sessionStorage.setItem(PENDING_USER_KEY, JSON.stringify(user));
}

export function loadPendingUser(): UserResponse | null {
  const raw = sessionStorage.getItem(PENDING_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserResponse;
  } catch {
    return null;
  }
}

export function clearPendingUser(): void {
  sessionStorage.removeItem(PENDING_USER_KEY);
}

export function isUserEmailVerified(
  user: Pick<UserResponse, 'isEmailVerified'> | null | undefined,
): boolean {
  return user?.isEmailVerified === true;
}

export function shouldAutoResendVerification(): boolean {
  if (sessionStorage.getItem(RESEND_IN_FLIGHT_KEY) === '1') {
    return false;
  }

  const last = Number(sessionStorage.getItem(LAST_VERIFY_RESEND_AT_KEY) || 0);
  if (!last) {
    return true;
  }
  return Date.now() - last >= RESEND_COOLDOWN_MS;
}

export function markVerificationResendInFlight(): boolean {
  if (sessionStorage.getItem(RESEND_IN_FLIGHT_KEY) === '1') {
    return false;
  }
  sessionStorage.setItem(RESEND_IN_FLIGHT_KEY, '1');
  return true;
}

export function clearVerificationResendInFlight(): void {
  sessionStorage.removeItem(RESEND_IN_FLIGHT_KEY);
}

export function recordVerificationResendAttempt(): void {
  sessionStorage.setItem(LAST_VERIFY_RESEND_AT_KEY, String(Date.now()));
}

export function isEmailVerificationRequiredError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 403) {
    return false;
  }

  return getApiErrorMessage(error).toLowerCase().includes('email must be verified');
}
