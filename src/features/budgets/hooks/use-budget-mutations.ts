import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  createBudget,
  exportBudgets,
  updateBudget,
  type ListBudgetsParams,
} from '@/features/budgets/api';
import {
  budgetSchema,
  editBudgetSchema,
  type BudgetFormValues,
  type EditBudgetFormValues,
} from '@/features/budgets/schemas';
import { handleMutationError } from '@/shared/api/form-errors';
import { queryKeys } from '@/shared/api/query-keys';
import { toastSuccess } from '@/shared/lib/toast';
import { nairaToKobo } from '@/shared/utils/money';
import type { BudgetResponse } from '@/types/api';

type UseBudgetMutationsOptions = {
  currentYear: number;
  listParams: ListBudgetsParams;
};

export function useBudgetMutations({ currentYear, listParams }: UseBudgetMutationsOptions) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetResponse | null>(null);

  const createForm = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      departmentReference: '',
      year: currentYear,
      amountNaira: '',
    },
  });

  const editForm = useForm<EditBudgetFormValues>({
    resolver: zodResolver(editBudgetSchema),
    defaultValues: { amountNaira: '', isActive: 'active' },
  });

  const invalidateBudgets = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });

  const createMutation = useMutation({
    mutationFn: (values: BudgetFormValues) =>
      createBudget({
        departmentReference: values.departmentReference,
        year: values.year,
        amountLimit: nairaToKobo(values.amountNaira),
      }),
    onSuccess: async () => {
      toastSuccess('Budget created');
      setShowForm(false);
      createForm.reset({ departmentReference: '', year: currentYear, amountNaira: '' });
      await invalidateBudgets();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: createForm.setError,
        fallback: 'Failed to create budget',
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      reference,
      values,
    }: {
      reference: string;
      values: EditBudgetFormValues;
    }) =>
      updateBudget(reference, {
        amountLimit: nairaToKobo(values.amountNaira),
        isActive: values.isActive === 'active',
      }),
    onSuccess: async () => {
      toastSuccess('Budget updated');
      setEditingBudget(null);
      await invalidateBudgets();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: editForm.setError,
        fallback: 'Failed to update budget',
      }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ reference, isActive }: { reference: string; isActive: boolean }) =>
      updateBudget(reference, { isActive }),
    onSuccess: async () => {
      toastSuccess('Budget updated');
      await invalidateBudgets();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: editForm.setError,
        fallback: 'Failed to update budget',
      }),
  });

  const exportMutation = useMutation({
    mutationFn: () => exportBudgets(listParams),
    onSuccess: (message) => toastSuccess(message),
    onError: (err) => handleMutationError(err, { fallback: 'Failed to export budgets' }),
  });

  const openCreateForm = () => {
    createForm.reset({ departmentReference: '', year: currentYear, amountNaira: '' });
    setShowForm(true);
  };

  const openEditBudget = (budget: BudgetResponse) => {
    editForm.reset({
      amountNaira: (budget.amountLimit / 100).toFixed(2),
      isActive: budget.isActive ? 'active' : 'inactive',
    });
    setEditingBudget(budget);
  };

  return {
    showForm,
    setShowForm,
    editingBudget,
    setEditingBudget,
    createForm,
    editForm,
    createMutation,
    updateMutation,
    toggleActiveMutation,
    exportMutation,
    openCreateForm,
    openEditBudget,
  };
}
