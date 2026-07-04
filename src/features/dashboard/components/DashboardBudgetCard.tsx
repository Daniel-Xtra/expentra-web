import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowSquareOutIcon, ChartPieSliceIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/use-auth';
import { fetchMyBudgetForecast, fetchMyBudgetSummary } from '@/features/budgets/api';
import { queryKeys } from '@/shared/api/query-keys';
import { BudgetForecastCard } from '@/features/budgets/components/BudgetForecastCard';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { hasManagedDepartmentAccess } from '@/shared/lib/capabilities';
import { cn } from '@/lib/utils';
import { formatNgn } from '@/shared/utils/money';

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export function DashboardBudgetCard() {
  const { authorization } = useAuth();
  const canViewDepartmentBudget = hasManagedDepartmentAccess(authorization);
  const currentYear = new Date().getFullYear();

  const summaryQuery = useQuery({
    queryKey: queryKeys.budgets.meSummary(currentYear),
    queryFn: () => fetchMyBudgetSummary(currentYear),
    enabled: canViewDepartmentBudget,
  });

  const forecastQuery = useQuery({
    queryKey: queryKeys.budgets.meForecast(currentYear),
    queryFn: () => fetchMyBudgetForecast(currentYear),
    enabled: canViewDepartmentBudget && summaryQuery.data?.hasBudget === true,
  });

  if (!canViewDepartmentBudget) {
    return null;
  }

  if (summaryQuery.isLoading) {
    return (
      <DataCard title="Department budget" description={`${currentYear} utilization for your team`}>
        <LoadingState message="Loading department budget…" />
      </DataCard>
    );
  }

  const summary = summaryQuery.data;
  if (!summary?.hasBudget) {
    return (
      <DataCard title="Department budget" description={`${currentYear} utilization for your team`}>
        <EmptyState
          compact
          title="No department budget"
          description="Your department does not have an active budget for this year, or you are not assigned to a department."
        />
      </DataCard>
    );
  }

  const width = clampPercent(summary.utilizationPercent);
  const isNearLimit = summary.isNearLimit && !summary.isOverBudget;

  return (
    <DataCard
      title="Department budget"
      description={`${summary.department?.name ?? 'Your department'} · ${currentYear}`}
      actions={
        summary.department ? (
          <Button variant="outline" size="sm" asChild>
            <Link to="/reports">
              View reports
              <ArrowSquareOutIcon className="size-3.5" />
            </Link>
          </Button>
        ) : undefined
      }
      contentClassName="space-y-5 p-5 sm:p-6"
    >
      <p className="text-sm text-muted-foreground">
        Claims in approval count toward committed spend. Reimbursed amounts reduce pending payout.
      </p>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold tracking-tight">
            {summary.utilizationPercent.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground">
            {formatNgn(summary.remainingAmount)} remaining of {formatNgn(summary.amountLimit)}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
            summary.isOverBudget && 'bg-red-50 text-red-700',
            isNearLimit && 'bg-amber-50 text-amber-700',
            !summary.isOverBudget && !isNearLimit && 'bg-emerald-50 text-emerald-700',
          )}
        >
          {summary.isOverBudget
            ? 'Over budget'
            : isNearLimit
              ? 'Approaching limit'
              : 'Within limit'}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            summary.isOverBudget && 'bg-red-500',
            isNearLimit && 'bg-amber-500',
            !summary.isOverBudget && !isNearLimit && 'bg-emerald-500',
          )}
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2.5">
          <ChartPieSliceIcon className="size-4 text-primary" />
          <div>
            <p className="text-[11px] text-muted-foreground">Committed</p>
            <p className="text-sm font-medium tabular-nums">{formatNgn(summary.committedAmount)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2.5">
          <ChartPieSliceIcon className="size-4 text-emerald-600" />
          <div>
            <p className="text-[11px] text-muted-foreground">Reimbursed</p>
            <p className="text-sm font-medium tabular-nums">{formatNgn(summary.reimbursedAmount)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2.5">
          <ChartPieSliceIcon className="size-4 text-muted-foreground" />
          <div>
            <p className="text-[11px] text-muted-foreground">Pending payout</p>
            <p className="text-sm font-medium tabular-nums">
              {formatNgn(Math.max(summary.committedAmount - summary.reimbursedAmount, 0))}
            </p>
          </div>
        </div>
      </div>

      {forecastQuery.data?.hasBudget ? (
        <BudgetForecastCard forecast={forecastQuery.data} title="Your department forecast" />
      ) : null}
    </DataCard>
  );
}
