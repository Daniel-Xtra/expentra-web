import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatLabel } from '@/shared/utils/format';
import type { ExpenseCategory } from '@/types/api';
import {
  isCurrentReportPeriod,
  REPORT_QUARTER_OPTIONS,
  shiftReportUiPeriod,
} from '../report-utils';
import type { ReportDepartmentOption, ReportPeriodMode, ReportSpendMode } from '../types';

const ALL_VALUE = '__all__';

const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
] as const;

const PERIOD_MODE_OPTIONS: Array<{ value: ReportPeriodMode; label: string }> = [
  { value: 'month', label: 'Monthly' },
  { value: 'quarter', label: 'Quarterly' },
  { value: 'year', label: 'Yearly' },
];

const MODE_OPTIONS: Array<{
  value: ReportSpendMode;
  label: string;
  description: string;
}> = [
  {
    value: 'settled',
    label: 'Settled',
    description: 'Approved and paid',
  },
  {
    value: 'pipeline',
    label: 'In progress',
    description: 'Submitted through paid',
  },
  {
    value: 'approved_unpaid',
    label: 'Unpaid approved',
    description: 'Approved, not yet paid (this period)',
  },
];

function buildYearOptions(selectedYear: number, anchorYear: number) {
  const years = new Set([
    anchorYear - 1,
    anchorYear,
    anchorYear + 1,
    selectedYear - 1,
    selectedYear,
    selectedYear + 1,
  ]);
  return [...years].filter((y) => y >= 2000 && y <= 2100).sort((a, b) => a - b);
}

type ReportPeriodToolbarProps = {
  year: number;
  month: number;
  quarter: number;
  periodMode: ReportPeriodMode;
  periodLabel: string;
  mode: ReportSpendMode;
  spendLabel: string;
  totalAmountLabel: string;
  expenseCountLabel: string;
  averageLabel?: string | null;
  departmentReference?: string;
  category?: ExpenseCategory;
  departmentOptions?: ReportDepartmentOption[];
  categoryOptions: ExpenseCategory[];
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onQuarterChange: (quarter: number) => void;
  onPeriodModeChange: (periodMode: ReportPeriodMode) => void;
  onModeChange: (mode: ReportSpendMode) => void;
  onDepartmentChange: (departmentReference?: string) => void;
  onCategoryChange: (category?: ExpenseCategory) => void;
  anchorYear: number;
  anchorMonth: number;
  anchorQuarter: number;
  className?: string;
};

const selectTriggerClassName =
  'h-8 border-0 bg-transparent shadow-none focus:ring-0 focus-visible:ring-0';

export function ReportPeriodToolbar({
  year,
  month,
  quarter,
  periodMode,
  periodLabel,
  mode,
  spendLabel,
  totalAmountLabel,
  expenseCountLabel,
  averageLabel,
  departmentReference,
  category,
  departmentOptions = [],
  categoryOptions,
  onYearChange,
  onMonthChange,
  onQuarterChange,
  onPeriodModeChange,
  onModeChange,
  onDepartmentChange,
  onCategoryChange,
  anchorYear,
  anchorMonth,
  anchorQuarter,
  className,
}: ReportPeriodToolbarProps) {
  const isCurrentPeriod = isCurrentReportPeriod(periodMode, year, month, quarter);
  const yearOptions = buildYearOptions(year, anchorYear);
  const activeMode = MODE_OPTIONS.find((option) => option.value === mode) ?? MODE_OPTIONS[0];

  function applyShift(delta: number) {
    const next = shiftReportUiPeriod(periodMode, year, month, quarter, delta);
    onYearChange(next.year);
    onMonthChange(next.month);
    onQuarterChange(next.quarter);
  }

  function goToCurrentPeriod() {
    onYearChange(anchorYear);
    onMonthChange(anchorMonth);
    onQuarterChange(anchorQuarter);
  }

  const currentPeriodLabel =
    periodMode === 'year' ? 'This year' : periodMode === 'quarter' ? 'This quarter' : 'This month';

  const previousLabel =
    periodMode === 'year'
      ? 'Previous year'
      : periodMode === 'quarter'
        ? 'Previous quarter'
        : 'Previous month';

  const nextLabel =
    periodMode === 'year' ? 'Next year' : periodMode === 'quarter' ? 'Next quarter' : 'Next month';

  return (
    <Card className={cn('border-border/60', className)}>
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarBlankIcon className="size-4" weight="duotone" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Reporting period</p>
                <p className="text-xs text-muted-foreground">{periodLabel}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                role="tablist"
                aria-label="Period granularity"
                className="inline-flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/20 p-1"
              >
                {PERIOD_MODE_OPTIONS.map((option) => {
                  const isActive = option.value === periodMode;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                      onClick={() => onPeriodModeChange(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="inline-flex items-center rounded-lg border border-border/60 bg-background shadow-xs">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-none rounded-l-lg"
                  aria-label={previousLabel}
                  onClick={() => applyShift(-1)}
                >
                  <CaretLeftIcon className="size-4" />
                </Button>

                <div className="flex items-center border-x border-border/60">
                  {periodMode === 'month' ? (
                    <Select
                      value={String(month)}
                      onValueChange={(value) => onMonthChange(Number(value))}
                    >
                      <SelectTrigger className={cn(selectTriggerClassName, 'w-[7.25rem] px-2')}>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}

                  {periodMode === 'quarter' ? (
                    <Select
                      value={String(quarter)}
                      onValueChange={(value) => onQuarterChange(Number(value))}
                    >
                      <SelectTrigger className={cn(selectTriggerClassName, 'w-[8.5rem] px-2')}>
                        <SelectValue placeholder="Quarter" />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_QUARTER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.shortLabel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}

                  <Select
                    value={String(year)}
                    onValueChange={(value) => onYearChange(Number(value))}
                  >
                    <SelectTrigger className={cn(selectTriggerClassName, 'w-[4.75rem] px-2')}>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((optionYear) => (
                        <SelectItem key={optionYear} value={String(optionYear)}>
                          {optionYear}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-none rounded-r-lg"
                  aria-label={nextLabel}
                  onClick={() => applyShift(1)}
                >
                  <CaretRightIcon className="size-4" />
                </Button>
              </div>

              {!isCurrentPeriod ? (
                <Button type="button" variant="outline" size="sm" onClick={goToCurrentPeriod}>
                  {currentPeriodLabel}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <MetricPill label={spendLabel} value={totalAmountLabel} emphasis />
            <MetricPill label="Claims" value={expenseCountLabel} />
            {averageLabel ? <MetricPill label="Average" value={averageLabel} /> : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">Spend view</p>
            <p className="text-xs text-muted-foreground">{activeMode.description}</p>
          </div>
          <div
            role="tablist"
            aria-label="Spend view"
            className="inline-flex w-full flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/20 p-1 sm:w-auto"
          >
            {MODE_OPTIONS.map((option) => {
              const isActive = option.value === mode;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => onModeChange(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
          <p className="text-xs font-medium text-muted-foreground sm:mr-1">Filters</p>
          {departmentOptions.length > 0 ? (
            <Select
              value={departmentReference ?? ALL_VALUE}
              onValueChange={(value) =>
                onDepartmentChange(value === ALL_VALUE ? undefined : value)
              }
            >
              <SelectTrigger className="h-9 w-full sm:w-[12rem]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All departments</SelectItem>
                {departmentOptions.map((option) => (
                  <SelectItem key={option.reference} value={option.reference}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Select
            value={category ?? ALL_VALUE}
            onValueChange={(value) =>
              onCategoryChange(value === ALL_VALUE ? undefined : (value as ExpenseCategory))
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-[10rem]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All categories</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {formatLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {departmentReference || category ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onDepartmentChange(undefined);
                onCategoryChange(undefined);
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricPill({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 text-right',
        emphasis ? 'border-primary/20 bg-primary/5' : 'border-border/60 bg-muted/20',
      )}
    >
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          'text-sm font-semibold tabular-nums',
          emphasis ? 'text-primary' : 'text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  );
}
