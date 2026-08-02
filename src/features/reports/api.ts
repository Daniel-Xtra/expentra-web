import { api } from '@/shared/api/client';
import { queueExport } from '@/shared/api/export';
import type {
  ApiResponse,
  SpendingCategoryRow,
  SpendingDepartmentRow,
  SpendingSummaryReport,
  YearlyMonthlySpendingReport,
} from '@/types/api';

import type { ReportPeriodMode, ReportSpendMode } from './types';

export type SpendingReportQuery = {
  year: number;
  periodMode?: ReportPeriodMode;
  month?: number;
  quarter?: number;
  departmentReference?: string;
  category?: string;
  includePipeline?: boolean;
  mode?: ReportSpendMode;
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
  mode?: ReportSpendMode;
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
  return queueExport('/reports/spending/export/excel', query);
}

export async function queueSpendingPdfExport(query: SpendingReportQuery): Promise<string> {
  return queueExport('/reports/spending/export/pdf', query);
}
