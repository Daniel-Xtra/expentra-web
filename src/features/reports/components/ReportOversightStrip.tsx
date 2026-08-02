import {
  ArrowsDownUpIcon,
  TimerIcon,
  TrendDownIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';
import { StatCard } from '@/shared/components/StatCard';
import { formatNgn } from '@/shared/utils/money';
import type {
  PeriodComparisonPoint,
  ReimbursementSlaSummary,
  ReportPeriodMode,
  SpendComparisonSummary,
} from '@/types/api';
import { formatComparisonPeriodLabel } from '../report-utils';

type ReportOversightStripProps = {
  sla?: ReimbursementSlaSummary | null;
  comparison?: SpendComparisonSummary | null;
  periodLabel: string;
  periodMode: ReportPeriodMode;
  year: number;
  month: number;
  quarter: number;
};

function emptyComparisonPoint(
  year: number,
  month?: number,
  quarter?: number,
): PeriodComparisonPoint {
  return {
    year,
    ...(month != null ? { month } : {}),
    ...(quarter != null ? { quarter } : {}),
    totalAmount: 0,
    expenseCount: 0,
    amountChangePercent: null,
    countChangePercent: null,
  };
}

function formatPercent(value: number | null): string {
  if (value == null) return 'n/a';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function ChangeIcon({ value }: { value: number | null }) {
  if (value == null || value === 0) {
    return <ArrowsDownUpIcon className="size-4" weight="duotone" />;
  }
  if (value > 0) {
    return <TrendUpIcon className="size-4" weight="duotone" />;
  }
  return <TrendDownIcon className="size-4" weight="duotone" />;
}

function priorPeriodDefaults(
  periodMode: ReportPeriodMode,
  year: number,
  month: number,
  quarter: number,
) {
  if (periodMode === 'year') {
    return emptyComparisonPoint(year - 1);
  }
  if (periodMode === 'quarter') {
    if (quarter === 1) return emptyComparisonPoint(year - 1, undefined, 4);
    return emptyComparisonPoint(year, undefined, quarter - 1);
  }
  if (month === 1) return emptyComparisonPoint(year - 1, 12);
  return emptyComparisonPoint(year, month - 1);
}

function yearAgoDefaults(
  periodMode: ReportPeriodMode,
  year: number,
  month: number,
  quarter: number,
) {
  if (periodMode === 'year') {
    return emptyComparisonPoint(year - 1);
  }
  if (periodMode === 'quarter') {
    return emptyComparisonPoint(year - 1, undefined, quarter);
  }
  return emptyComparisonPoint(year - 1, month);
}

export function ReportOversightStrip({
  sla,
  comparison,
  periodLabel,
  periodMode,
  year,
  month,
  quarter,
}: ReportOversightStripProps) {
  const resolvedSla = sla ?? { avgDays: null, reimbursedCount: 0 };
  const mom =
    comparison?.monthOverMonth ?? priorPeriodDefaults(periodMode, year, month, quarter);
  const yoy = comparison?.yearOverYear ?? yearAgoDefaults(periodMode, year, month, quarter);
  const showYearOverYear = periodMode !== 'year';
  const priorLabel =
    periodMode === 'year' ? 'vs prior year' : periodMode === 'quarter' ? 'QoQ' : 'MoM';

  return (
    <section aria-label="Oversight metrics" className="space-y-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">Oversight for {periodLabel}</h2>
        <p className="text-xs text-muted-foreground">
          Reimbursement cycle time and spend vs prior periods (same filters and mode). Higher
          spend is not a warning.
        </p>
      </div>
      <div
        className={`grid gap-4 sm:grid-cols-2 ${showYearOverYear ? 'xl:grid-cols-5' : 'xl:grid-cols-3'}`}
      >
        <StatCard
          label="Avg days to reimburse"
          value={resolvedSla.avgDays != null ? resolvedSla.avgDays.toFixed(1) : '—'}
          hint={
            resolvedSla.reimbursedCount > 0
              ? `${resolvedSla.reimbursedCount} reimbursed in period (approved → paid)`
              : 'No reimbursements in this period'
          }
          icon={<TimerIcon className="size-4" weight="duotone" />}
          tone="primary"
        />
        <StatCard
          label={`Spend ${priorLabel}`}
          value={formatPercent(mom.amountChangePercent)}
          hint={`vs ${formatComparisonPeriodLabel(mom)} · ${formatNgn(mom.totalAmount)}`}
          icon={<ChangeIcon value={mom.amountChangePercent} />}
          tone="default"
        />
        <StatCard
          label={`Claims ${priorLabel}`}
          value={formatPercent(mom.countChangePercent)}
          hint={`vs ${formatComparisonPeriodLabel(mom)} · ${mom.expenseCount} claims`}
          icon={<ChangeIcon value={mom.countChangePercent} />}
          tone="default"
        />
        {showYearOverYear ? (
          <>
            <StatCard
              label="Spend YoY"
              value={formatPercent(yoy.amountChangePercent)}
              hint={`vs ${formatComparisonPeriodLabel(yoy)} · ${formatNgn(yoy.totalAmount)}`}
              icon={<ChangeIcon value={yoy.amountChangePercent} />}
              tone="default"
            />
            <StatCard
              label="Claims YoY"
              value={formatPercent(yoy.countChangePercent)}
              hint={`vs ${formatComparisonPeriodLabel(yoy)} · ${yoy.expenseCount} claims`}
              icon={<ChangeIcon value={yoy.countChangePercent} />}
              tone="default"
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
