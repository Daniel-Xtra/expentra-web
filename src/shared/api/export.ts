import { api } from '@/shared/api/client';
import type { ApiResponse, ExportQueuedResult } from '@/types/api';

const DEFAULT_EXPORT_MESSAGE =
  'You will receive an email when the file is ready.';

export async function queueExport(
  path: string,
  params?: Record<string, unknown>,
): Promise<ExportQueuedResult & { message: string }> {
  const { data } = await api.post<ApiResponse<ExportQueuedResult>>(path, {}, { params });

  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to queue export');
  }

  return {
    ...data.data,
    message: data.message || DEFAULT_EXPORT_MESSAGE,
  };
}
