import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { approveExpense, fetchPendingApprovalSummary, listPendingApprovals, rejectExpense } from '@/features/approvals/api';
import {
  invalidateApprovalsAndExpenses,
  queryKeys,
} from '@/shared/api/query-keys';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';
import { toastError, toastSuccess } from '@/shared/lib/toast';

export function useApprovalQueue() {
  const queryClient = useQueryClient();
  const [rejectingRef, setRejectingRef] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const summaryQuery = useQuery({
    queryKey: queryKeys.approvals.summary(),
    queryFn: fetchPendingApprovalSummary,
  });

  const queueQuery = useQuery({
    queryKey: queryKeys.approvals.queue(page),
    queryFn: () => listPendingApprovals({ page, limit: DEFAULT_PAGE_SIZE }),
  });

  const approveMutation = useMutation({
    mutationFn: (reference: string) => approveExpense(reference),
    onSuccess: async () => {
      toastSuccess('Expense approved');
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

  return {
    page,
    setPage,
    rejectingRef,
    setRejectingRef,
    summaryQuery,
    queueQuery,
    approveMutation,
    rejectMutation,
  };
}
