import { cn } from '@/lib/utils';
import type { ListApprovalLevelsParams } from '@/features/approval-levels/api';
import type { ApprovalLevelStatusCounts } from '@/types/api';

type ApprovalLevelStatusSummaryProps = {
  counts?: ApprovalLevelStatusCounts;
  activeFilter: string;
  onFilterChange: (value: string) => void;
  className?: string;
  isLoading?: boolean;
};

export function ApprovalLevelStatusSummary({
  counts,
  activeFilter,
  onFilterChange,
  className,
  isLoading,
}: ApprovalLevelStatusSummaryProps) {
  if (isLoading || !counts || counts.total === 0) {
    return null;
  }

  const chips = [
    { value: 'all', label: 'All', count: counts.total },
    { value: 'active', label: 'Active', count: counts.active },
    { value: 'inactive', label: 'Inactive', count: counts.inactive },
    {
      value: 'department_manager',
      label: 'Department manager',
      count: counts.departmentManager,
    },
    {
      value: 'finance_manager',
      label: 'Finance manager',
      count: counts.financeManager,
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

export function resolveApprovalLevelListFilter(
  value: string,
): Pick<ListApprovalLevelsParams, 'isActive' | 'approverType'> {
  if (value === 'active') return { isActive: true };
  if (value === 'inactive') return { isActive: false };
  if (value === 'department_manager' || value === 'finance_manager') {
    return { approverType: value };
  }
  return {};
}
