import { cn } from '@/lib/utils';
import type { ExpenseStatus, ExpenseStatusCounts } from '@/types/api';

const SUMMARY_STATUSES: ExpenseStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'REIMBURSED',
];

const STATUS_LABELS: Record<ExpenseStatus, string> = {
  DRAFT: 'Drafts',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'In review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REIMBURSED: 'Reimbursed',
};

type ExpenseStatusSummaryProps = {
  counts?: ExpenseStatusCounts;
  activeFilter: string;
  onFilterChange: (value: string) => void;
  className?: string;
};

export function ExpenseStatusSummary({
  counts,
  activeFilter,
  onFilterChange,
  className,
}: ExpenseStatusSummaryProps) {
  if (!counts) {
    return null;
  }

  const countByStatus = new Map(
    counts.byStatus.map((entry) => [entry.status, entry.count]),
  );

  const chips = [
    { value: 'all', label: 'All', count: counts.byStatus.reduce((sum, row) => sum + row.count, 0) },
    { value: 'needs_action', label: 'Needs action', count: counts.needsAction },
    ...SUMMARY_STATUSES.map((status) => ({
      value: status,
      label: STATUS_LABELS[status],
      count: countByStatus.get(status) ?? 0,
    })),
  ].filter((chip) => chip.value === 'all' || chip.value === 'needs_action' || chip.count > 0);

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
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
                : 'border-border/60 bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
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
