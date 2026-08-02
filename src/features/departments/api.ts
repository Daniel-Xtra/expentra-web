import { api } from '@/shared/api/client';
import { queueExport } from '@/shared/api/export';
import type {
  ApiResponse,
  BudgetForecastResponse,
  BudgetSummaryResponse,
  DepartmentDetailSummary,
  DepartmentHealthFilter,
  DepartmentListSortField,
  DepartmentManagerHistoryResponse,
  DepartmentResponse,
  PaginatedResult,
  TeamDashboard,
  UserResponse,
} from '@/types/api';

export type ListDepartmentUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type ListDepartmentManagerHistoryParams = {
  page?: number;
  limit?: number;
};

export type ListDepartmentsParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  missingManager?: boolean;
  year?: number;
  sortBy?: DepartmentListSortField;
  sortOrder?: 'ASC' | 'DESC';
  healthFilter?: DepartmentHealthFilter;
};

export type CreateDepartmentInput = {
  name: string;
  code: string;
  isActive?: boolean;
  managerReference?: string;
};

export type UpdateDepartmentInput = {
  name?: string;
  code?: string;
  isActive?: boolean;
  managerReference?: string | null;
};

export async function listDepartments(
  params: ListDepartmentsParams = {},
): Promise<PaginatedResult<DepartmentResponse>> {
  const { data } = await api.get<ApiResponse<DepartmentResponse[]>>('/departments', {
    params,
  });
  return { items: data.data ?? [], meta: data.meta };
}

export async function exportDepartments(params: ListDepartmentsParams = {}): Promise<string> {
  return queueExport('/departments/export', params);
}

export async function fetchDepartmentDetailSummary(
  reference: string,
): Promise<DepartmentDetailSummary> {
  const { data } = await api.get<ApiResponse<DepartmentDetailSummary>>(
    `/departments/${reference}/summary`,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load department summary');
  }
  return data.data;
}

export async function getDepartment(reference: string): Promise<DepartmentResponse> {
  const { data } = await api.get<ApiResponse<DepartmentResponse>>(`/departments/${reference}`);
  if (!data.data) {
    throw new Error(data.message || 'Department not found');
  }
  return data.data;
}

export async function createDepartment(
  input: CreateDepartmentInput,
): Promise<DepartmentResponse> {
  const { data } = await api.post<ApiResponse<DepartmentResponse>>('/departments', input);
  if (!data.data) {
    throw new Error(data.message || 'Failed to create department');
  }
  return data.data;
}

export async function updateDepartment(
  reference: string,
  input: UpdateDepartmentInput,
): Promise<DepartmentResponse> {
  const { data } = await api.patch<ApiResponse<DepartmentResponse>>(
    `/departments/${reference}`,
    input,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to update department');
  }
  return data.data;
}

export async function deleteDepartment(reference: string): Promise<void> {
  await api.delete(`/departments/${reference}`);
}

export async function listDepartmentManagerHistory(
  reference: string,
  params: ListDepartmentManagerHistoryParams = {},
): Promise<PaginatedResult<DepartmentManagerHistoryResponse>> {
  const { data } = await api.get<ApiResponse<DepartmentManagerHistoryResponse[]>>(
    `/departments/${reference}/manager-history`,
    { params },
  );
  return { items: data.data ?? [], meta: data.meta };
}

export async function listDepartmentUsers(
  reference: string,
  params: ListDepartmentUsersParams = {},
): Promise<PaginatedResult<UserResponse>> {
  const { data } = await api.get<ApiResponse<UserResponse[]>>(
    `/departments/${reference}/users`,
    { params },
  );
  return { items: data.data ?? [], meta: data.meta };
}

export async function fetchManagedDepartmentDetailSummary(
  reference: string,
): Promise<DepartmentDetailSummary> {
  const { data } = await api.get<ApiResponse<DepartmentDetailSummary>>(
    `/departments/managed/${reference}/summary`,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load department summary');
  }
  return data.data;
}

export async function fetchDepartmentBudgetSummary(
  reference: string,
  year?: number,
): Promise<BudgetSummaryResponse> {
  const { data } = await api.get<ApiResponse<BudgetSummaryResponse>>(
    `/departments/${reference}/budget-summary`,
    { params: year ? { year } : undefined },
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load budget summary');
  }
  return data.data;
}

export async function listManagedDepartments(): Promise<DepartmentResponse[]> {
  const { data } = await api.get<ApiResponse<DepartmentResponse[]>>('/departments/managed');
  return data.data ?? [];
}

export async function getManagedDepartment(reference: string): Promise<DepartmentResponse> {
  const { data } = await api.get<ApiResponse<DepartmentResponse>>(
    `/departments/managed/${reference}`,
  );
  if (!data.data) {
    throw new Error(data.message || 'Department not found');
  }
  return data.data;
}

export async function listManagedDepartmentManagerHistory(
  reference: string,
  params: ListDepartmentManagerHistoryParams = {},
): Promise<PaginatedResult<DepartmentManagerHistoryResponse>> {
  const { data } = await api.get<ApiResponse<DepartmentManagerHistoryResponse[]>>(
    `/departments/managed/${reference}/manager-history`,
    { params },
  );
  return { items: data.data ?? [], meta: data.meta };
}

export async function listManagedDepartmentUsers(
  reference: string,
  params: ListDepartmentUsersParams = {},
): Promise<PaginatedResult<UserResponse>> {
  const { data } = await api.get<ApiResponse<UserResponse[]>>(
    `/departments/managed/${reference}/users`,
    { params },
  );
  return { items: data.data ?? [], meta: data.meta };
}

export async function fetchManagedDepartmentBudgetSummary(
  reference: string,
  year?: number,
): Promise<BudgetSummaryResponse> {
  const { data } = await api.get<ApiResponse<BudgetSummaryResponse>>(
    `/departments/managed/${reference}/budget-summary`,
    { params: year ? { year } : undefined },
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load budget summary');
  }
  return data.data;
}

export async function fetchDepartmentBudgetForecast(
  reference: string,
  year?: number,
): Promise<BudgetForecastResponse> {
  const { data } = await api.get<ApiResponse<BudgetForecastResponse>>(
    `/departments/${reference}/budget-forecast`,
    { params: year ? { year } : undefined },
  );
  return data.data ?? { hasBudget: false };
}

export async function fetchManagedDepartmentBudgetForecast(
  reference: string,
  year?: number,
): Promise<BudgetForecastResponse> {
  const { data } = await api.get<ApiResponse<BudgetForecastResponse>>(
    `/departments/managed/${reference}/budget-forecast`,
    { params: year ? { year } : undefined },
  );
  return data.data ?? { hasBudget: false };
}

export async function fetchDepartmentTeamDashboard(
  reference: string,
  params: { year?: number } = {},
): Promise<TeamDashboard> {
  const { data } = await api.get<ApiResponse<TeamDashboard>>(
    `/departments/${reference}/team-dashboard`,
    { params },
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load team overview');
  }
  return data.data;
}

export async function fetchManagedDepartmentTeamDashboard(
  reference: string,
  params: { year?: number } = {},
): Promise<TeamDashboard> {
  const { data } = await api.get<ApiResponse<TeamDashboard>>(
    `/departments/managed/${reference}/team-dashboard`,
    { params },
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load team overview');
  }
  return data.data;
}
