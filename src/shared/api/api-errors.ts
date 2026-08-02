import axios from 'axios';
import type { ApiResponse } from '@/types/api';

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
