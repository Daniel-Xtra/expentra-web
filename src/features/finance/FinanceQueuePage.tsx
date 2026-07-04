import { Link } from 'react-router-dom';
import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FinanceQueueSummaryPanel } from '@/features/finance/components/FinanceQueueSummaryPanel';
import { useFinanceQueue } from '@/features/finance/hooks/use-finance-queue';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { TablePagination } from '@/shared/components/TablePagination';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { DEFAULT_PAGE_SIZE, resolvePaginationMeta, shouldShowPagination } from '@/shared/lib/pagination';
import { formatRelativeTime } from '@/shared/utils/format';
import { formatNgn } from '@/shared/utils/money';
import { formatUserName } from '@/shared/utils/user';
import { cn } from '@/lib/utils';

export function FinanceQueuePage() {
  const queue = useFinanceQueue();
  const caps = useActionCapabilities();
  const canReimburse = caps.expense.reimburse;

  if (queue.queueQuery.isLoading) {
    return <LoadingState layout="page" message="Loading finance queue…" />;
  }

  if (queue.queueQuery.isError) {
    return (
      <ErrorState
        message={(queue.queueQuery.error as Error).message}
        onRetry={() => void queue.queueQuery.refetch()}
        retrying={queue.queueQuery.isFetching}
      />
    );
  }

  const meta = resolvePaginationMeta(
    queue.queueQuery.data?.meta,
    queue.queueQuery.data?.items?.length ?? 0,
    queue.page,
    DEFAULT_PAGE_SIZE,
  );

  return (
    <PageShell wide className="gap-6">
      <PageHeader
        title="Finance queue"
        actions={
          caps.expense.exportPayroll ? (
            <Button
              variant="outline"
              disabled={queue.exportMutation.isPending || (queue.summaryQuery.data?.approvedCount ?? 0) === 0}
              onClick={() => void queue.exportMutation.mutateAsync()}
            >
              <DownloadSimpleIcon className="size-4" />
              Export payroll Excel
            </Button>
          ) : undefined
        }
      />

      {queue.summaryQuery.data && <FinanceQueueSummaryPanel summary={queue.summaryQuery.data} />}

      <DataCard
        title="Reimbursement queue"
        description="Approved expenses ready for payroll processing and payout."
        footer={
          shouldShowPagination(meta) ? (
            <TablePagination meta={meta} onPageChange={queue.setPage} />
          ) : undefined
        }
      >
        {queue.items.length === 0 ? (
          <EmptyState
            title="Queue is empty"
            description="No approved expenses are waiting for reimbursement."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {canReimburse ? (
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all on this page"
                      checked={queue.allPageSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = queue.somePageSelected;
                        }
                      }}
                      onChange={queue.togglePageSelection}
                      className="size-4 rounded border-border accent-primary"
                    />
                  </TableHead>
                ) : null}
                <TableHead>Reference</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Status</TableHead>
                {canReimburse ? <TableHead className="text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.items.map((expense) => {
                const isSelected = queue.selected.includes(expense.reference);

                return (
                  <TableRow key={expense.reference} data-state={isSelected ? 'selected' : undefined}>
                    {canReimburse ? (
                      <TableCell>
                        <input
                          type="checkbox"
                          aria-label={`Select ${expense.title}`}
                          checked={isSelected}
                          onChange={() => queue.toggleSelected(expense.reference)}
                          className="size-4 rounded border-border accent-primary"
                        />
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <ReferenceCell value={expense.reference} />
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <Link
                        to={`/expenses/${expense.reference}`}
                        className="line-clamp-1 font-medium text-primary hover:underline"
                      >
                        {expense.title}
                      </Link>
                    </TableCell>
                    <TableCell>{formatUserName(expense.user)}</TableCell>
                    <TableCell className="font-medium tabular-nums">{formatNgn(expense.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {expense.approvedAt ? formatRelativeTime(expense.approvedAt) : '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={expense.status} />
                    </TableCell>
                    {canReimburse ? (
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={isSelected ? 'default' : 'outline'}
                          disabled={queue.reimburseMutation.isPending}
                          onClick={() => void queue.reimburseMutation.mutateAsync(expense.reference)}
                        >
                          Reimburse
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DataCard>

      {canReimburse && queue.selected.length > 0 && (
        <div
          className={cn(
            'sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60',
            'bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80',
          )}
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{queue.selected.length}</span> expense
            {queue.selected.length === 1 ? '' : 's'} selected
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => queue.setSelected([])}>
              Clear selection
            </Button>
            <Button
              size="sm"
              disabled={queue.bulkMutation.isPending}
              onClick={() => void queue.bulkMutation.mutateAsync(queue.selected)}
            >
              Reimburse selected
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
