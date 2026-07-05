import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CurrencyCircleDollarIcon,
  HourglassMediumIcon,
  WalletIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  buildDashboardQuery,
  exportPersonalDashboard,
  fetchPersonalDashboard,
  type DashboardPeriodMode,
} from '@/features/dashboard/api';
import { queryKeys } from '@/shared/api/query-keys';
import { CategorySpendOverTimeChart } from '@/features/dashboard/components/CategorySpendOverTimeChart';
import { DashboardActionRequired } from '@/features/dashboard/components/DashboardActionRequired';
import { DashboardBudgetCard } from '@/features/dashboard/components/DashboardBudgetCard';
import { DashboardInsightsRow } from '@/features/dashboard/components/DashboardInsightsRow';
import { DashboardPageToolbar } from '@/features/dashboard/components/DashboardPageToolbar';
import { DashboardRecentExpenses } from '@/features/dashboard/components/DashboardRecentExpenses';
import { formatGreetingDate, toLocalDateIso } from '@/features/dashboard/dashboard-utils';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { StatCard } from '@/shared/components/StatCard';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { formatNgn } from '@/shared/utils/money';
import { formatUserName } from '@/shared/utils/user';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  const { user } = useAuth();
  const caps = useActionCapabilities();
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1);
  const currentQuarter = String(Math.floor(new Date().getMonth() / 3) + 1);

  const [periodMode, setPeriodMode] = useState<DashboardPeriodMode>('year');
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(currentMonth);
  const [quarter, setQuarter] = useState(currentQuarter);

  const dashboardQuery = buildDashboardQuery(year, periodMode, month, quarter);
  const firstName = formatUserName(user).split(' ')[0] || 'there';

  const personalQuery = useQuery({
    queryKey: queryKeys.dashboard.personal(dashboardQuery),
    queryFn: () => fetchPersonalDashboard(dashboardQuery),
  });

  const exportMutation = useMutation({
    mutationFn: () => exportPersonalDashboard(dashboardQuery),
    onSuccess: (message) => toastSuccess(message),
    onError: (err) => toastError(err, 'Failed to export summary'),
  });

  const personal = personalQuery.data;

  if (personalQuery.isLoading) {
    return <LoadingState layout="dashboard" message="Loading dashboard…" />;
  }

  if (personalQuery.isError || !personal) {
    return (
      <ErrorState
        message={(personalQuery.error as Error)?.message ?? 'Dashboard data is unavailable.'}
        onRetry={() => void personalQuery.refetch()}
        retrying={personalQuery.isFetching}
      />
    );
  }

  const hasSpendOverTime = personal.spendOverTime.some((row) => row.totalAmount > 0);
  const today = new Date();

  return (
    <PageShell wide className="gap-6">
      <PageHeader
        greeting={`${getGreeting()}, ${firstName}`}
        description={formatGreetingDate(today)}
        descriptionDateTime={toLocalDateIso(today)}
        actions={
          <DashboardPageToolbar
            year={year}
            mode={periodMode}
            month={month}
            quarter={quarter}
            onYearChange={setYear}
            onModeChange={setPeriodMode}
            onMonthChange={setMonth}
            onQuarterChange={setQuarter}
            onExport={() => exportMutation.mutate()}
            exportPending={exportMutation.isPending}
            canExport={caps.dashboard.export}
          />
        }
      />

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total spend"
          value={formatNgn(personal.totalAmount)}
          // hint={`${personal.expenseCount} ${pluralize(personal.expenseCount, 'expense')}`}
          tone="primary"
          icon={<CurrencyCircleDollarIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Pending reimbursement"
          value={formatNgn(personal.pendingReimbursementAmount)}
          // hint={`${personal.pendingReimbursementCount} ${pluralize(personal.pendingReimbursementCount, 'claim')}`}
          tone="warning"
          icon={<WalletIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="In approval"
          value={formatNgn(personal.inApprovalAmount)}
          // hint={`${personal.inApprovalCount} ${pluralize(personal.inApprovalCount, 'claim')}`}
          tone="default"
          icon={<HourglassMediumIcon className="size-4" weight="duotone" />}
          className="sm:col-span-2 lg:col-span-1"
        />
      </section>

      <DashboardActionRequired
        drafts={personal.actionRequired.drafts}
        rejected={personal.actionRequired.rejected}
      />

      <DataCard title="Spend over time" className="w-full">
        {hasSpendOverTime ? (
          <CategorySpendOverTimeChart rows={personal.spendOverTime} />
        ) : (
          <EmptyState
            compact
            title="No spending in this period"
            description="Create an expense to see category trends."
            action={
              caps.expense.create ? (
                <Button className="h-11 font-normal text-sm px-7 bg-primary-500" asChild>
                  <Link to="/expenses/new">Create expense</Link>
                </Button>
              ) : undefined
            }
          />
        )}
      </DataCard>

      <DashboardInsightsRow
        trend={personal.trend}
        avgDaysToReimbursement={personal.avgDaysToReimbursement}
        reimbursedCount={personal.reimbursementStats.reimbursedCount}
        currentTotalAmount={personal.totalAmount}
      />

      <DashboardBudgetCard />

      <DashboardRecentExpenses expenses={personal.recentExpenses} compact />
    </PageShell>
  );
}
