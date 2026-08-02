import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const STATUS_SELECT_VALUE = '__status__';
const ANY_STATUS_VALUE = '__any__';

const selectedControlClass =
  'border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary';

type ExpenseStatusSummaryProps = {
  counts?: ExpenseStatusCounts;
  activeFilter: string;
  onFilterChange: (value: string) => void;
  className?: string;
  isLoading?: boolean;
};

function CountBadge({ count, selected }: { count: number; selected: boolean }) {
  return (
    <span
      className={cn(
        'rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums',
        selected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
      )}
    >
      {count}
    </span>
  );
}

export function ExpenseStatusSummary({
  counts,
  activeFilter,
  onFilterChange,
  className,
  isLoading,
}: ExpenseStatusSummaryProps) {
  if (isLoading && !counts) {
    return (
      <div
        className={cn('flex flex-wrap items-center gap-2', className)}
        role="group"
        aria-label="Show expenses"
        aria-busy="true"
      >
        <span className="mr-1 text-xs font-medium text-muted-foreground">Show</span>
        <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (!counts) {
    return null;
  }

  const countByStatus = new Map(
    counts.byStatus.map((entry) => [entry.status, entry.count]),
  );

  const statusOptions = SUMMARY_STATUSES.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
    count: countByStatus.get(status) ?? 0,
  })).filter((option) => option.count > 0);

  const totalCount = counts.byStatus.reduce((sum, row) => sum + row.count, 0);
  const isAll = activeFilter === 'all';
  const isStatusFilter = SUMMARY_STATUSES.includes(activeFilter as ExpenseStatus);
  const selectValue = isStatusFilter ? activeFilter : STATUS_SELECT_VALUE;

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="group"
      aria-label="Show expenses"
    >
      <span className="mr-1 text-xs font-medium text-muted-foreground">Show</span>

      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-pressed={isAll}
        className={cn(isAll && selectedControlClass)}
        onClick={() => onFilterChange('all')}
      >
        All
        <CountBadge count={totalCount} selected={isAll} />
      </Button>

      {statusOptions.length > 0 ? (
        <Select
          value={selectValue}
          onValueChange={(value) => {
            if (!value || value === STATUS_SELECT_VALUE) return;
            if (value === ANY_STATUS_VALUE) {
              onFilterChange('all');
              return;
            }
            onFilterChange(value);
          }}
        >
          <SelectTrigger
            size="sm"
            className={cn(
              'h-8 w-full min-w-36 max-w-48 sm:w-auto',
              isStatusFilter && selectedControlClass,
            )}
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_SELECT_VALUE} disabled>
              Status
            </SelectItem>
            {isStatusFilter ? (
              <SelectItem value={ANY_STATUS_VALUE}>Any status</SelectItem>
            ) : null}
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ({option.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
