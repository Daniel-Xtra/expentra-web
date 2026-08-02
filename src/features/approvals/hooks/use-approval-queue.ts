import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  approveExpense,
  bulkApproveExpenses,
  bulkRejectExpenses,
  fetchPendingApprovalSummary,
  listPendingApprovals,
  rejectExpense,
} from '@/features/approvals/api';
import type { ExpenseResponse } from '@/features/expenses/types';
import {
  invalidateApprovalsAndExpenses,
  queryKeys,
} from '@/shared/api/query-keys';
import { useReferenceSelection } from '@/shared/hooks/use-reference-selection';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';
import { toastError, toastSuccess } from '@/shared/lib/toast';

export type ApprovingTarget =
  | { mode: 'single'; expense: ExpenseResponse }
  | { mode: 'bulk'; references: string[]; budgetWouldExceed: boolean; requiresAcknowledgment: boolean }
  | null;

export function useApprovalQueue() {
  const queryClient = useQueryClient();
  const [rejectingRef, setRejectingRef] = useState<string | null>(null);
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
  const [approvingTarget, setApprovingTarget] = useState<ApprovingTarget>(null);
  const [page, setPage] = useState(1);

  const listParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      sortBy: 'submittedAt' as const,
      sortOrder: 'ASC' as const,
    }),
    [page],
  );

  const summaryQuery = useQuery({
    queryKey: queryKeys.approvals.summary(),
    queryFn: fetchPendingApprovalSummary,
  });

  const queueQuery = useQuery({
    queryKey: queryKeys.approvals.queue(listParams),
    queryFn: () => listPendingApprovals(listParams),
  });

  const items = queueQuery.data?.items ?? [];
  const itemReferences = useMemo(() => items.map((item) => item.reference), [items]);
  const selection = useReferenceSelection(itemReferences, { mode: 'page' });

  const selectedExpenses = useMemo(
    () => items.filter((item) => selection.selected.includes(item.reference)),
    [items, selection.selected],
  );

  const openBulkApprove = () => {
    setApprovingTarget({
      mode: 'bulk',
      references: selection.selected,
      budgetWouldExceed: selectedExpenses.some((item) => item.budgetWouldExceed),
      requiresAcknowledgment: selectedExpenses.some(
        (item) => item.requiresOverBudgetAcknowledgment,
      ),
    });
  };

  const approveMutation = useMutation({
    mutationFn: ({
      reference,
      comment,
      overBudgetAcknowledged,
    }: {
      reference: string;
      comment?: string;
      overBudgetAcknowledged?: boolean;
    }) => approveExpense(reference, { comment, overBudgetAcknowledged }),
    onSuccess: async () => {
      toastSuccess('Expense approved');
      setApprovingTarget(null);
      await invalidateApprovalsAndExpenses(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to approve expense'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ reference, comment }: { reference: string; comment: string }) =>
      rejectExpense(reference, comment),
    onSuccess: async () => {
      toastSuccess('Expense rejected');
      setRejectingRef(null);
      await invalidateApprovalsAndExpenses(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to reject expense'),
  });

  const bulkApproveMutation = useMutation({
    mutationFn: ({
      references,
      comment,
      overBudgetAcknowledged,
    }: {
      references: string[];
      comment?: string;
      overBudgetAcknowledged?: boolean;
    }) => bulkApproveExpenses(references, { comment, overBudgetAcknowledged }),
    onSuccess: async (result) => {
      if (result.allSucceeded) {
        toastSuccess(`Approved ${result.succeeded.length} expense(s)`);
      } else if (result.partialSuccess) {
        toastSuccess(
          `Approved ${result.succeeded.length} of ${result.succeeded.length + result.failed.length} expense(s)`,
        );
      } else {
        toastError(new Error(result.failed[0]?.reason ?? 'Bulk approval failed'));
      }
      setApprovingTarget(null);
      selection.clearSelection();
      await invalidateApprovalsAndExpenses(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to approve expenses'),
  });

  const bulkRejectMutation = useMutation({
    mutationFn: ({ references, comment }: { references: string[]; comment: string }) =>
      bulkRejectExpenses(references, comment),
    onSuccess: async (result) => {
      if (result.allSucceeded) {
        toastSuccess(`Rejected ${result.succeeded.length} expense(s)`);
      } else if (result.partialSuccess) {
        toastSuccess(
          `Rejected ${result.succeeded.length} of ${result.succeeded.length + result.failed.length} expense(s)`,
        );
      } else {
        toastError(new Error(result.failed[0]?.reason ?? 'Bulk rejection failed'));
      }
      setBulkRejectOpen(false);
      selection.clearSelection();
      await invalidateApprovalsAndExpenses(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to reject expenses'),
  });

  return {
    page,
    setPage,
    rejectingRef,
    setRejectingRef,
    bulkRejectOpen,
    setBulkRejectOpen,
    approvingTarget,
    setApprovingTarget,
    openBulkApprove,
    selectedRefs: selection.selected,
    allSelected: selection.allPageSelected,
    somePageSelected: selection.somePageSelected,
    toggleSelectAll: selection.togglePageSelection,
    toggleSelect: selection.toggleSelected,
    clearSelection: selection.clearSelection,
    summaryQuery,
    queueQuery,
    approveMutation,
    rejectMutation,
    bulkApproveMutation,
    bulkRejectMutation,
  };
}
