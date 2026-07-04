import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api';
import { deepCamelCaseKeys } from '@/shared/api/transform';

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';
const REFRESH_LEAD_TIME_MS = 60_000;
const AUTH_CHANNEL_NAME = 'expentra-auth';
const REFRESH_LOCK_KEY = 'expentra:refresh-lock';
const REFRESH_LOCK_TTL_MS = 15_000;
const REFRESH_RESULT_KEY = 'expentra:refresh-result';

// Remove legacy tokens from sessionStorage (refresh is httpOnly cookie only).
sessionStorage.removeItem('expentra_access_token');
sessionStorage.removeItem('expentra_refresh_token');

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
      url?.includes('/auth/tokens/refresh'),
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

function waitForCrossTabRefresh(tabId: string): Promise<string | null> {
  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener('storage', onStorage);
      resolve(null);
    }, REFRESH_LOCK_TTL_MS);

    function onStorage(event: StorageEvent): void {
      if (event.key !== REFRESH_RESULT_KEY || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as {
          tabId: string;
          accessToken: string | null;
        };
        if (payload.tabId === tabId) {
          return;
        }
        window.clearTimeout(timeout);
        window.removeEventListener('storage', onStorage);
        if (payload.accessToken) {
          setAccessToken(payload.accessToken);
          resolve(payload.accessToken);
        } else {
          resolve(null);
        }
      } catch {
        window.clearTimeout(timeout);
        window.removeEventListener('storage', onStorage);
        resolve(null);
      }
    }

    window.addEventListener('storage', onStorage);
  });
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
  if (refreshPromise) {
    return refreshPromise;
  }

  const activeLock = readRefreshLock();
  if (activeLock && activeLock.until > Date.now() && activeLock.tabId !== tabId) {
    return waitForCrossTabRefresh(tabId);
  }

  refreshPromise = (async () => {
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
    } catch {
      localStorage.setItem(
        REFRESH_RESULT_KEY,
        JSON.stringify({ tabId, accessToken: null }),
      );
      notifySessionExpired();
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
    if (document.visibilityState === 'visible' && isAccessTokenExpired()) {
      void refreshAccessToken();
    }
  });
}

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'We could not process that request. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested item could not be found.',
  408: 'The request took too long. Please try again.',
  409: 'Something changed while you were working. Refresh the page and try again.',
  422: 'We could not process that request. Please check your input and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again.',
  502: 'The server is temporarily unavailable. Please try again in a moment.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
  504: 'The server took too long to respond. Please try again.',
};

function isTechnicalClientMessage(message: string): boolean {
  const trimmed = message.trim();
  return (
    /^Request failed with status code \d+$/i.test(trimmed) ||
    trimmed === 'Network Error' ||
    /^timeout of \d+ms exceeded$/i.test(trimmed) ||
    trimmed === 'ERR_NETWORK' ||
    trimmed === 'Failed to fetch'
  );
}

function messageForHttpStatus(status: number): string | undefined {
  if (HTTP_STATUS_MESSAGES[status]) {
    return HTTP_STATUS_MESSAGES[status];
  }
  if (status >= 500) {
    return HTTP_STATUS_MESSAGES[500];
  }
  if (status >= 400) {
    return 'We could not complete that request. Please try again.';
  }
  return undefined;
}

export function isServerUnavailableError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  if (status !== undefined) {
    return status >= 500;
  }

  return true;
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload = error.response?.data as ApiResponse<unknown> | undefined;
    const apiMessage =
      typeof payload?.message === 'string' ? payload.message.trim() : '';

    if (status === 429) {
      return apiMessage || HTTP_STATUS_MESSAGES[429]!;
    }

    if (apiMessage && !isTechnicalClientMessage(apiMessage)) {
      return apiMessage;
    }

    if (status !== undefined) {
      const statusMessage = messageForHttpStatus(status);
      if (statusMessage) {
        return statusMessage;
      }
    }

    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
        return HTTP_STATUS_MESSAGES[504]!;
      }
      return 'Unable to reach the server. Check your connection and try again.';
    }

    if (isTechnicalClientMessage(error.message)) {
      return fallback;
    }

    return error.message;
  }

  if (error instanceof Error) {
    if (isTechnicalClientMessage(error.message)) {
      return fallback;
    }
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    if (isTechnicalClientMessage(error)) {
      return fallback;
    }
    return error;
  }

  return fallback;
}
