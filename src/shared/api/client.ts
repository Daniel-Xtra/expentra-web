import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  handleSuspendedAuthFailure,
  isAccountSuspendedError,
  redirectToSuspendedAccount,
  shouldBlockSuspendedApiRequests,
  shouldSkipSuspendedAuthBootstrap,
} from '@/shared/api/auth-errors';
import type { ApiResponse } from '@/types/api';
import { deepCamelCaseKeys } from '@/shared/api/transform';

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';
const REFRESH_LEAD_TIME_MS = 60_000;
const AUTH_CHANNEL_NAME = 'expentra-auth';
const REFRESH_LOCK_KEY = 'expentra:refresh-lock';
const REFRESH_LOCK_TTL_MS = 15_000;
const REFRESH_RESULT_KEY = 'expentra:refresh-result';

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let sessionVersion = 0;
const sessionVersionListeners = new Set<() => void>();

type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

type AuthChannelMessage =
  | { type: 'token-refreshed'; accessToken: string }
  | { type: 'session-expired' };

function getAuthChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }
  return new BroadcastChannel(AUTH_CHANNEL_NAME);
}

function bumpSessionVersion(): void {
  sessionVersion += 1;
  for (const listener of sessionVersionListeners) {
    listener();
  }
}

export function getSessionVersion(): number {
  return sessionVersion;
}

export function onSessionVersionChange(listener: () => void): () => void {
  sessionVersionListeners.add(listener);
  return () => sessionVersionListeners.delete(listener);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function isAccessTokenExpired(token: string | null = accessToken): boolean {
  if (!token) {
    return true;
  }

  const expiresAt = getTokenExpiryMs(token);
  if (!expiresAt) {
    return false;
  }

  return expiresAt <= Date.now() + REFRESH_LEAD_TIME_MS;
}

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

function notifySessionExpired(): void {
  clearProactiveRefresh();
  setAccessToken(null);
  for (const listener of sessionExpiredListeners) {
    listener();
  }
  getAuthChannel()?.postMessage({ type: 'session-expired' } satisfies AuthChannelMessage);
}

function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function clearProactiveRefresh(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function scheduleProactiveRefresh(token: string): void {
  clearProactiveRefresh();

  const expiresAt = getTokenExpiryMs(token);
  if (!expiresAt) {
    return;
  }

  const refreshIn = expiresAt - Date.now() - REFRESH_LEAD_TIME_MS;
  if (refreshIn <= 0) {
    void refreshAccessToken();
    return;
  }

  refreshTimer = setTimeout(() => {
    void refreshAccessToken();
  }, refreshIn);
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  bumpSessionVersion();
  if (token) {
    scheduleProactiveRefresh(token);
  } else {
    clearProactiveRefresh();
  }
}

export function setSessionTokens(tokens: { accessToken: string }): void {
  setAccessToken(tokens.accessToken);
}

function isAuthBypassRequest(url?: string): boolean {
  return Boolean(
    url?.includes('/auth/sign-in') ||
      url?.includes('/auth/sign-up') ||
      url?.includes('/auth/sign-out') ||
      url?.includes('/auth/tokens/refresh') ||
      url?.includes('/auth/sso/exchange') ||
      url?.includes('/auth/sso/status'),
  );
}

function readRefreshLock(): { tabId: string; until: number } | null {
  try {
    const raw = localStorage.getItem(REFRESH_LOCK_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as { tabId: string; until: number };
  } catch {
    return null;
  }
}

function writeRefreshLock(tabId: string): void {
  localStorage.setItem(
    REFRESH_LOCK_KEY,
    JSON.stringify({ tabId, until: Date.now() + REFRESH_LOCK_TTL_MS }),
  );
}

function clearRefreshLock(tabId: string): void {
  const lock = readRefreshLock();
  if (lock?.tabId === tabId) {
    localStorage.removeItem(REFRESH_LOCK_KEY);
  }
}

const tabId =
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `tab-${Date.now()}`;

if (typeof window !== 'undefined') {
  const channel = getAuthChannel();
  channel?.addEventListener('message', (event: MessageEvent<AuthChannelMessage>) => {
    if (event.data?.type === 'token-refreshed' && event.data.accessToken) {
      setAccessToken(event.data.accessToken);
    }
    if (event.data?.type === 'session-expired') {
      clearProactiveRefresh();
      accessToken = null;
      bumpSessionVersion();
      for (const listener of sessionExpiredListeners) {
        listener();
      }
    }
  });
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (shouldBlockSuspendedApiRequests()) {
    return Promise.reject(new axios.CanceledError('Account suspended'));
  }

  if (!isAuthBypassRequest(config.url) && isAccessTokenExpired(accessToken)) {
    await refreshAccessToken();
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

export async function refreshAccessToken(): Promise<string | null> {
  if (shouldSkipSuspendedAuthBootstrap()) {
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  const activeLock = readRefreshLock();
  if (activeLock && activeLock.tabId !== tabId) {
    // Foreign/stale lock (common after a reload mid-refresh). Do not block
    // bootstrap for the full TTL — the API allows a short reuse grace window.
    localStorage.removeItem(REFRESH_LOCK_KEY);
  } else if (activeLock && activeLock.until <= Date.now()) {
    localStorage.removeItem(REFRESH_LOCK_KEY);
  }

  refreshPromise = (async () => {
    const hadActiveSession = Boolean(accessToken);
    writeRefreshLock(tabId);
    try {
      const { data } = await api.post<ApiResponse<{ accessToken: string }>>(
        '/auth/tokens/refresh',
        {},
      );

      const token = data.data?.accessToken ?? null;
      if (!token) {
        localStorage.setItem(
          REFRESH_RESULT_KEY,
          JSON.stringify({ tabId, accessToken: null }),
        );
        notifySessionExpired();
        return null;
      }

      setAccessToken(token);
      localStorage.setItem(
        REFRESH_RESULT_KEY,
        JSON.stringify({ tabId, accessToken: token }),
      );
      getAuthChannel()?.postMessage({
        type: 'token-refreshed',
        accessToken: token,
      } satisfies AuthChannelMessage);
      return token;
    } catch (error) {
      localStorage.setItem(
        REFRESH_RESULT_KEY,
        JSON.stringify({ tabId, accessToken: null }),
      );
      if (isAccountSuspendedError(error)) {
        if (hadActiveSession) {
          redirectToSuspendedAccount();
        } else {
          notifySessionExpired();
        }
      } else {
        notifySessionExpired();
      }
      return null;
    } finally {
      clearRefreshLock(tabId);
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function normalizeErrorPayload(error: AxiosError): void {
  const contentType = String(error.response?.headers['content-type'] ?? '');
  const isJson =
    !contentType ||
    contentType.includes('application/json') ||
    contentType.includes('+json');

  if (
    isJson &&
    error.response?.data &&
    typeof error.response.data === 'object'
  ) {
    error.response.data = deepCamelCaseKeys(error.response.data);
  }
}

api.interceptors.response.use(
  (response) => {
    const contentType = String(response.headers['content-type'] ?? '');
    const isJson =
      !contentType || contentType.includes('application/json') || contentType.includes('+json');

    if (isJson && response.data && typeof response.data === 'object') {
      response.data = deepCamelCaseKeys(response.data);
    }

    return response;
  },
  async (error: AxiosError) => {
    normalizeErrorPayload(error);

    if (isAccountSuspendedError(error)) {
      const hadActiveSession = Boolean(accessToken);
      setAccessToken(null);
      handleSuspendedAuthFailure(hadActiveSession);
      return Promise.reject(error);
    }

    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthBypassRequest(original.url)
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    const token = await refreshAccessToken();
    if (!token) {
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  },
);

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (
      document.visibilityState === 'visible' &&
      !shouldSkipSuspendedAuthBootstrap() &&
      isAccessTokenExpired()
    ) {
      void refreshAccessToken();
    }
  });
}

export { getApiErrorMessage, isServerUnavailableError } from '@/shared/api/api-errors';
