import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  bulkReimburseExpenses,
  fetchFinanceQueueSummary,
  listFinanceQueue,
  queuePayrollExport,
  reimburseExpense,
} from '@/features/finance/api';
import {
  invalidateFinanceAndExpenses,
  queryKeys,
} from '@/shared/api/query-keys';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';
import { toastError, toastSuccess } from '@/shared/lib/toast';

export function useFinanceQueue() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const summaryQuery = useQuery({
    queryKey: queryKeys.finance.summary(),
    queryFn: fetchFinanceQueueSummary,
  });

  const queueQuery = useQuery({
    queryKey: queryKeys.finance.queue(page),
    queryFn: () => listFinanceQueue({ page, limit: DEFAULT_PAGE_SIZE, status: 'APPROVED' }),
  });

  const items = queueQuery.data?.items ?? [];
  const pageReferences = useMemo(() => items.map((expense) => expense.reference), [items]);
  const allPageSelected =
    pageReferences.length > 0 && pageReferences.every((reference) => selected.includes(reference));
  const somePageSelected =
    pageReferences.some((reference) => selected.includes(reference)) && !allPageSelected;

  const toggleSelected = (reference: string) => {
    setSelected((current) =>
      current.includes(reference)
        ? current.filter((value) => value !== reference)
        : [...current, reference],
    );
  };

  const togglePageSelection = () => {
    if (allPageSelected) {
      setSelected((current) => current.filter((reference) => !pageReferences.includes(reference)));
      return;
    }
    setSelected((current) => [...new Set([...current, ...pageReferences])]);
  };

  const reimburseMutation = useMutation({
    mutationFn: (reference: string) => reimburseExpense(reference),
    onSuccess: async () => {
      toastSuccess('Expense reimbursed');
      await invalidateFinanceAndExpenses(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to reimburse expense'),
  });

  const bulkMutation = useMutation({
    mutationFn: (references: string[]) => bulkReimburseExpenses(references),
    onSuccess: async () => {
      toastSuccess('Selected expenses reimbursed');
      setSelected([]);
      await invalidateFinanceAndExpenses(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to reimburse selected expenses'),
  });

  const exportMutation = useMutation({
    mutationFn: queuePayrollExport,
    onSuccess: (message) => toastSuccess(message),
    onError: (err) => toastError(err, 'Failed to export payroll data'),
  });

  return {
    page,
    setPage,
    selected,
    setSelected,
    items,
    pageReferences,
    allPageSelected,
    somePageSelected,
    toggleSelected,
    togglePageSelection,
    summaryQuery,
    queueQuery,
    reimburseMutation,
    bulkMutation,
    exportMutation,
  };
}
