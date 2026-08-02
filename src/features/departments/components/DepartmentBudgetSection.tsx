import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  fetchDepartmentBudgetForecast,
  fetchManagedDepartmentBudgetForecast,
} from '@/features/departments/api';
import { DataCard } from '@/shared/components/DataCard';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { EmptyState } from '@/shared/components/EmptyState';
import { queryKeys } from '@/shared/api/query-keys';
import { cn } from '@/lib/utils';
import { formatNgn } from '@/shared/utils/money';
import type { BudgetSummaryResponse, DepartmentResponse } from '@/types/api';

type DepartmentBudgetSectionProps = {
  department: DepartmentResponse;
  year: string;
  onYearChange: (year: string) => void;
  summary?: BudgetSummaryResponse;
  isLoading?: boolean;
  readOnly?: boolean;
  managed?: boolean;
};

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function shareOfLimit(amount: number, limit: number) {
  if (limit <= 0) return 0;
  return clampPercent((amount / limit) * 100);
}

function BudgetStatusBadge({
  isOverBudget,
  isNearLimit,
}: {
  isOverBudget: boolean;
  isNearLimit: boolean;
}) {
  if (isOverBudget) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
        Over budget
      </span>
    );
  }

  if (isNearLimit) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        Approaching limit
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      Within limit
    </span>
  );
}

function BudgetMeter({
  utilizationPercent,
  isOverBudget,
  isNearLimit,
}: {
  utilizationPercent: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}) {
  const width = clampPercent(utilizationPercent);

  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          isOverBudget && 'bg-red-500',
          !isOverBudget && isNearLimit && 'bg-amber-500',
          !isOverBudget && !isNearLimit && 'bg-emerald-500',
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function BudgetBreakdownRow({
  label,
  amount,
  limit,
  tone,
}: {
  label: string;
  amount: number;
  limit: number;
  tone: 'primary' | 'success' | 'muted';
}) {
  const percent = shareOfLimit(amount, limit);
  const toneClass =
    tone === 'primary'
      ? 'bg-primary'
      : tone === 'success'
        ? 'bg-emerald-500'
        : 'bg-muted-foreground/30';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">{formatNgn(amount)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full', toneClass)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function BudgetSectionSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="space-y-4 p-5 sm:p-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-3 w-full" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DepartmentBudgetSection({
  department,
  year,
  onYearChange,
  summary,
  isLoading,
  readOnly = false,
  managed = false,
}: DepartmentBudgetSectionProps) {
  const { budget } = useActionCapabilities();
  const canManageBudgets = budget.update || budget.create;
  const currentYear = new Date().getFullYear();
  const pendingCommitted = summary
    ? Math.max(summary.committedAmount - summary.reimbursedAmount, 0)
    : 0;
  const parsedYear = Number(year);

  const forecastQuery = useQuery({
    queryKey: queryKeys.departments.budgetForecast(department.reference, year, managed),
    queryFn: () =>
      managed
        ? fetchManagedDepartmentBudgetForecast(department.reference, parsedYear)
        : fetchDepartmentBudgetForecast(department.reference, parsedYear),
    enabled: Boolean(department.reference) && Number.isFinite(parsedYear) && Boolean(summary?.hasBudget),
  });

  const forecast = forecastQuery.data;

  return (
    <DataCard
      title="Budget overview"
      description={`${year} spending against the annual department limit`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Select value={year} onValueChange={onYearChange}>
            <SelectTrigger className="w-[108px] bg-background">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1].map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!readOnly && canManageBudgets ? (
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/budgets">
                Manage budgets
                <ArrowSquareOutIcon className="size-3.5" />
              </Link>
            </Button>
          ) : null}
        </div>
      }
      contentClassName="p-5 sm:p-6"
    >
      {isLoading ? (
        <BudgetSectionSkeleton />
      ) : !summary?.hasBudget ? (
        <EmptyState
          title="No budget for this year"
          description={
            readOnly
              ? `${department.name} does not have an active budget for ${year}. Contact administration if a limit should be set.`
              : `${department.name} does not have an active budget for ${year}. Set a limit in administration to track utilization.`
          }
        />
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Submitted and approved claims count toward committed spend for {year}. Reimbursed
            amounts reduce pending payout but remain part of the annual utilization picture.
          </p>

          {(summary.isOverBudget || summary.isNearLimit) && (
            <div className="space-y-3">
              {summary.isOverBudget && (
                <Alert variant="destructive">
                  <AlertTitle>Over budget</AlertTitle>
                  <AlertDescription>
                    Committed spend has exceeded the {year} limit by{' '}
                    {formatNgn(Math.abs(summary.remainingAmount))}.
                  </AlertDescription>
                </Alert>
              )}
              {!summary.isOverBudget && summary.isNearLimit && (
                <Alert>
                  <AlertTitle>Approaching limit</AlertTitle>
                  <AlertDescription>
                    Only {formatNgn(summary.remainingAmount)} remains before this department hits
                    its {year} budget cap.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Card className="border-border/60 bg-gradient-to-br from-primary/5 via-card to-card">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-3xl font-semibold tracking-tight text-foreground">
                      {summary.utilizationPercent.toFixed(1)}%
                    </p>
                    <BudgetStatusBadge
                      isOverBudget={summary.isOverBudget}
                      isNearLimit={summary.isNearLimit}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatNgn(summary.remainingAmount)} remaining of{' '}
                    {formatNgn(summary.amountLimit)} {summary.currency} limit
                  </p>
                </div>
              </div>

              <BudgetMeter
                utilizationPercent={summary.utilizationPercent}
                isOverBudget={summary.isOverBudget}
                isNearLimit={summary.isNearLimit}
              />

              <div className="grid gap-4 border-t border-border/50 pt-5 sm:grid-cols-3">
                <BudgetBreakdownRow
                  label="Committed"
                  amount={summary.committedAmount}
                  limit={summary.amountLimit}
                  tone="primary"
                />
                <BudgetBreakdownRow
                  label="Reimbursed"
                  amount={summary.reimbursedAmount}
                  limit={summary.amountLimit}
                  tone="success"
                />
                <BudgetBreakdownRow
                  label="Pending payout"
                  amount={pendingCommitted}
                  limit={summary.amountLimit}
                  tone="muted"
                />
              </div>
            </CardContent>
          </Card>

          {forecast?.hasBudget ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border/60 px-3 py-3">
                <p className="text-[11px] text-muted-foreground">Monthly burn</p>
                <p className="text-sm font-semibold tabular-nums">
                  {formatNgn(forecast.monthlyBurnRate ?? 0)}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 px-3 py-3">
                <p className="text-[11px] text-muted-foreground">Projected year-end</p>
                <p className="text-sm font-semibold tabular-nums">
                  {formatNgn(forecast.projectedYearEndCommitted ?? 0)}
                </p>
              </div>
              <div
                className={cn(
                  'rounded-lg border px-3 py-3',
                  forecast.projectedOverrun
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-border/60',
                )}
              >
                <p className="text-[11px] text-muted-foreground">Forecast</p>
                <p className="text-sm font-semibold">
                  {forecast.projectedOverrun ? 'Overrun risk' : 'On track'}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </DataCard>
  );
}
