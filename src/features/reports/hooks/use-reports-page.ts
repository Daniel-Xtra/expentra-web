import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { fetchCommittedByDepartment } from '@/features/budgets/api';
import {
  queueSpendingExcelExport,
  queueSpendingPdfExport,
  fetchSpendingByCategory,
  fetchSpendingByDepartment,
  fetchSpendingByMonth,
  fetchSpendingSummary,
} from '@/features/reports/api';
import {
  buildDepartmentVarianceRows,
  formatPeriodLabel,
  getCurrentReportPeriod,
  pluralize,
  spendModeCopy,
} from '@/features/reports/report-utils';
import {
  CATEGORY_CHART_COLORS,
  STATUS_CHART_COLORS,
  type ChartSegment,
} from '@/features/reports/chart-colors';
import type { ReportPeriodMode, ReportSpendMode } from '@/features/reports/types';
import { queryKeys } from '@/shared/api/query-keys';
import { canAccess } from '@/shared/lib/capabilities';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { formatLabel } from '@/shared/utils/format';
import type { ExpenseCategory } from '@/types/api';

export function useReportsPage() {
  const { authorization } = useAuth();
  const current = getCurrentReportPeriod();
  const [year, setYear] = useState(current.year);
  const [month, setMonth] = useState(current.month);
  const [quarter, setQuarter] = useState(current.quarter);
  const [periodMode, setPeriodMode] = useState<ReportPeriodMode>('month');
  const [mode, setMode] = useState<ReportSpendMode>('settled');
  const [departmentReference, setDepartmentReference] = useState<string | undefined>();
  const [category, setCategory] = useState<ExpenseCategory | undefined>();

  const handlePeriodModeChange = (nextMode: ReportPeriodMode) => {
    setPeriodMode(nextMode);
    if (nextMode === 'quarter') {
      setQuarter(Math.floor((month - 1) / 3) + 1);
    }
    if (nextMode === 'month') {
      setMonth((quarter - 1) * 3 + 1);
    }
  };

  const handleMonthChange = (nextMonth: number) => {
    setMonth(nextMonth);
    setQuarter(Math.floor((nextMonth - 1) / 3) + 1);
  };

  const handleQuarterChange = (nextQuarter: number) => {
    setQuarter(nextQuarter);
    setMonth((nextQuarter - 1) * 3 + 1);
  };

  const query = useMemo(
    () => ({
      year,
      periodMode,
      mode,
      ...(periodMode === 'month' ? { month } : {}),
      ...(periodMode === 'quarter' ? { quarter } : {}),
      ...(departmentReference ? { departmentReference } : {}),
      ...(category ? { category } : {}),
    }),
    [year, periodMode, month, quarter, mode, departmentReference, category],
  );
  const yearlyQuery = useMemo(
    () => ({
      year,
      mode,
      ...(departmentReference ? { departmentReference } : {}),
      ...(category ? { category } : {}),
    }),
    [year, mode, departmentReference, category],
  );
  const periodLabel = formatPeriodLabel(periodMode, year, month, quarter);
  const copy = spendModeCopy(mode);

  const canExport = canAccess(authorization?.capabilities, 'report:export');
  const canReadBudgets = canAccess(authorization?.capabilities, 'budget:read');
  const canOpenPayouts = canAccess(authorization?.capabilities, 'expense:reimburse');

  const summaryQuery = useQuery({
    queryKey: queryKeys.reports.summary(query),
    queryFn: () => fetchSpendingSummary(query),
  });

  const categoryQuery = useQuery({
    queryKey: queryKeys.reports.category(query),
    queryFn: () => fetchSpendingByCategory(query),
  });

  const departmentQuery = useQuery({
    queryKey: queryKeys.reports.department(query),
    queryFn: () => fetchSpendingByDepartment(query),
  });

  const monthlyQuery = useQuery({
    queryKey: queryKeys.reports.monthly(yearlyQuery),
    queryFn: () => fetchSpendingByMonth(yearlyQuery),
  });

  const budgetByDepartmentQuery = useQuery({
    queryKey: queryKeys.reports.budgetsByDepartment(year),
    queryFn: () => fetchCommittedByDepartment(year),
    enabled: canReadBudgets,
  });

  const excelMutation = useMutation({
    mutationFn: () => queueSpendingExcelExport(query),
    onSuccess: (message) => toastSuccess(message),
    onError: (err) => toastError(err, 'Failed to export Excel'),
  });

  const pdfMutation = useMutation({
    mutationFn: () => queueSpendingPdfExport(query),
    onSuccess: (message) => toastSuccess(message),
    onError: (err) => toastError(err, 'Failed to export PDF'),
  });

  const isExporting = excelMutation.isPending || pdfMutation.isPending;

  const summary = summaryQuery.data;
  const organizationBudget = summary?.organizationBudget;

  const departmentOptions = useMemo(() => {
    const fromBudgets = (budgetByDepartmentQuery.data ?? []).map((row) => ({
      reference: row.departmentReference,
      name: row.departmentName,
      code: row.departmentCode,
    }));
    if (fromBudgets.length > 0) return fromBudgets;
    return (departmentQuery.data ?? []).map((row) => ({
      reference: row.departmentReference,
      name: row.departmentName,
      code: row.departmentCode,
    }));
  }, [budgetByDepartmentQuery.data, departmentQuery.data]);

  const statusRows = useMemo(
    () => [...(summary?.byStatus ?? [])].sort((a, b) => b.totalAmount - a.totalAmount),
    [summary?.byStatus],
  );

  const categoryRows = useMemo(
    () => [...(categoryQuery.data ?? [])].sort((a, b) => b.totalAmount - a.totalAmount),
    [categoryQuery.data],
  );

  const departmentVarianceRows = useMemo(
    () =>
      buildDepartmentVarianceRows(departmentQuery.data ?? [], budgetByDepartmentQuery.data ?? []),
    [departmentQuery.data, budgetByDepartmentQuery.data],
  );

  const statusChartSegments = useMemo<ChartSegment[]>(
    () =>
      statusRows.map((row) => ({
        key: row.status,
        label: formatLabel(row.status),
        value: row.totalAmount,
        color: STATUS_CHART_COLORS[row.status],
        detail: `${row.count} ${pluralize(row.count, 'claim')}`,
      })),
    [statusRows],
  );

  const categoryChartSegments = useMemo<ChartSegment[]>(
    () =>
      categoryRows.map((row) => ({
        key: row.category,
        label: formatLabel(row.category),
        value: row.totalAmount,
        color:
          CATEGORY_CHART_COLORS[row.category as ExpenseCategory] ?? CATEGORY_CHART_COLORS.OTHERS,
        detail: `${row.count} ${pluralize(row.count, 'claim')}`,
      })),
    [categoryRows],
  );

  const averageExpense =
    summary && summary.expenseCount > 0
      ? Math.round(summary.totalAmount / summary.expenseCount)
      : 0;

  const isInitialLoading = summaryQuery.isLoading && !summary;
  const isHardError = summaryQuery.isError || (!summary && !summaryQuery.isLoading);

  const hasPeriodSpend = (summary?.expenseCount ?? 0) > 0;
  const monthlyRows = monthlyQuery.data?.months ?? [];
  const yearSpendTotal = monthlyRows.reduce((sum, row) => sum + row.totalAmount, 0);
  const showVarianceColumns = canReadBudgets;
  const highlightMonths =
    periodMode === 'month'
      ? [month]
      : periodMode === 'quarter'
        ? [quarter * 3 - 2, quarter * 3 - 1, quarter * 3]
        : undefined;

  return {
    year,
    setYear,
    month,
    setMonth: handleMonthChange,
    quarter,
    setQuarter: handleQuarterChange,
    periodMode,
    setPeriodMode: handlePeriodModeChange,
    mode,
    setMode,
    departmentReference,
    setDepartmentReference,
    category,
    setCategory,
    currentYear: current.year,
    currentMonth: current.month,
    currentQuarter: current.quarter,
    periodLabel,
    copy,
    canExport,
    canOpenPayouts,
    summaryQuery,
    categoryQuery,
    departmentQuery,
    monthlyQuery,
    budgetByDepartmentQuery,
    excelMutation,
    pdfMutation,
    isExporting,
    summary,
    organizationBudget,
    departmentOptions,
    statusRows,
    categoryRows,
    departmentVarianceRows,
    statusChartSegments,
    categoryChartSegments,
    averageExpense,
    isInitialLoading,
    isHardError,
    hasPeriodSpend,
    monthlyRows,
    yearSpendTotal,
    showVarianceColumns,
    highlightMonths,
  };
}
