import { DownloadSimpleIcon, FilePdfIcon, TagIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { expenseCategories } from '@/features/expenses/schemas';
import { getApiErrorMessage } from '@/shared/api/client';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { formatNgn } from '@/shared/utils/money';
import { DepartmentBudgetVarianceTable } from '../components/DepartmentBudgetVarianceTable';
import { MonthlySpendingChart } from '../components/MonthlySpendingChart';
import { OrganizationBudgetOverview } from '../components/OrganizationBudgetOverview';
import { ReportExceptionsPanel } from '../components/ReportExceptionsPanel';
import { ReportOversightStrip } from '../components/ReportOversightStrip';
import { ReportPeriodToolbar } from '../components/ReportPeriodToolbar';
import { ReportTableSkeleton } from '../components/ReportTableSkeleton';
import { UnpaidPayoutCallout } from '../components/UnpaidPayoutCallout';
import { DonutChart } from '../components/report-charts';
import { useReportsPage } from '../hooks/use-reports-page';
import { pluralize } from '../report-utils';

export function ReportsPage() {
  const reports = useReportsPage();

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {reports.canExport ? (
        <>
          <Button
            className="h-11 font-normal text-sm px-7 bg-primary-500"
            disabled={reports.isExporting || reports.isInitialLoading}
            onClick={() => void reports.excelMutation.mutateAsync()}
          >
            <DownloadSimpleIcon className="size-4" />
            {reports.excelMutation.isPending ? 'Exporting…' : 'Export Excel'}
          </Button>
          <Button
            variant="outline"
            className="h-11 font-normal text-sm px-5"
            disabled={reports.isExporting || reports.isInitialLoading}
            onClick={() => void reports.pdfMutation.mutateAsync()}
          >
            <FilePdfIcon className="size-4" />
            {reports.pdfMutation.isPending ? 'Exporting…' : 'Export PDF'}
          </Button>
        </>
      ) : null}
    </div>
  );

  return (
    <PageShell wide className="gap-6">
      <PageHeader
        title="Reports"
        description="Review settled spend, budgets, and exceptions for the selected period. Export Excel or PDF for finance review."
        actions={headerActions}
      />

      {reports.isInitialLoading ? (
        <LoadingState message="Loading Reports…" />
      ) : reports.isHardError || !reports.summary ? (
        <ErrorState
          message={getApiErrorMessage(
            reports.summaryQuery.error,
            'Failed to load spending report',
          )}
          onRetry={() => void reports.summaryQuery.refetch()}
          retrying={reports.summaryQuery.isFetching}
        />
      ) : (
        <>
          <ReportPeriodToolbar
            year={reports.year}
            month={reports.month}
            quarter={reports.quarter}
            periodMode={reports.periodMode}
            periodLabel={reports.periodLabel}
            mode={reports.mode}
            spendLabel={reports.copy.spendLabel}
            totalAmountLabel={formatNgn(reports.summary.totalAmount)}
            expenseCountLabel={`${reports.summary.expenseCount} ${pluralize(reports.summary.expenseCount, 'claim')}`}
            averageLabel={
              reports.summary.expenseCount > 0 ? formatNgn(reports.averageExpense) : null
            }
            departmentReference={reports.departmentReference}
            category={reports.category}
            departmentOptions={reports.departmentOptions}
            categoryOptions={expenseCategories}
            onYearChange={reports.setYear}
            onMonthChange={reports.setMonth}
            onQuarterChange={reports.setQuarter}
            onPeriodModeChange={reports.setPeriodMode}
            onModeChange={reports.setMode}
            onDepartmentChange={reports.setDepartmentReference}
            onCategoryChange={reports.setCategory}
            anchorYear={reports.currentYear}
            anchorMonth={reports.currentMonth}
            anchorQuarter={reports.currentQuarter}
          />

          <UnpaidPayoutCallout
            payout={reports.summary.pendingPayout}
            canOpenPayouts={reports.canOpenPayouts}
          />

          <DataCard
            title="Monthly spending"
            description={reports.copy.monthlyDescription(reports.year)}
          >
            {reports.monthlyQuery.isLoading && !reports.monthlyQuery.data ? (
              <ReportTableSkeleton rows={5} />
            ) : reports.yearSpendTotal === 0 ? (
              <EmptyState
                title="No spending this year"
                description={reports.copy.monthlyEmpty(reports.year)}
              />
            ) : (
              <MonthlySpendingChart
                months={reports.monthlyRows}
                highlightMonths={reports.highlightMonths}
              />
            )}
          </DataCard>

          {reports.hasPeriodSpend ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <DataCard title="By status" description={reports.copy.statusDescription}>
                {reports.statusRows.length === 0 ? (
                  <EmptyState title="No status data" />
                ) : (
                  <DonutChart segments={reports.statusChartSegments} />
                )}
              </DataCard>

              <DataCard title="By category" description={reports.copy.categoryDescription}>
                {reports.categoryQuery.isLoading && !reports.categoryQuery.data ? (
                  <ReportTableSkeleton rows={3} />
                ) : reports.categoryRows.length === 0 ? (
                  <EmptyState
                    icon={<TagIcon className="size-6" aria-hidden />}
                    title="No category data"
                  />
                ) : (
                  <DonutChart segments={reports.categoryChartSegments} />
                )}
              </DataCard>
            </div>
          ) : (
            <DataCard title="Period spending">
              <EmptyState
                title="No spending in this period"
                description={reports.copy.periodEmpty}
              />
            </DataCard>
          )}

          <OrganizationBudgetOverview
            budget={reports.organizationBudget}
            year={reports.year}
          />

          <ReportOversightStrip
            sla={reports.summary.reimbursementSla}
            comparison={reports.summary.comparison}
            periodLabel={reports.periodLabel}
            periodMode={reports.periodMode}
            year={reports.year}
            month={reports.month}
            quarter={reports.quarter}
          />

          <DepartmentBudgetVarianceTable
            description={reports.copy.departmentDescription}
            rows={reports.departmentVarianceRows}
            loading={
              (reports.departmentQuery.isLoading && !reports.departmentQuery.data) ||
              (reports.showVarianceColumns &&
                reports.budgetByDepartmentQuery.isLoading &&
                !reports.budgetByDepartmentQuery.data)
            }
            showVarianceColumns={reports.showVarianceColumns}
          />

          <ReportExceptionsPanel
            policyViolations={reports.summary.policyViolations}
            topSpenders={reports.summary.topSpenders}
          />
        </>
      )}
    </PageShell>
  );
}
