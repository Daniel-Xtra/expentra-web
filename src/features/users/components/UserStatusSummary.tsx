import { cn } from '@/lib/utils';
import type { UserStatusCounts } from '@/types/api';

type UserStatusSummaryProps = {
  counts?: UserStatusCounts;
  activeFilter: string;
  onFilterChange: (value: string) => void;
  className?: string;
  isLoading?: boolean;
};

export function UserStatusSummary({
  counts,
  activeFilter,
  onFilterChange,
  className,
  isLoading,
}: UserStatusSummaryProps) {
  if (isLoading || !counts || counts.total === 0) {
    return null;
  }

  const chips = [
    { value: 'all', label: 'All', count: counts.total },
    { value: 'active', label: 'Active', count: counts.active },
    { value: 'inactive', label: 'Inactive', count: counts.inactive },
    {
      value: 'unassigned',
      label: 'No department',
      count: counts.unassignedDepartment,
    },
  ].filter((chip) => chip.value === 'all' || chip.count > 0);

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="mr-1 text-xs font-medium text-muted-foreground">Filter by status</span>
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
