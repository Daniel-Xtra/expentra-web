import { cn } from '@/lib/utils';

type BudgetUtilizationBarProps = {
  utilizationPercent: number;
  isOverBudget?: boolean;
  className?: string;
};

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export function BudgetUtilizationBar({
  utilizationPercent,
  isOverBudget = false,
  className,
}: BudgetUtilizationBarProps) {
  const width = clampPercent(utilizationPercent);
  const isNearLimit = !isOverBudget && utilizationPercent >= 80;

  return (
    <div className={cn('flex min-w-[120px] items-center gap-2', className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isOverBudget && 'bg-red-500',
            !isOverBudget && isNearLimit && 'bg-amber-500',
            !isOverBudget && !isNearLimit && 'bg-emerald-500',
          )}
          style={{ width: `${width}%` }}
        />
      </div>
      <span
        className={cn(
          'w-12 shrink-0 text-right text-xs tabular-nums',
          isOverBudget ? 'font-medium text-destructive' : 'text-muted-foreground',
        )}
      >
        {utilizationPercent.toFixed(1)}%
      </span>
    </div>
  );
}
