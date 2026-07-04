import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { DataCard } from '@/shared/components/DataCard';
import { formatNgn } from '@/shared/utils/money';
import type { BudgetForecastResponse } from '@/types/api';
import { ChartLineUpIcon } from '@phosphor-icons/react';

type BudgetForecastCardProps = {
  forecast?: BudgetForecastResponse;
  title?: string;
  className?: string;
  hasBudgets?: boolean;
};

export function BudgetForecastCard({
  forecast,
  title = 'Year-end forecast',
  className,
  hasBudgets = false,
}: BudgetForecastCardProps) {
  if (!forecast?.hasBudget && !hasBudgets) {
    return null;
  }

  if (!forecast?.hasBudget) {
    return (
      <DataCard
        className={cn('h-full', className)}
        title={title}
        description="Projected spend based on monthly burn rate"
        contentClassName="flex min-h-[220px] flex-col justify-center p-5"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <ChartLineUpIcon className="size-5" weight="duotone" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Forecast unavailable</p>
            <p className="text-xs text-muted-foreground">
              Forecasts appear once departments have submitted claims this year.
            </p>
          </div>
        </div>
      </DataCard>
    );
  }

  const {
    monthlyBurnRate = 0,
    projectedYearEndCommitted = 0,
    amountLimit = 0,
    projectedOverrun = false,
    year,
    committedAmount = 0,
  } = forecast;

  const insufficientData = committedAmount === 0 && monthlyBurnRate === 0;

  return (
    <DataCard
      className={cn('h-full', className)}
      title={title}
      description={`Based on average monthly burn${year ? ` · ${year}` : ''}`}
      contentClassName="space-y-4 p-5"
    >
      {insufficientData ? (
        <p className="text-sm text-muted-foreground">
          Not enough spend history yet. Forecasts will update as claims are submitted and approved.
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Monthly burn
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{formatNgn(monthlyBurnRate)}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Projected year-end
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                {formatNgn(projectedYearEndCommitted)}
              </p>
            </div>
          </div>

          {projectedOverrun ? (
            <Alert variant="destructive">
              <AlertTitle>Projected overrun</AlertTitle>
              <AlertDescription>
                At the current pace, committed spend may exceed the {formatNgn(amountLimit)} annual
                limit before year end.
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-muted-foreground">
              Current pace suggests spending stays within the annual limit.
            </p>
          )}
        </>
      )}
    </DataCard>
  );
}
