import axios, { type AxiosError } from 'axios';

const LEGACY_ACCOUNT_SUSPENDED_STORAGE_KEY = 'expentra_account_suspended';
const ACCOUNT_SUSPENDED_EVENT = 'expentra:account-suspended';
const ACCOUNT_SUSPENDED_CLEARED_EVENT = 'expentra:account-suspended-cleared';

export class AccountSuspendedError extends Error {
  constructor(message = 'Account has been suspended, please contact support.') {
    super(message);
    this.name = 'AccountSuspendedError';
  }
}

let accountSuspensionActive = false;

if (typeof window !== 'undefined') {
  sessionStorage.removeItem(LEGACY_ACCOUNT_SUSPENDED_STORAGE_KEY);
}

function getAxiosErrorMessage(error: AxiosError): string {
  const payload = error.response?.data as { message?: string } | undefined;
  return typeof payload?.message === 'string' ? payload.message : '';
}

export function isAccountSuspendedMessage(message: string | null | undefined): boolean {
  return typeof message === 'string' && message.toLowerCase().includes('suspended');
}

export function isAccountSuspendedError(error: unknown): boolean {
  if (error instanceof AccountSuspendedError) {
    return true;
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  if (status !== 403 && status !== 401) {
    return false;
  }

  return isAccountSuspendedMessage(getAxiosErrorMessage(error));
}

export function isAccountSuspensionActive(): boolean {
  return accountSuspensionActive;
}

export function isOnSuspendedAccountPage(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/account-suspended')
  );
}

export function shouldSkipSuspendedAuthBootstrap(): boolean {
  return isAccountSuspensionActive() || isOnSuspendedAccountPage();
}

export function shouldBlockSuspendedApiRequests(): boolean {
  return isAccountSuspensionActive();
}

export function markAccountSuspended(): void {
  accountSuspensionActive = true;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ACCOUNT_SUSPENDED_EVENT));
  }
}

export function onAccountSuspended(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(ACCOUNT_SUSPENDED_EVENT, listener);
  return () => window.removeEventListener(ACCOUNT_SUSPENDED_EVENT, listener);
}

export function clearAccountSuspended(): void {
  accountSuspensionActive = false;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ACCOUNT_SUSPENDED_CLEARED_EVENT));
  }
}

export function onAccountSuspendedCleared(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(ACCOUNT_SUSPENDED_CLEARED_EVENT, listener);
  return () => window.removeEventListener(ACCOUNT_SUSPENDED_CLEARED_EVENT, listener);
}

export function redirectToSuspendedAccount(): void {
  markAccountSuspended();
}

export function handleSuspendedAuthFailure(hadActiveSession: boolean): void {
  if (hadActiveSession) {
    redirectToSuspendedAccount();
  }
}
