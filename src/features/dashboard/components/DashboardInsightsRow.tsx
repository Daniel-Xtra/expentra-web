import { ClockIcon, TrendDownIcon, TrendUpIcon } from '@phosphor-icons/react';
import {
  formatReimbursementDuration,
  formatTrendPercent,
  pluralize,
} from '@/features/dashboard/dashboard-utils';
import { DataCard } from '@/shared/components/DataCard';
import { cn } from '@/lib/utils';
import { formatNgn } from '@/shared/utils/money';
import type { DashboardPeriodTrend } from '@/types/api';

const MIN_REIMBURSEMENTS_FOR_INSIGHT = 3;

type DashboardInsightsRowProps = {
  trend: DashboardPeriodTrend;
  avgDaysToReimbursement: number | null;
  reimbursedCount: number;
  currentTotalAmount: number;
  className?: string;
};

function TrendBadge({ value }: { value: number | null }) {
  const label = formatTrendPercent(value);
  const isUp = value != null && value > 0;
  const isDown = value != null && value < 0;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {isUp ? <TrendUpIcon className="size-3" /> : null}
      {isDown ? <TrendDownIcon className="size-3" /> : null}
      {label}
    </span>
  );
}

function SpeedBadge({ tone, label }: { tone: 'fast' | 'typical' | 'slow'; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        tone === 'fast' && 'bg-emerald-500/10 text-emerald-700',
        tone === 'typical' && 'bg-sky-500/10 text-sky-700',
        tone === 'slow' && 'bg-amber-500/10 text-amber-700',
      )}
    >
      <ClockIcon className="size-3" weight="duotone" />
      {label}
    </span>
  );
}

function CompareBar({
  label,
  amount,
  max,
  tone,
}: {
  label: string;
  amount: number;
  max: number;
  tone: 'primary' | 'muted';
}) {
  const widthPercent = amount > 0 ? Math.max((amount / max) * 100, 2) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">{formatNgn(amount)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted/80">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            tone === 'primary' ? 'bg-primary' : 'bg-muted-foreground/35',
          )}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}

function PeriodCompareBars({
  currentAmount,
  previousAmount,
  currentLabel,
  previousLabel,
}: {
  currentAmount: number;
  previousAmount: number;
  currentLabel: string;
  previousLabel: string;
}) {
  const max = Math.max(currentAmount, previousAmount, 1);

  return (
    <div className="space-y-4">
      <CompareBar label={currentLabel} amount={currentAmount} max={max} tone="primary" />
      <CompareBar label={previousLabel} amount={previousAmount} max={max} tone="muted" />
    </div>
  );
}

function ReimbursementSpeedCard({
  avgDaysToReimbursement,
  reimbursedCount,
}: {
  avgDaysToReimbursement: number;
  reimbursedCount: number;
}) {
  const duration = formatReimbursementDuration(avgDaysToReimbursement);
  const pacePercent = Math.min(100, Math.max(8, 100 - avgDaysToReimbursement * 8));

  return (
    <DataCard
      title="Reimbursement speed"
      actions={<SpeedBadge tone={duration.tone} label={duration.toneLabel} />}
      className="h-full overflow-hidden"
      contentClassName="h-full bg-gradient-to-br from-emerald-500/[0.06] to-transparent"
    >
      <div className="flex h-full flex-col px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            {duration.value}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{duration.unit}</span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Average time from approval to payment
        </p>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Slower</span>
            <span>Faster</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted/80">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pacePercent}%` }}
            />
          </div>
        </div>

        <p className="mt-auto pt-4 text-xs text-muted-foreground">
          Based on {reimbursedCount} reimbursed {pluralize(reimbursedCount, 'claim')}
        </p>
      </div>
    </DataCard>
  );
}

export function DashboardInsightsRow({
  trend,
  avgDaysToReimbursement,
  reimbursedCount,
  currentTotalAmount,
  className,
}: DashboardInsightsRowProps) {
  const showTrend =
    currentTotalAmount > 0 || trend.previousTotalAmount > 0;
  const showReimbursement =
    reimbursedCount >= MIN_REIMBURSEMENTS_FOR_INSIGHT && avgDaysToReimbursement != null;

  if (!showTrend && !showReimbursement) {
    return null;
  }

  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2 sm:items-stretch',
        showTrend && showReimbursement ? 'sm:grid-cols-2' : 'sm:grid-cols-1',
        className,
      )}
    >
      {showTrend ? (
        <DataCard
          title={`Vs ${trend.label}`}
          actions={<TrendBadge value={trend.totalAmountChangePercent} />}
          className="h-full"
          contentClassName="flex h-full flex-col px-4 py-4 sm:px-5 sm:py-5"
        >
          <PeriodCompareBars
            currentAmount={currentTotalAmount}
            previousAmount={trend.previousTotalAmount}
            currentLabel="Current period"
            previousLabel="Previous period"
          />
          <p className="mt-auto pt-4 text-xs text-muted-foreground">
            {trend.previousExpenseCount}{' '}
            {pluralize(trend.previousExpenseCount, 'expense')} in the previous period
          </p>
        </DataCard>
      ) : null}

      {showReimbursement ? (
        <ReimbursementSpeedCard
          avgDaysToReimbursement={avgDaysToReimbursement}
          reimbursedCount={reimbursedCount}
        />
      ) : null}
    </div>
  );
}
