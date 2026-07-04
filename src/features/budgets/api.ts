import { api } from '@/shared/api/client';
import { queueExport } from '@/shared/api/export';
import type {
  ApiResponse,
  BudgetByDepartmentRow,
  BudgetForecastResponse,
  BudgetHealthCounts,
  BudgetHealthFilter,
  BudgetListSortField,
  BudgetListSortOrder,
  BudgetResponse,
  BudgetSummaryResponse,
  OrganizationBudgetSummaryResponse,
  PaginatedResult,
} from '@/types/api';

export type ListBudgetsParams = {
  page?: number;
  limit?: number;
  year?: number;
  departmentReference?: string;
  sortBy?: BudgetListSortField;
  sortOrder?: BudgetListSortOrder;
  healthFilter?: BudgetHealthFilter;
};

export type CreateBudgetInput = {
  departmentReference: string;
  year: number;
  amountLimit: number;
  currency?: string;
};

export type UpdateBudgetInput = {
  amountLimit?: number;
  currency?: string;
  isActive?: boolean;
};

export async function listBudgets(
  params: ListBudgetsParams = {},
): Promise<PaginatedResult<BudgetResponse>> {
  const { data } = await api.get<ApiResponse<BudgetResponse[]>>('/budgets', { params });
  return { items: data.data ?? [], meta: data.meta };
}

export async function fetchOrganizationBudgetSummary(
  year: number,
): Promise<OrganizationBudgetSummaryResponse> {
  const { data } = await api.get<ApiResponse<OrganizationBudgetSummaryResponse>>(
    '/budgets/organization/summary',
    { params: { year } },
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load organization budget summary');
  }
  return data.data;
}

export async function fetchBudgetHealthCounts(year: number): Promise<BudgetHealthCounts> {
  const { data } = await api.get<ApiResponse<BudgetHealthCounts>>('/budgets/status-counts', {
    params: { year },
  });
  if (!data.data) {
    throw new Error(data.message || 'Failed to load budget health counts');
  }
  return data.data;
}

export async function fetchCommittedByDepartment(
  year: number,
): Promise<BudgetByDepartmentRow[]> {
  const { data } = await api.get<ApiResponse<BudgetByDepartmentRow[]>>(
    '/budgets/organization/by-department',
    { params: { year } },
  );
  return data.data ?? [];
}

export async function fetchOrganizationBudgetForecast(
  year: number,
): Promise<BudgetForecastResponse> {
  const { data } = await api.get<ApiResponse<BudgetForecastResponse>>(
    '/budgets/organization/forecast',
    { params: { year } },
  );
  return data.data ?? { hasBudget: false };
}

export async function exportBudgets(params: ListBudgetsParams = {}): Promise<string> {
  const result = await queueExport('/budgets/export', params);
  return result.message;
}

export async function getBudget(reference: string): Promise<BudgetResponse> {
  const { data } = await api.get<ApiResponse<BudgetResponse>>(`/budgets/${reference}`);
  if (!data.data) {
    throw new Error(data.message || 'Budget not found');
  }
  return data.data;
}

export async function createBudget(input: CreateBudgetInput): Promise<BudgetResponse> {
  const { data } = await api.post<ApiResponse<BudgetResponse>>('/budgets', input);
  if (!data.data) {
    throw new Error(data.message || 'Failed to create budget');
  }
  return data.data;
}

export async function updateBudget(
  reference: string,
  input: UpdateBudgetInput,
): Promise<BudgetResponse> {
  const { data } = await api.patch<ApiResponse<BudgetResponse>>(`/budgets/${reference}`, input);
  if (!data.data) {
    throw new Error(data.message || 'Failed to update budget');
  }
  return data.data;
}

export async function fetchMyBudgetSummary(year?: number): Promise<BudgetSummaryResponse> {
  const { data } = await api.get<ApiResponse<BudgetSummaryResponse>>('/budgets/me/summary', {
    params: year ? { year } : undefined,
  });
  if (!data.data) {
    throw new Error(data.message || 'Failed to load budget summary');
  }
  return data.data;
}

export async function fetchMyBudgetForecast(year?: number): Promise<BudgetForecastResponse> {
  const { data } = await api.get<ApiResponse<BudgetForecastResponse>>('/budgets/me/forecast', {
    params: year ? { year } : undefined,
  });
  return data.data ?? { hasBudget: false };
}
