import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  BuildingsIcon,
  DownloadSimpleIcon,
  TagIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getApiErrorMessage } from '@/shared/api/client';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { canAccess } from '@/shared/lib/capabilities';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { formatLabel } from '@/shared/utils/format';
import { formatNgn } from '@/shared/utils/money';
import type { ExpenseCategory } from '@/types/api';
import { MonthlySpendingChart } from '../components/MonthlySpendingChart';
import { OrganizationBudgetOverview } from '../components/OrganizationBudgetOverview';
import { ReportPeriodToolbar } from '../components/ReportPeriodToolbar';
import {
  CATEGORY_CHART_COLORS,
  DonutChart,
  STATUS_CHART_COLORS,
  type ChartSegment,
} from '../components/report-charts';
import {
  queueSpendingExcelExport,
  queueSpendingPdfExport,
  fetchSpendingByCategory,
  fetchSpendingByDepartment,
  fetchSpendingByMonth,
  fetchSpendingSummary,
} from '../api';
import { queryKeys } from '@/shared/api/query-keys';

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function formatPeriodLabel(year: number, month: number) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function ReportTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function ReportsPage() {
  const { authorization } = useAuth();
  const now = new Date();
  const currentYear = now.getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(now.getMonth() + 1);

  const query = { year, month };
  const periodLabel = formatPeriodLabel(year, month);

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
    queryKey: queryKeys.reports.monthly(year),
    queryFn: () => fetchSpendingByMonth({ year }),
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

  const canExport = canAccess(authorization?.capabilities, 'report:export');
  const isExporting = excelMutation.isPending || pdfMutation.isPending;

  const summary = summaryQuery.data;
  const organizationBudget = summary?.organizationBudget;

  const statusRows = useMemo(
    () => [...(summary?.byStatus ?? [])].sort((a, b) => b.totalAmount - a.totalAmount),
    [summary?.byStatus],
  );

  const categoryRows = useMemo(
    () => [...(categoryQuery.data ?? [])].sort((a, b) => b.totalAmount - a.totalAmount),
    [categoryQuery.data],
  );

  const departmentRows = useMemo(
    () => [...(departmentQuery.data ?? [])].sort((a, b) => b.totalAmount - a.totalAmount),
    [departmentQuery.data],
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
          CATEGORY_CHART_COLORS[row.category as ExpenseCategory] ?? CATEGORY_CHART_COLORS.OTHER,
        detail: `${row.count} ${pluralize(row.count, 'claim')}`,
      })),
    [categoryRows],
  );

  const averageExpense =
    summary && summary.expenseCount > 0
      ? Math.round(summary.totalAmount / summary.expenseCount)
      : 0;

  if (summaryQuery.isLoading && !summary) {
    return <LoadingState message="Loading reports…" />;
  }

  if (summaryQuery.isError || !summary) {
    return (
      <ErrorState
        message={getApiErrorMessage(summaryQuery.error, 'Failed to load spending report')}
        onRetry={() => void summaryQuery.refetch()}
        retrying={summaryQuery.isFetching}
      />
    );
  }

  const hasPeriodSpend = summary.expenseCount > 0;
  const monthlyRows = monthlyQuery.data?.months ?? [];
  const yearSpendTotal = monthlyRows.reduce((sum, row) => sum + row.totalAmount, 0);

  return (
    <PageShell wide className="gap-6">
      <PageHeader
        title="Spending reports"
        description="Organization budget and period spending for finance review."
        actions={
          canExport ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                className="h-11 font-normal text-sm px-7 bg-primary-500"
                disabled={isExporting}
                onClick={() => void excelMutation.mutateAsync()}
              >
                <DownloadSimpleIcon className="size-4" />
                {excelMutation.isPending ? 'Exporting…' : 'Export Reports'}
              </Button>
              {/* <Button
                variant="outline"
                disabled={isExporting}
                onClick={() => void pdfMutation.mutateAsync()}
              >
                <FilePdfIcon className="size-4" />
                {pdfMutation.isPending ? 'Exporting…' : 'Export PDF'}
              </Button> */}
            </div>
          ) : undefined
        }
      />

      <ReportPeriodToolbar
        year={year}
        month={month}
        periodLabel={periodLabel}
        totalAmountLabel={formatNgn(summary.totalAmount)}
        expenseCountLabel={`${summary.expenseCount} ${pluralize(summary.expenseCount, 'claim')}`}
        averageLabel={
          summary.expenseCount > 0 ? formatNgn(averageExpense) : null
        }
        onYearChange={setYear}
        onMonthChange={setMonth}
        anchorYear={currentYear}
        anchorMonth={now.getMonth() + 1}
      />

      <OrganizationBudgetOverview budget={organizationBudget} year={year} />

      <DataCard
        title="Monthly spending"
        description={`Approved and reimbursed spend by month in ${year}.`}
      >
        {monthlyQuery.isLoading && !monthlyQuery.data ? (
          <ReportTableSkeleton rows={5} />
        ) : yearSpendTotal === 0 ? (
          <EmptyState
            title="No spending this year"
            description={`No settled expenses were recorded in ${year}.`}
          />
        ) : (
          <MonthlySpendingChart months={monthlyRows} highlightMonth={month} />
        )}
      </DataCard>

      {hasPeriodSpend ? (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <DataCard title="By status" description="Workflow stage breakdown for the period.">
              {statusRows.length === 0 ? (
                <EmptyState title="No status data" />
              ) : (
                <DonutChart segments={statusChartSegments} />
              )}
            </DataCard>

            <DataCard title="By category" description="Expense type breakdown for the period.">
              {categoryQuery.isLoading && !categoryQuery.data ? (
                <ReportTableSkeleton rows={3} />
              ) : categoryRows.length === 0 ? (
                <EmptyState
                  icon={<TagIcon className="size-6" aria-hidden />}
                  title="No category data"
                />
              ) : (
                <DonutChart segments={categoryChartSegments} />
              )}
            </DataCard>
          </div>

          <DataCard title="By department" description="Team-level totals for the period.">
            {departmentQuery.isLoading && !departmentQuery.data ? (
              <ReportTableSkeleton />
            ) : departmentRows.length === 0 ? (
              <EmptyState
                icon={<BuildingsIcon className="size-6" aria-hidden />}
                title="No department data"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentRows.map((row) => (
                    <TableRow key={row.departmentReference}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{row.departmentName}</p>
                          {row.departmentCode ? (
                            <p className="text-xs text-muted-foreground">{row.departmentCode}</p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatNgn(row.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DataCard>
        </>
      ) : (
        <DataCard title="Period spending">
          <EmptyState
            title="No spending in this period"
            description={`No expenses were recorded in ${periodLabel}.`}
          />
        </DataCard>
      )}
    </PageShell>
  );
}
