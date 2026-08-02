import { api } from '@/shared/api/client';
import type { ApiResponse, AuditLogResponse, PaginatedResult } from '@/types/api';

export type ListAuditLogsParams = {
  page?: number;
  limit?: number;
  resourceReference?: string;
  action?: string;
  actorReference?: string;
  actorEmail?: string;
  from?: string;
  to?: string;
};

export async function listAuditLogs(
  params: ListAuditLogsParams = {},
): Promise<PaginatedResult<AuditLogResponse>> {
  const { data } = await api.get<ApiResponse<AuditLogResponse[]>>('/audit-logs', { params });
  return { items: data.data ?? [], meta: data.meta };
}

export async function listAuditLogsForResource(
  reference: string,
): Promise<AuditLogResponse[]> {
  const { data } = await api.get<ApiResponse<AuditLogResponse[]>>(
    `/audit-logs/resource/${reference}`,
  );
  return data.data ?? [];
}
