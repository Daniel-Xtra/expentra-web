import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApprovalQueue } from '@/features/approvals/hooks/use-approval-queue';
import { ApproveExpenseDialog } from '@/features/expenses/components/ApproveExpenseDialog';
import { RejectExpenseDialog } from '@/features/expenses/components/RejectExpenseDialog';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { QueueBulkActionBar } from '@/shared/components/QueueBulkActionBar';
import { QueryStatus } from '@/shared/components/QueryStatus';
import { StatCard } from '@/shared/components/StatCard';
import { TablePagination } from '@/shared/components/TablePagination';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { useRejectExpenseForm } from '@/shared/hooks/use-reject-expense-form';
import AppCheckbox from '@/shared/reusable/AppCheckbox';
import {
  DEFAULT_PAGE_SIZE,
  resolvePaginationMeta,
  shouldShowPagination,
} from '@/shared/lib/pagination';
import { cn } from '@/lib/utils';
import { isAgingByDays } from '@/shared/utils/aging';
import { formatNgn } from '@/shared/utils/money';
import { formatUserName } from '@/shared/utils/user';
import { formatLabel, formatRelativeTime } from '@/shared/utils/format';

const APPROVAL_AGING_DAYS = 3;

function approvalBudgetSignal(input: {
  budgetWouldExceed?: boolean;
  needsBudgetAck: boolean;
}) {
  const parts: string[] = [];
  if (input.budgetWouldExceed) {
    parts.push('Over budget');
  }
  if (input.needsBudgetAck) {
    parts.push('Ack required');
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function ApprovalQueuePage() {
  const queue = useApprovalQueue();
  const caps = useActionCapabilities();
  const rejectForm = useRejectExpenseForm(
    Boolean(queue.rejectingRef) || queue.bulkRejectOpen,
  );
  const hasApprovalActions = caps.approval.approve || caps.approval.reject;
  const hasBulkSelection = queue.selectedRefs.length > 0;
  const bulkBusy = queue.bulkApproveMutation.isPending || queue.bulkRejectMutation.isPending;
  const approveBusy = queue.approveMutation.isPending || queue.bulkApproveMutation.isPending;

  useEffect(() => {
    queue.clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clear selection when page changes
  }, [queue.page]);

  const items = queue.queueQuery.data?.items ?? [];
  const meta = resolvePaginationMeta(
    queue.queueQuery.data?.meta,
    queue.queueQuery.data?.items?.length ?? 0,
    queue.page,
    DEFAULT_PAGE_SIZE,
  );

  const somePageSelected = queue.somePageSelected;
  const selectedAmount = useMemo(
    () =>
      items
        .filter((expense) => queue.selectedRefs.includes(expense.reference))
        .reduce((sum, expense) => sum + expense.amount, 0),
    [items, queue.selectedRefs],
  );

  const approving = queue.approvingTarget;

  return (
    <PageShell wide className="gap-6">
      <PageHeader
        title="Approvals"
        description="Oldest first. Clear aging claims so reimbursements are not delayed."
      />

      <QueryStatus query={queue.queueQuery} loadingMessage="Loading approvals…">
        <>
          {queue.summaryQuery.data ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Awaiting approval"
                value={queue.summaryQuery.data.awaitingApprovalCount}
              />
              <StatCard
                label="Awaiting amount"
                value={formatNgn(Number(queue.summaryQuery.data.awaitingApprovalAmount) || 0)}
              />
              <StatCard
                label="Aging (3+ days)"
                value={Number(queue.summaryQuery.data.agingApprovalCount) || 0}
                tone={
                  (Number(queue.summaryQuery.data.agingApprovalCount) || 0) > 0
                    ? 'warning'
                    : 'default'
                }
              />
            </div>
          ) : null}

          <DataCard
            title="Awaiting your decision"
            description="Oldest submissions first. Approve or reject to keep reimbursements moving."
            footer={
              shouldShowPagination(meta) ? (
                <TablePagination meta={meta} onPageChange={queue.setPage} />
              ) : undefined
            }
          >
            {items.length === 0 ? (
              <EmptyState
                title="Nothing to approve"
                description="No claims are waiting for you."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {hasApprovalActions ? (
                      <TableHead className="w-10">
                        <AppCheckbox
                          aria-label="Select page"
                          checked={queue.allSelected}
                          indeterminate={somePageSelected}
                          onCheckedChange={() => queue.toggleSelectAll()}
                        />
                      </TableHead>
                    ) : null}
                    <TableHead className="hidden md:table-cell">Reference</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Submitter</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-12 text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((expense) => {
                    const submitterInactive = expense.user?.isActive === false;
                    const aging = isAgingByDays(expense.submittedAt, APPROVAL_AGING_DAYS);
                    const needsBudgetAck = Boolean(expense.requiresOverBudgetAcknowledgment);
                    const budgetSignal = approvalBudgetSignal({
                      budgetWouldExceed: expense.budgetWouldExceed,
                      needsBudgetAck,
                    });
                    const isSelected = queue.selectedRefs.includes(expense.reference);

                    return (
                      <TableRow
                        key={expense.reference}
                        data-state={isSelected ? 'selected' : undefined}
                        className={cn(aging && 'bg-amber-500/4')}
                      >
                        {hasApprovalActions ? (
                          <TableCell>
                            <AppCheckbox
                              aria-label={`Select ${expense.title}`}
                              checked={isSelected}
                              onCheckedChange={() => queue.toggleSelect(expense.reference)}
                            />
                          </TableCell>
                        ) : null}
                        <TableCell className="hidden md:table-cell">
                          <ReferenceCell value={expense.reference} />
                        </TableCell>
                        <TableCell className="max-w-[220px]">
                          <p className="line-clamp-1 font-medium text-foreground">
                            {expense.title}
                          </p>
                          <p className="mt-0.5 font-mono text-xs text-muted-foreground md:hidden">
                            {expense.reference}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground md:hidden">
                            {formatUserName(expense.user)}
                          </p>
                          {budgetSignal ? (
                            <p className="mt-1 whitespace-normal text-xs font-medium text-amber-700">
                              {budgetSignal}
                            </p>
                          ) : null}
                          {submitterInactive ? (
                            <p className="mt-1 text-xs text-rose-700 md:hidden">
                              Submitter inactive
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">
                              {formatUserName(expense.user)}
                            </span>
                            {submitterInactive ? (
                              <span className="text-xs text-rose-700">Submitter inactive</span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {expense.department?.name ?? '—'}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {formatLabel(expense.category)}
                        </TableCell>
                        <TableCell className="font-medium tabular-nums">
                          {formatNgn(expense.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {expense.submittedAt ? (
                            <span className={cn(aging && 'font-medium text-amber-800')}>
                              {formatRelativeTime(expense.submittedAt)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            aria-label={`View ${expense.title}`}
                          >
                            <Link to={`/expenses/${expense.reference}`}>
                              <ArrowSquareOutIcon className="size-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </DataCard>

          {hasBulkSelection && hasApprovalActions ? (
            <QueueBulkActionBar
              selectedCount={queue.selectedRefs.length}
              selectedAmount={selectedAmount}
              busy={bulkBusy}
              onClear={queue.clearSelection}
            >
              {caps.approval.reject ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 font-normal text-sm px-7 bg-transparent"
                  disabled={bulkBusy}
                  onClick={() => queue.setBulkRejectOpen(true)}
                >
                  Reject selected
                </Button>
              ) : null}
              {caps.approval.approve ? (
                <Button
                  type="button"
                  className="h-11 font-normal text-sm px-7 bg-primary-500"
                  disabled={bulkBusy}
                  onClick={queue.openBulkApprove}
                >
                  Approve selected
                </Button>
              ) : null}
            </QueueBulkActionBar>
          ) : null}
        </>
      </QueryStatus>

      <ApproveExpenseDialog
        open={Boolean(approving)}
        title={
          approving?.mode === 'bulk'
            ? `Approve ${approving.references.length} expense(s)`
            : 'Approve expense'
        }
        budgetWouldExceed={
          approving?.mode === 'single'
            ? Boolean(approving.expense.budgetWouldExceed)
            : Boolean(approving?.budgetWouldExceed)
        }
        requiresAcknowledgment={
          approving?.mode === 'single'
            ? Boolean(approving.expense.requiresOverBudgetAcknowledgment)
            : Boolean(approving?.requiresAcknowledgment)
        }
        loading={approveBusy}
        onOpenChange={(open) => {
          if (!open) {
            queue.setApprovingTarget(null);
          }
        }}
        onConfirm={(payload) => {
          if (!approving) {
            return;
          }
          if (approving.mode === 'single') {
            void queue.approveMutation.mutateAsync({
              reference: approving.expense.reference,
              ...payload,
            });
            return;
          }
          void queue.bulkApproveMutation.mutateAsync({
            references: approving.references,
            ...payload,
          });
        }}
      />

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

      <RejectExpenseDialog
        open={queue.bulkRejectOpen}
        title="Reject selected expenses"
        description={`Provide a reason for rejecting ${queue.selectedRefs.length} expense(s).`}
        onOpenChange={(open) => {
          if (!open) {
            queue.setBulkRejectOpen(false);
            rejectForm.reset({ comment: '' });
          }
        }}
        form={rejectForm}
        loading={queue.bulkRejectMutation.isPending}
        onConfirm={(comment) =>
          void queue.bulkRejectMutation.mutateAsync({
            references: queue.selectedRefs,
            comment,
          })
        }
      />
    </PageShell>
  );
}
