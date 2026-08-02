import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/common';

const DEFAULT_EXPORT_MESSAGE =
  'You will receive an email with the file when it is ready.';

/** Queue an export; the file is emailed when ready (not downloaded in-browser). */
export async function queueExport(
  path: string,
  params?: Record<string, unknown>,
): Promise<string> {
  const { data } = await api.post<ApiResponse<unknown>>(path, {}, { params });
  return data.message?.trim() || DEFAULT_EXPORT_MESSAGE;
}
