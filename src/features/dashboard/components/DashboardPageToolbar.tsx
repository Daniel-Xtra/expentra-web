import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { DashboardPeriodControls } from '@/features/dashboard/components/DashboardPeriodControls';
import type { DashboardPeriodMode } from '@/features/dashboard/api';
import { cn } from '@/lib/utils';

type DashboardPageToolbarProps = {
  year: string;
  mode: DashboardPeriodMode;
  month: string;
  quarter: string;
  onYearChange: (year: string) => void;
  onModeChange: (mode: DashboardPeriodMode) => void;
  onMonthChange: (month: string) => void;
  onQuarterChange: (quarter: string) => void;
  onExport: () => void;
  exportPending?: boolean;
  canExport?: boolean;
  className?: string;
};

export function DashboardPageToolbar({
  year,
  mode,
  month,
  quarter,
  onYearChange,
  onModeChange,
  onMonthChange,
  onQuarterChange,
  onExport,
  exportPending = false,
  canExport = true,
  className,
}: DashboardPageToolbarProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2 rounded-xl border border-border/60 bg-card/60 p-2 shadow-sm backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:w-auto lg:gap-3',
        className,
      )}
    >
      <DashboardPeriodControls
        year={year}
        mode={mode}
        month={month}
        quarter={quarter}
        onYearChange={onYearChange}
        onModeChange={onModeChange}
        onMonthChange={onMonthChange}
        onQuarterChange={onQuarterChange}
        className="sm:flex-1 lg:flex-none"
      />

      <div aria-hidden className="hidden h-6 w-px shrink-0 bg-border/60 sm:block" />

      {canExport ? (
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full border-border/60 bg-background text-xs sm:w-auto"
          onClick={onExport}
          disabled={exportPending}
        >
          <DownloadSimpleIcon className="size-3.5" />
          Export
        </Button>
      ) : null}
    </div>
  );
}