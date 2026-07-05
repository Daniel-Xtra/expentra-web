import { toast } from 'sonner';
import { getApiErrorMessage } from '@/shared/api/client';

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(error: unknown, fallback = 'Something went wrong') {
  toast.error(getApiErrorMessage(error, fallback));
}
