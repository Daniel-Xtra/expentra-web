import { toast } from 'sonner';
import { getApiErrorMessage } from '@/shared/api/client';

const DURATION = {
  success: 4000,
  successWithAction: 6000,
  error: 7000,
  info: 5000,
} as const;

export type ToastActionOptions = {
  action?: {
    label: string;
    onClick: () => void;
  };
};

function actionPayload(options?: ToastActionOptions) {
  if (!options?.action) {
    return undefined;
  }

  return {
    label: options.action.label,
    onClick: options.action.onClick,
  };
}

/** Prefer these helpers over raw `toast.*` so duration and styling stay consistent. */
export function toastSuccess(message: string, options?: ToastActionOptions) {
  const action = actionPayload(options);
  toast.success(message, {
    duration: action ? DURATION.successWithAction : DURATION.success,
    ...(action ? { action } : {}),
  });
}

export function toastError(
  error: unknown,
  fallback = 'Something went wrong',
  options?: ToastActionOptions,
) {
  const action = actionPayload(options);
  toast.error(getApiErrorMessage(error, fallback), {
    duration: DURATION.error,
    ...(action ? { action } : {}),
  });
}

export function toastInfo(message: string, options?: ToastActionOptions) {
  const action = actionPayload(options);
  toast.info(message, {
    duration: DURATION.info,
    ...(action ? { action } : {}),
  });
}
