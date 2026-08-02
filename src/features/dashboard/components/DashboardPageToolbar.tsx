import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { DashboardPeriodSheet } from '@/features/dashboard/components/DashboardPeriodSheet';
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
    <div className={cn('flex w-full flex-col gap-2 sm:w-auto sm:flex-row', className)}>
      <DashboardPeriodSheet
        year={year}
        mode={mode}
        month={month}
        quarter={quarter}
        onYearChange={onYearChange}
        onModeChange={onModeChange}
        onMonthChange={onMonthChange}
        onQuarterChange={onQuarterChange}
      />

      {canExport ? (
        <Button
          variant="outline"
          className="h-10 w-full bg-background sm:h-9 sm:w-auto"
          onClick={onExport}
          disabled={exportPending}
        >
          <DownloadSimpleIcon className="size-4" />
          <span className="sm:hidden">{exportPending ? 'Exporting…' : 'Export summary'}</span>
          <span className="hidden sm:inline">{exportPending ? 'Exporting…' : 'Export'}</span>
        </Button>
      ) : null}
    </div>
  );
}
