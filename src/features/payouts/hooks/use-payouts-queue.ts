import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  bulkReimburseExpenses,
  fetchPayoutsQueueSummary,
  listPayoutsQueue,
  queuePayrollExport,
  reimburseExpense,
} from '@/features/payouts/api';
import {
  invalidatePayoutsAndExpenses,
  queryKeys,
} from '@/shared/api/query-keys';
import { useReferenceSelection } from '@/shared/hooks/use-reference-selection';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';
import { toastError, toastSuccess } from '@/shared/lib/toast';

export function usePayoutsQueue() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const summaryQuery = useQuery({
    queryKey: queryKeys.payouts.summary(),
    queryFn: fetchPayoutsQueueSummary,
  });

  const queueQuery = useQuery({
    queryKey: queryKeys.payouts.queue(page),
    queryFn: () =>
      listPayoutsQueue({
        page,
        limit: DEFAULT_PAGE_SIZE,
        sortBy: 'approvedAt',
        sortOrder: 'ASC',
      }),
  });

  const items = queueQuery.data?.items ?? [];
  const pageReferences = useMemo(() => items.map((expense) => expense.reference), [items]);
  const selection = useReferenceSelection(pageReferences, { mode: 'multiPage' });

  const reimburseMutation = useMutation({
    mutationFn: (reference: string) => reimburseExpense(reference),
    onSuccess: async () => {
      toastSuccess('Marked as paid');
      await invalidatePayoutsAndExpenses(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to mark claim as paid'),
  });

  const bulkMutation = useMutation({
    mutationFn: (references: string[]) => bulkReimburseExpenses(references),
    onSuccess: async (_data, references) => {
      const count = references.length;
      toastSuccess(
        count === 1 ? 'Marked as paid' : `${count} claims marked as paid`,
      );
      selection.clearSelection();
      await invalidatePayoutsAndExpenses(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to mark selected claims as paid'),
  });

  const exportMutation = useMutation({
    mutationFn: queuePayrollExport,
    onSuccess: (message) => toastSuccess(message),
    onError: (err) => toastError(err, 'Failed to export payroll data'),
  });

  return {
    page,
    setPage,
    selected: selection.selected,
    setSelected: selection.setSelected,
    items,
    pageReferences,
    allPageSelected: selection.allPageSelected,
    somePageSelected: selection.somePageSelected,
    toggleSelected: selection.toggleSelected,
    togglePageSelection: selection.togglePageSelection,
    clearSelection: selection.clearSelection,
    summaryQuery,
    queueQuery,
    reimburseMutation,
    bulkMutation,
    exportMutation,
  };
}
