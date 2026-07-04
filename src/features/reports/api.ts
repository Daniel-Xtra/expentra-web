import { api } from '@/shared/api/client';
import { queueExport } from '@/shared/api/export';
import type {
  ApiResponse,
  SpendingCategoryRow,
  SpendingDepartmentRow,
  SpendingSummaryReport,
  YearlyMonthlySpendingReport,
} from '@/types/api';

export type SpendingReportQuery = {
  year: number;
  month: number;
  departmentReference?: string;
  category?: string;
  includePipeline?: boolean;
};

export async function fetchSpendingSummary(
  query: SpendingReportQuery,
): Promise<SpendingSummaryReport> {
  const { data } = await api.get<ApiResponse<SpendingSummaryReport>>('/reports/spending/summary', {
    params: query,
  });
  if (!data.data) {
    throw new Error(data.message || 'Failed to load report');
  }
  return data.data;
}

export type YearlySpendingQuery = {
  year: number;
  departmentReference?: string;
  category?: string;
  includePipeline?: boolean;
};

export async function fetchSpendingByMonth(
  query: YearlySpendingQuery,
): Promise<YearlyMonthlySpendingReport> {
  const { data } = await api.get<ApiResponse<YearlyMonthlySpendingReport>>(
    '/reports/spending/monthly',
    { params: query },
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load monthly spending');
  }
  return data.data;
}

export async function fetchSpendingByCategory(
  query: SpendingReportQuery,
): Promise<SpendingCategoryRow[]> {
  const { data } = await api.get<ApiResponse<SpendingCategoryRow[]>>(
    '/reports/spending/by-category',
    { params: query },
  );
  return data.data ?? [];
}

export async function fetchSpendingByDepartment(
  query: SpendingReportQuery,
): Promise<SpendingDepartmentRow[]> {
  const { data } = await api.get<ApiResponse<SpendingDepartmentRow[]>>(
    '/reports/spending/by-department',
    { params: query },
  );
  return data.data ?? [];
}

export async function queueSpendingExcelExport(query: SpendingReportQuery): Promise<string> {
  const result = await queueExport('/reports/spending/export/excel', query);
  return result.message;
}

export async function queueSpendingPdfExport(query: SpendingReportQuery): Promise<string> {
  const result = await queueExport('/reports/spending/export/pdf', query);
  return result.message;
}
