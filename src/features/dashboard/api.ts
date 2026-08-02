import { api } from '@/shared/api/client';
import { queueExport } from '@/shared/api/export';
import type { ApiResponse, PersonalDashboard } from '@/types/api';

export type DashboardPeriodMode = 'year' | 'quarter' | 'month';

export type DashboardQuery = {
  year?: number;
  month?: number;
  quarter?: number;
};

export function buildDashboardQuery(
  year: string,
  mode: DashboardPeriodMode,
  month: string,
  quarter: string,
): DashboardQuery {
  const parsedYear = Number(year);
  if (mode === 'month') {
    return { year: parsedYear, month: Number(month) };
  }
  if (mode === 'quarter') {
    return { year: parsedYear, quarter: Number(quarter) };
  }
  return { year: parsedYear };
}

export async function fetchPersonalDashboard(query: DashboardQuery = {}) {
  const { data } = await api.get<ApiResponse<PersonalDashboard>>('/dashboard/personal', {
    params: query,
  });

  if (!data.data) {
    throw new Error(data.message || 'Failed to load dashboard');
  }

  return data.data;
}

export async function exportPersonalDashboard(query: DashboardQuery = {}): Promise<string> {
  return queueExport('/dashboard/personal/export', query);
}
