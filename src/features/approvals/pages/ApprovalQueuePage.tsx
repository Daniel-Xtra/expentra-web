import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApprovalQueue } from '@/features/approvals/hooks/use-approval-queue';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { RejectExpenseDialog } from '@/shared/components/RejectExpenseDialog';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { TablePagination } from '@/shared/components/TablePagination';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { useRejectExpenseForm } from '@/shared/hooks/use-reject-expense-form';
import {
  DEFAULT_PAGE_SIZE,
  formatTotalLabel,
  resolvePaginationMeta,
  shouldShowPagination,
} from '@/shared/lib/pagination';
import { formatNgn } from '@/shared/utils/money';
import { formatUserName } from '@/shared/utils/user';

export function ApprovalQueuePage() {
  const queue = useApprovalQueue();
  const caps = useActionCapabilities();
  const rejectForm = useRejectExpenseForm(Boolean(queue.rejectingRef));

  if (queue.queueQuery.isLoading) {
    return <LoadingState message="Loading approval queue…" />;
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

  const items = queue.queueQuery.data?.items ?? [];
  const meta = resolvePaginationMeta(
    queue.queueQuery.data?.meta,
    queue.queueQuery.data?.items?.length ?? 0,
    queue.page,
    DEFAULT_PAGE_SIZE,
  );
  const hasApprovalActions = caps.approval.approve || caps.approval.reject;

  return (
    <PageShell wide>
      <PageHeader
        title="Approval queue"
        meta={`${formatTotalLabel(meta.total, 'expense')} awaiting review`}
      />

      {queue.summaryQuery.data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Currency" value={queue.summaryQuery.data.currency} />
          <StatCard
            label="Awaiting Approval Count"
            value={queue.summaryQuery.data.awaitingApprovalCount}
          />
          <StatCard
            label="Awaiting Approval Amount"
            value={formatNgn(Number(queue.summaryQuery.data.awaitingApprovalAmount) || 0)}
          />
          <StatCard
            label="Aging Approval Count"
            value={queue.summaryQuery.data.agingApprovalCount}
          />
        </div>
      )}

      <DataCard
        footer={
          shouldShowPagination(meta) ? (
            <TablePagination meta={meta} onPageChange={queue.setPage} />
          ) : undefined
        }
      >
        {items.length === 0 ? (
          <EmptyState
            title="Queue is empty"
            description="No expenses awaiting your approval."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((expense) => (
                <TableRow key={expense.reference}>
                  <TableCell>
                    <ReferenceCell value={expense.reference} />
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/expenses/${expense.reference}`}
                      className="cursor-pointer font-medium text-primary hover:underline"
                    >
                      {expense.title}
                    </Link>
                  </TableCell>
                  <TableCell>{formatUserName(expense.user)}</TableCell>
                  <TableCell>{formatNgn(expense.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={expense.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {hasApprovalActions ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Expense actions">
                            <DotsThreeVerticalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/expenses/${expense.reference}`}>View expense</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {caps.approval.approve && (
                            <DropdownMenuItem
                              disabled={queue.approveMutation.isPending}
                              onClick={() => void queue.approveMutation.mutateAsync(expense.reference)}
                            >
                              Approve
                            </DropdownMenuItem>
                          )}
                          {caps.approval.reject && (
                            <DropdownMenuItem onClick={() => queue.setRejectingRef(expense.reference)}>
                              Reject
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/expenses/${expense.reference}`}>View</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataCard>

      <RejectExpenseDialog
        open={Boolean(queue.rejectingRef)}
        onOpenChange={(open) => {
          if (!open) {
            queue.setRejectingRef(null);
            rejectForm.reset({ comment: '' });
          }
        }}
        form={rejectForm}
        loading={queue.rejectMutation.isPending}
        onConfirm={(comment) =>
          void queue.rejectMutation.mutateAsync({
            reference: queue.rejectingRef!,
            comment,
          })
        }
      />
    </PageShell>
  );
}
