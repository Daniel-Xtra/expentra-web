import { api } from '@/shared/api/client';
import type { ApiResponse, ExportQueuedResult } from '@/types/api';

const DEFAULT_EXPORT_MESSAGE =
  'You will receive an email when the file is ready.';

export type ExportJobStatusResponse = ExportQueuedResult & {
  jobType?: string;
  fileName?: string | null;
  downloadUrl?: string | null;
  errorMessage?: string | null;
  completedAt?: string | null;
  createdAt?: string;
};

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

export async function fetchExportJob(reference: string): Promise<ExportJobStatusResponse> {
  const { data } = await api.get<ApiResponse<ExportJobStatusResponse>>(`/exports/${reference}`);
  if (!data.data) {
    throw new Error(data.message || 'Failed to load export job');
  }
  return data.data;
}

export async function listMyExportJobs(
  page = 1,
  limit = 20,
): Promise<{ items: ExportJobStatusResponse[]; meta?: ApiResponse<unknown>['meta'] }> {
  const { data } = await api.get<ApiResponse<ExportJobStatusResponse[]>>('/exports/me', {
    params: { page, limit },
  });
  return { items: data.data ?? [], meta: data.meta };
}
