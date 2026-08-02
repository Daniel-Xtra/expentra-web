import { useState } from 'react';
import {
  CalendarBlankIcon,
  CalendarIcon,
  CaretDownIcon,
  ChartBarIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { DashboardPeriodMode } from '@/features/dashboard/api';
import {
  formatDashboardPeriodCompactLabel,
  formatDashboardPeriodLabel,
  getCurrentDashboardPeriod,
  isCurrentDashboardPeriod,
  MONTH_OPTIONS,
  QUARTER_OPTIONS,
} from '@/features/dashboard/dashboard-utils';
import { cn } from '@/lib/utils';

type DashboardPeriodSheetProps = {
  year: string;
  mode: DashboardPeriodMode;
  month: string;
  quarter: string;
  onYearChange: (year: string) => void;
  onModeChange: (mode: DashboardPeriodMode) => void;
  onMonthChange: (month: string) => void;
  onQuarterChange: (quarter: string) => void;
  className?: string;
};

const MODE_OPTIONS: {
  value: DashboardPeriodMode;
  label: string;
  hint: string;
  icon: typeof CalendarBlankIcon;
}[] = [
  { value: 'year', label: 'Year', hint: 'Annual totals', icon: CalendarBlankIcon },
  { value: 'quarter', label: 'Quarter', hint: 'Q1–Q4 view', icon: ChartBarIcon },
  { value: 'month', label: 'Month', hint: 'Single month', icon: CalendarIcon },
];

export function DashboardPeriodSheet({
  year,
  mode,
  month,
  quarter,
  onYearChange,
  onModeChange,
  onMonthChange,
  onQuarterChange,
  className,
}: DashboardPeriodSheetProps) {
  const [open, setOpen] = useState(false);
  const [draftMode, setDraftMode] = useState(mode);
  const [draftYear, setDraftYear] = useState(year);
  const [draftMonth, setDraftMonth] = useState(month);
  const [draftQuarter, setDraftQuarter] = useState(quarter);

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];
  const compactLabel = formatDashboardPeriodCompactLabel(mode, year, month, quarter);
  const draftPeriodLabel = formatDashboardPeriodLabel(
    draftMode,
    draftYear,
    draftMonth,
    draftQuarter,
  );
  const isDraftCurrentPeriod = isCurrentDashboardPeriod(
    draftMode,
    draftYear,
    draftMonth,
    draftQuarter,
  );

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraftMode(mode);
      setDraftYear(year);
      setDraftMonth(month);
      setDraftQuarter(quarter);
    }
    setOpen(nextOpen);
  }

  function resetDraftToCurrentPeriod() {
    const current = getCurrentDashboardPeriod();
    setDraftYear(current.year);
    setDraftMonth(current.month);
    setDraftQuarter(current.quarter);
  }

  function applyDraft() {
    onModeChange(draftMode);
    onYearChange(draftYear);
    onMonthChange(draftMonth);
    onQuarterChange(draftQuarter);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-10 w-full justify-between gap-2 bg-background px-3 font-normal sm:h-9 sm:w-auto sm:min-w-38',
            className,
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <CalendarBlankIcon className="size-4 shrink-0 text-primary" weight="duotone" />
            <span className="truncate text-sm">{compactLabel}</span>
          </span>
          <CaretDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="rounded-t-2xl px-0 pb-2 sm:mx-auto sm:max-w-lg"
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest('[data-slot="select-content"]')) {
            event.preventDefault();
          }
        }}
      >
        <SheetHeader className="border-b border-border/60 px-4 pb-4 text-left">
          <SheetTitle className="text-base">Reporting period</SheetTitle>
          <SheetDescription>{draftPeriodLabel}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 py-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Granularity</p>
            <div className="grid grid-cols-3 gap-2">
              {MODE_OPTIONS.map(({ value, label, hint, icon: Icon }) => {
                const isActive = draftMode === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setDraftMode(value)}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors',
                      isActive
                        ? 'border-primary/40 bg-primary/5 text-foreground ring-1 ring-primary/20'
                        : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground',
                    )}
                  >
                    <Icon
                      className={cn('size-4', isActive ? 'text-primary' : 'text-muted-foreground')}
                      weight={isActive ? 'duotone' : 'regular'}
                    />
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-[11px] leading-tight">{hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-period-year">Year</Label>
              <Select value={draftYear} onValueChange={setDraftYear}>
                <SelectTrigger id="dashboard-period-year" className="h-10 w-full bg-background">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {draftMode === 'month' ? (
              <div className="space-y-2">
                <Label htmlFor="dashboard-period-month">Month</Label>
                <Select value={draftMonth} onValueChange={setDraftMonth}>
                  <SelectTrigger id="dashboard-period-month" className="h-10 w-full bg-background">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {draftMode === 'quarter' ? (
              <div className="space-y-2">
                <Label htmlFor="dashboard-period-quarter">Quarter</Label>
                <Select value={draftQuarter} onValueChange={setDraftQuarter}>
                  <SelectTrigger id="dashboard-period-quarter" className="h-10 w-full bg-background">
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUARTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          {!isDraftCurrentPeriod ? (
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-full text-muted-foreground"
              onClick={resetDraftToCurrentPeriod}
            >
              Jump to current period
            </Button>
          ) : null}
        </div>

        <SheetFooter className="border-t border-border/60 px-4 pt-4">
          <Button type="button" className="h-10 w-full" onClick={applyDraft}>
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
