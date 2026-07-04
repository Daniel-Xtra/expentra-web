import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { BudgetHealthCounts, BudgetHealthFilter } from '@/types/api';

type BudgetHealthSummaryProps = {
  counts?: BudgetHealthCounts;
  activeFilter: string;
  onFilterChange: (value: string) => void;
  className?: string;
  isLoading?: boolean;
  budgetCount?: number;
};

export function BudgetHealthSummary({
  counts,
  activeFilter,
  onFilterChange,
  className,
  isLoading,
  budgetCount = 0,
}: BudgetHealthSummaryProps) {
  if (isLoading) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-28 rounded-full" />
        ))}
      </div>
    );
  }

  const total = counts?.total ?? budgetCount;
  if (total === 0) {
    return null;
  }

  const chips = [
    { value: 'all', label: 'All', count: total },
    {
      value: 'over_budget',
      label: 'Over budget',
      count: counts?.overBudget ?? 0,
      tone: 'destructive' as const,
    },
    {
      value: 'near_limit',
      label: 'Near limit',
      count: counts?.nearLimit ?? 0,
      tone: 'warning' as const,
    },
    {
      value: 'within_limit',
      label: 'Within limit',
      count: counts?.withinLimit ?? total,
      tone: 'success' as const,
    },
  ].filter((chip) => chip.value === 'all' || chip.count > 0);

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="mr-1 text-xs font-medium text-muted-foreground">Filter by health</span>
      {chips.map((chip) => {
        const isActive = activeFilter === chip.value;
        return (
          <button
            key={chip.value}
            type="button"
            onClick={() => onFilterChange(chip.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            <span>{chip.label}</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                !isActive && chip.tone === 'destructive' && chip.count > 0 && 'text-destructive',
                !isActive && chip.tone === 'warning' && chip.count > 0 && 'text-amber-700',
              )}
            >
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function resolveBudgetHealthFilter(filter: string): BudgetHealthFilter | undefined {
  if (filter === 'over_budget' || filter === 'near_limit' || filter === 'within_limit') {
    return filter;
  }
  return undefined;
}
