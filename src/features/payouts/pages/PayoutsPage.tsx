import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowSquareOutIcon, DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MarkPaidConfirmDialog,
  type MarkPaidConfirmTarget,
} from '@/features/payouts/components/MarkPaidConfirmDialog';
import { usePayoutsQueue } from '@/features/payouts/hooks/use-payouts-queue';
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
import AppCheckbox from '@/shared/reusable/AppCheckbox';
import { DEFAULT_PAGE_SIZE, resolvePaginationMeta, shouldShowPagination } from '@/shared/lib/pagination';
import { isAgingByDays } from '@/shared/utils/aging';
import { formatLabel, formatRelativeTime } from '@/shared/utils/format';
import { formatNgn } from '@/shared/utils/money';
import { formatUserName } from '@/shared/utils/user';
import { cn } from '@/lib/utils';

const PAYOUT_AGING_DAYS = 30;

export function PayoutsPage() {
  const queue = usePayoutsQueue();
  const caps = useActionCapabilities();
  const canReimburse = caps.expense.reimburse;
  const [markPaidTarget, setMarkPaidTarget] = useState<MarkPaidConfirmTarget | null>(null);

  const meta = resolvePaginationMeta(
    queue.queueQuery.data?.meta,
    queue.queueQuery.data?.items?.length ?? 0,
    queue.page,
    DEFAULT_PAGE_SIZE,
  );

  const selectedAmount = queue.items
    .filter((expense) => queue.selected.includes(expense.reference))
    .reduce((sum, expense) => sum + expense.amount, 0);

  const aging30Plus =
    queue.summaryQuery.data?.agingBuckets?.find((bucket) => bucket.key === '30_plus')?.count ?? 0;

  const confirmPending =
    queue.reimburseMutation.isPending || queue.bulkMutation.isPending;

  const confirmMarkPaid = async () => {
    if (!markPaidTarget) {
      return;
    }

    if (markPaidTarget.kind === 'single') {
      await queue.reimburseMutation.mutateAsync(markPaidTarget.reference);
    } else {
      await queue.bulkMutation.mutateAsync(markPaidTarget.references);
    }
    setMarkPaidTarget(null);
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {caps.expense.exportPayroll ? (
        <Button
          className="h-11 bg-primary-500 px-7 text-sm font-normal"
          disabled={queue.exportMutation.isPending || queue.queueQuery.isLoading}
          onClick={() => void queue.exportMutation.mutateAsync()}
        >
          <DownloadSimpleIcon className="size-4" />
          {queue.exportMutation.isPending ? 'Exporting…' : 'Export for payout'}
        </Button>
      ) : null}
    </div>
  );

  return (
    <PageShell wide className="gap-6">
      <PageHeader
        title="Payouts"
        description="Export for your bank run, then mark paid. Oldest approved first."
        actions={headerActions}
      />

      <QueryStatus query={queue.queueQuery} loadingMessage="Loading Payouts…">
        <>
          {queue.summaryQuery.data ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Waiting"
                value={queue.summaryQuery.data.approvedCount}
              />
              <StatCard
                label="Unpaid total"
                value={formatNgn(
                  Number(queue.summaryQuery.data.approvedAmount) || 0,
                )}
              />
              <StatCard
                label="Aging (30+ days)"
                value={aging30Plus}
                tone={aging30Plus > 0 ? "warning" : "default"}
              />
            </div>
          ) : null}

          <DataCard
            title="Ready to pay"
            description="Mark paid after funds are sent. Updates status only — does not post to your bank."
            footer={
              shouldShowPagination(meta) ? (
                <TablePagination meta={meta} onPageChange={queue.setPage} />
              ) : undefined
            }
          >
            {queue.items.length === 0 ? (
              <EmptyState
                title="No payouts waiting"
                description="No approved claims are waiting to be paid."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {canReimburse ? (
                      <TableHead className="w-10">
                        <AppCheckbox
                          aria-label="Select page"
                          checked={queue.allPageSelected}
                          indeterminate={queue.somePageSelected}
                          onCheckedChange={() => queue.togglePageSelection()}
                        />
                      </TableHead>
                    ) : null}
                    <TableHead className="hidden md:table-cell">
                      Reference
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Employee
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Department
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead className="w-12 text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.items.map((expense) => {
                    const isSelected = queue.selected.includes(
                      expense.reference,
                    );
                    const aging = isAgingByDays(
                      expense.approvedAt,
                      PAYOUT_AGING_DAYS,
                    );

                    return (
                      <TableRow
                        key={expense.reference}
                        data-state={isSelected ? "selected" : undefined}
                        className={cn(aging && "bg-amber-500/4")}
                      >
                        {canReimburse ? (
                          <TableCell>
                            <AppCheckbox
                              aria-label={`Select ${expense.title}`}
                              checked={isSelected}
                              onCheckedChange={() =>
                                queue.toggleSelected(expense.reference)
                              }
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
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {formatUserName(expense.user)}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {expense.department?.name ?? "—"}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {formatLabel(expense.category)}
                        </TableCell>
                        <TableCell className="font-medium tabular-nums">
                          {formatNgn(expense.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {expense.approvedAt ? (
                            <span
                              className={cn(
                                aging && "font-medium text-amber-800",
                              )}
                            >
                              {formatRelativeTime(expense.approvedAt)}
                            </span>
                          ) : (
                            "—"
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

          {canReimburse && queue.selected.length > 0 ? (
            <QueueBulkActionBar
              selectedCount={queue.selected.length}
              selectedAmount={selectedAmount}
              busy={queue.bulkMutation.isPending}
              onClear={queue.clearSelection}
            >
              <Button
                className="h-11 font-normal text-sm px-7 bg-primary-500"
                disabled={queue.bulkMutation.isPending}
                onClick={() =>
                  setMarkPaidTarget({
                    kind: "bulk",
                    count: queue.selected.length,
                    amount: selectedAmount,
                    references: queue.selected,
                  })
                }
              >
                Mark selected paid
              </Button>
            </QueueBulkActionBar>
          ) : null}
        </>
      </QueryStatus>

      <MarkPaidConfirmDialog
        target={markPaidTarget}
        loading={confirmPending}
        onOpenChange={(open) => {
          if (!open && !confirmPending) {
            setMarkPaidTarget(null);
          }
        }}
        onConfirm={confirmMarkPaid}
      />
    </PageShell>
  );
}
