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

function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

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
  periodLabel: string;
  totalAmountLabel: string;
  expenseCountLabel: string;
  averageLabel?: string | null;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  anchorYear: number;
  anchorMonth: number;
  className?: string;
};

const selectTriggerClassName =
  'h-8 border-0 bg-transparent shadow-none focus:ring-0 focus-visible:ring-0';

export function ReportPeriodToolbar({
  year,
  month,
  periodLabel,
  totalAmountLabel,
  expenseCountLabel,
  averageLabel,
  onYearChange,
  onMonthChange,
  anchorYear,
  anchorMonth,
  className,
}: ReportPeriodToolbarProps) {
  const isCurrentPeriod = year === anchorYear && month === anchorMonth;
  const yearOptions = buildYearOptions(year, anchorYear);

  function applyPeriod(nextYear: number, nextMonth: number) {
    onYearChange(nextYear);
    onMonthChange(nextMonth);
  }

  return (
    <Card className={cn('border-border/60', className)}>
      <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
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
            <div className="inline-flex items-center rounded-lg border border-border/60 bg-background shadow-xs">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-none rounded-l-lg"
                aria-label="Previous month"
                onClick={() => {
                  const next = shiftMonth(year, month, -1);
                  applyPeriod(next.year, next.month);
                }}
              >
                <CaretLeftIcon className="size-4" />
              </Button>

              <div className="flex items-center border-x border-border/60">
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

                <Select value={String(year)} onValueChange={(value) => onYearChange(Number(value))}>
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
                aria-label="Next month"
                onClick={() => {
                  const next = shiftMonth(year, month, 1);
                  applyPeriod(next.year, next.month);
                }}
              >
                <CaretRightIcon className="size-4" />
              </Button>
            </div>

            {!isCurrentPeriod ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPeriod(anchorYear, anchorMonth)}
              >
                This month
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <MetricPill label="Spend" value={totalAmountLabel} emphasis />
          <MetricPill label="Claims" value={expenseCountLabel} />
          {averageLabel ? <MetricPill label="Average" value={averageLabel} /> : null}
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
