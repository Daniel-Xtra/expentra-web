import { Link } from 'react-router-dom';
import { ChartPieIcon, TrendUpIcon, WalletIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { StatCard } from '@/shared/components/StatCard';
import { formatNgn } from '@/shared/utils/money';
import type { OrganizationBudgetSummary } from '@/types/api';

type OrganizationBudgetOverviewProps = {
  budget?: OrganizationBudgetSummary;
  year: number;
  isLoading?: boolean;
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function budgetStatusHint(budget: OrganizationBudgetSummary) {
  if (budget.isOverBudget) {
    return 'Over budget';
  }
  if (budget.isNearLimit) {
    return 'Approaching limit';
  }
  return 'Within limit';
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-border/60">
          <CardContent className="space-y-3 pt-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function OrganizationBudgetOverview({
  budget,
  year,
  isLoading,
}: OrganizationBudgetOverviewProps) {
  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (!budget?.hasBudget) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-8">
          <EmptyState
            title="No organization budget"
            description={`No active department budgets are configured for ${year}.`}
            action={
              <Button
                className="h-11 font-normal text-sm px-7 bg-primary-500"
                asChild
              >
                <Link to="/admin/budgets">Set up budgets</Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  const overBudgetAmount = budget.overBudgetAmount ?? 0;

  return (
    <div className="space-y-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">Org annual budget (YTD)</h2>
        <p className="text-xs text-muted-foreground">
          Calendar-year limits and committed spend — not this month&apos;s budget.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Annual limit"
          value={formatNgn(budget.amountLimit)}
          hint={`${budget.departmentCount} ${pluralize(budget.departmentCount, 'department')} · ${year}`}
          icon={<WalletIcon className="size-4" weight="duotone" />}
          tone="primary"
        />
        <StatCard
          label="Committed (YTD)"
          value={formatNgn(budget.committedAmount)}
          hint={`${budget.utilizationPercent.toFixed(1)}% utilized · ${budgetStatusHint(budget)}`}
          icon={<ChartPieIcon className="size-4" weight="duotone" />}
          tone={budget.isOverBudget ? 'warning' : 'default'}
        />
        <StatCard
          label="Over budget"
          value={formatNgn(overBudgetAmount)}
          hint={
            overBudgetAmount > 0
              ? 'Committed spend above the organization limit'
              : 'No spend above the organization limit'
          }
          icon={<TrendUpIcon className="size-4" weight="duotone" />}
          tone={overBudgetAmount > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label="Remaining (YTD)"
          value={formatNgn(budget.remainingAmount)}
          hint={`${formatNgn(budget.reimbursedAmount)} reimbursed year-to-date`}
          icon={<WalletIcon className="size-4" weight="duotone" />}
          tone={budget.isNearLimit ? 'warning' : 'success'}
        />
      </div>
    </div>
  );
}
