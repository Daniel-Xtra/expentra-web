import { api } from '@/shared/api/client';
import { queueExport } from '@/shared/api/export';
import type {
  ApiResponse,
  ApprovalLevelImpactSummary,
  ApprovalLevelResponse,
  ApprovalLevelWorkflowHealth,
  PaginatedResult,
} from '@/types/api';

export type ApprovalApproverType = 'department_manager' | 'finance_manager';

export type ListApprovalLevelsParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  approverType?: ApprovalApproverType;
  roleReference?: string;
};

export type CreateApprovalLevelInput = {
  approverType: ApprovalApproverType;
  roleReference?: string;
  name: string;
  level: number;
  minimumAmount?: number;
  maximumAmount?: number | null;
  isActive?: boolean;
  description?: string | null;
};

export type UpdateApprovalLevelInput = Partial<CreateApprovalLevelInput>;

export async function listApprovalLevels(
  params: ListApprovalLevelsParams = {},
): Promise<PaginatedResult<ApprovalLevelResponse>> {
  const { data } = await api.get<ApiResponse<ApprovalLevelResponse[]>>('/approval-levels', {
    params,
  });
  return { items: data.data ?? [], meta: data.meta };
}

export async function fetchApprovalLevelWorkflowHealth(): Promise<ApprovalLevelWorkflowHealth> {
  const { data } = await api.get<ApiResponse<ApprovalLevelWorkflowHealth>>(
    '/approval-levels/workflow-health',
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load approval workflow health');
  }
  return data.data;
}

export async function fetchApprovalLevelImpact(
  reference: string,
): Promise<ApprovalLevelImpactSummary> {
  const { data } = await api.get<ApiResponse<ApprovalLevelImpactSummary>>(
    `/approval-levels/${reference}/impact`,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load approval level impact');
  }
  return data.data;
}

export async function exportApprovalLevels(
  params: ListApprovalLevelsParams = {},
): Promise<string> {
  return queueExport('/approval-levels/export', params);
}

export async function createApprovalLevel(
  input: CreateApprovalLevelInput,
): Promise<ApprovalLevelResponse> {
  const { data } = await api.post<ApiResponse<ApprovalLevelResponse>>('/approval-levels', input);
  if (!data.data) {
    throw new Error(data.message || 'Failed to create approval level');
  }
  return data.data;
}

export async function updateApprovalLevel(
  reference: string,
  input: UpdateApprovalLevelInput,
): Promise<ApprovalLevelResponse> {
  const { data } = await api.patch<ApiResponse<ApprovalLevelResponse>>(
    `/approval-levels/${reference}`,
    input,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to update approval level');
  }
  return data.data;
}

export async function deleteApprovalLevel(reference: string): Promise<void> {
  await api.delete(`/approval-levels/${reference}`);
}
