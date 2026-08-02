import { cn } from '@/lib/utils';
import type { ExpenseStatus } from '@/types/api';

const statusConfig: Record<
  ExpenseStatus,
  { label: string; className: string; dotClassName: string }
> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-600',
    dotClassName: 'bg-slate-400',
  },
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-indigo-50 text-indigo-700',
    dotClassName: 'bg-indigo-500',
  },
  UNDER_REVIEW: {
    label: 'In review',
    className: 'bg-amber-50 text-amber-700',
    dotClassName: 'bg-amber-500',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-emerald-50 text-emerald-700',
    dotClassName: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700',
    dotClassName: 'bg-red-500',
  },
  REIMBURSED: {
    label: 'Reimbursed',
    className: 'bg-violet-50 text-violet-700',
    dotClassName: 'bg-violet-500',
  },
};

export function StatusBadge({ status }: { status: ExpenseStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-1 text-xs font-semibold tracking-wide',
        config.className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', config.dotClassName)} />
      {config.label}
    </span>
  );
}
