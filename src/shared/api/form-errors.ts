import axios from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { ApiResponse } from '@/types/api';
import { getApiErrorMessage } from '@/shared/api/client';
import { toast } from 'sonner';

type ApiFieldError = {
  field: string;
  message: string;
};

function getApiFieldErrors(error: unknown): ApiFieldError[] {
  if (!axios.isAxiosError(error)) {
    return [];
  }

  const payload = error.response?.data as ApiResponse<unknown> | undefined;
  if (!payload?.errors?.length) {
    return [];
  }

  return payload.errors
    .filter(
      (entry): entry is ApiFieldError =>
        typeof entry?.field === 'string' && typeof entry?.message === 'string',
    )
    .map((entry) => ({
      field: entry.field,
      message: entry.message,
    }));
}

function applyApiFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  const errors = getApiFieldErrors(error);
  if (errors.length === 0) {
    return false;
  }

  for (const { field, message } of errors) {
    setError(field as Path<T>, { type: 'server', message });
  }

  return true;
}

/** Apply server field errors when a form is available; otherwise show a toast. */
export function handleMutationError<T extends FieldValues>(
  error: unknown,
  options?: {
    setError?: UseFormSetError<T>;
    fallback?: string;
  },
): void {
  if (options?.setError && applyApiFieldErrors(error, options.setError)) {
    return;
  }

  toast.error(getApiErrorMessage(error, options?.fallback ?? 'Something went wrong'));
}
