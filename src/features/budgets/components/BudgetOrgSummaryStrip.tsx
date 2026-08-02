import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/shared/components/StatCard';
import { formatNgn } from '@/shared/utils/money';
import type {
  BudgetByDepartmentRow,
  BudgetForecastResponse,
  OrganizationBudgetSummaryResponse,
} from '@/types/api';
import {
  ChartBarIcon,
  CurrencyCircleDollarIcon,
  PiggyBankIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';

type BudgetOrgSummaryStripProps = {
  summary?: OrganizationBudgetSummaryResponse;
  forecast?: BudgetForecastResponse | null;
  departmentRows?: BudgetByDepartmentRow[];
  budgetCount?: number;
  year: number;
  isLoading?: boolean;
};

function SummarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-border/60">
          <CardContent className="space-y-3 pt-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function buildFallbackSummary(
  rows: BudgetByDepartmentRow[],
  year: number,
  budgetCount: number,
): OrganizationBudgetSummaryResponse {
  const amountLimit = rows.reduce((sum, row) => sum + row.amountLimit, 0);
  const committedAmount = rows.reduce((sum, row) => sum + row.committedAmount, 0);
  const remainingAmount = Math.max(0, amountLimit - committedAmount);
  const overBudgetAmount = Math.max(0, committedAmount - amountLimit);
  const utilizationPercent =
    amountLimit > 0 ? Math.round((committedAmount / amountLimit) * 10000) / 100 : 0;

  return {
    year,
    currency: 'NGN',
    amountLimit,
    committedAmount,
    reimbursedAmount: 0,
    remainingAmount,
    overBudgetAmount,
    utilizationPercent,
    isOverBudget: committedAmount > amountLimit,
    isNearLimit: utilizationPercent >= 80 && committedAmount <= amountLimit,
    departmentCount: budgetCount || rows.length,
    hasBudget: (budgetCount || rows.length) > 0,
  };
}

export function BudgetOrgSummaryStrip({
  summary,
  forecast,
  departmentRows = [],
  budgetCount = 0,
  year,
  isLoading,
}: BudgetOrgSummaryStripProps) {
  if (isLoading) {
    return <SummarySkeleton />;
  }

  const resolved =
    summary?.hasBudget
      ? summary
      : budgetCount > 0
        ? buildFallbackSummary(departmentRows, year, budgetCount)
        : null;

  if (!resolved) {
    return null;
  }

  const showForecast = Boolean(forecast?.hasBudget);
  const projectedYearEnd = forecast?.projectedYearEndCommitted ?? 0;
  const monthlyBurn = forecast?.monthlyBurnRate ?? 0;
  const projectedOverrun = Boolean(forecast?.projectedOverrun);

  return (
    <div className="space-y-4">
      <section
        aria-label="Organization budget summary"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Total limit"
          value={formatNgn(resolved.amountLimit)}
          hint={`${resolved.departmentCount} department${resolved.departmentCount > 1 ? 's' : ''} · ${year}`}
          tone="default"
          icon={<PiggyBankIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Committed"
          value={formatNgn(resolved.committedAmount)}
          hint={
            resolved.committedAmount > 0
              ? `${resolved.utilizationPercent.toFixed(1)}% of org limit`
              : 'No submitted claims yet'
          }
          tone="primary"
          icon={<CurrencyCircleDollarIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Remaining"
          value={formatNgn(resolved.remainingAmount)}
          hint={
            resolved.isOverBudget
              ? `${formatNgn(resolved.overBudgetAmount)} over limit`
              : 'Headroom before cap'
          }
          tone={resolved.isOverBudget ? 'warning' : 'success'}
          icon={<ChartBarIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Reimbursed"
          value={formatNgn(resolved.reimbursedAmount)}
          hint="Paid out this year"
          tone="success"
          icon={<TrendUpIcon className="size-4" weight="duotone" />}
        />
      </section>

      {showForecast ? (
        <section
          aria-label="Organization budget forecast"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <StatCard
            label="Monthly burn rate"
            value={formatNgn(monthlyBurn)}
            hint="Average committed spend per month so far this year"
            tone="default"
            icon={<ChartBarIcon className="size-4" weight="duotone" />}
          />
          <StatCard
            label="Projected year-end"
            value={formatNgn(projectedYearEnd)}
            hint={
              projectedOverrun
                ? 'On pace to exceed the org annual limit'
                : 'On pace within the org annual limit'
            }
            tone={projectedOverrun ? 'warning' : 'primary'}
            icon={<TrendUpIcon className="size-4" weight="duotone" />}
          />
          <StatCard
            label="Forecast status"
            value={projectedOverrun ? 'Overrun risk' : 'On track'}
            hint={
              resolved.amountLimit > 0
                ? `${((projectedYearEnd / resolved.amountLimit) * 100).toFixed(0)}% of limit at current burn`
                : 'No limit configured'
            }
            tone={projectedOverrun ? 'warning' : 'success'}
            icon={<PiggyBankIcon className="size-4" weight="duotone" />}
          />
        </section>
      ) : null}
    </div>
  );
}
