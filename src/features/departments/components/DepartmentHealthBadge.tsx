import { cn } from '@/lib/utils';
import type { DepartmentResponse } from '@/types/api';

type DepartmentHealthBadgeProps = {
  department: Pick<
    DepartmentResponse,
    'hasBudget' | 'isOverBudget' | 'isNearLimit' | 'utilizationPercent'
  >;
  className?: string;
};

export function DepartmentHealthBadge({ department, className }: DepartmentHealthBadgeProps) {
  if (!department.hasBudget) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground',
          className,
        )}
      >
        No budget
      </span>
    );
  }

  if (department.isOverBudget) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700',
          className,
        )}
      >
        Over budget
      </span>
    );
  }

  if (department.isNearLimit) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700',
          className,
        )}
      >
        Near limit
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700',
        className,
      )}
    >
      Within limit
      {department.utilizationPercent != null
        ? ` · ${department.utilizationPercent.toFixed(0)}%`
        : ''}
    </span>
  );
}
