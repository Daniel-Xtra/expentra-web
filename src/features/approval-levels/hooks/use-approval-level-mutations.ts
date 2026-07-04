import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  createApprovalLevel,
  deleteApprovalLevel,
  exportApprovalLevels,
  updateApprovalLevel,
  type ListApprovalLevelsParams,
} from '@/features/approval-levels/api';
import {
  approvalLevelSchema,
  defaultFormValues,
  editApprovalLevelSchema,
  toCreatePayload,
  toFormValues,
  toUpdatePayload,
  type ApprovalLevelFormValues,
  type EditApprovalLevelFormValues,
} from '@/features/approval-levels/schemas';
import { handleMutationError } from '@/shared/api/form-errors';
import { queryKeys } from '@/shared/api/query-keys';
import { toastSuccess } from '@/shared/lib/toast';
import type { ApprovalLevelResponse } from '@/types/api';

type UseApprovalLevelMutationsOptions = {
  listParams: ListApprovalLevelsParams;
};

export function useApprovalLevelMutations({ listParams }: UseApprovalLevelMutationsOptions) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState<ApprovalLevelResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ reference: string; label: string } | null>(
    null,
  );
  const [deactivateTarget, setDeactivateTarget] = useState<{
    reference: string;
    label: string;
  } | null>(null);

  const createForm = useForm<ApprovalLevelFormValues>({
    resolver: zodResolver(approvalLevelSchema),
    defaultValues: defaultFormValues(),
  });

  const editForm = useForm<EditApprovalLevelFormValues>({
    resolver: zodResolver(editApprovalLevelSchema),
    defaultValues: {
      ...defaultFormValues(),
      isActive: 'active',
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.approvalLevels.all });

  const exportMutation = useMutation({
    mutationFn: () => exportApprovalLevels(listParams),
    onSuccess: (message) => toastSuccess(message),
    onError: (err) => handleMutationError(err, { fallback: 'Failed to export approval levels' }),
  });

  const createMutation = useMutation({
    mutationFn: (values: ApprovalLevelFormValues) => createApprovalLevel(toCreatePayload(values)),
    onSuccess: async () => {
      toastSuccess('Approval level created');
      setShowForm(false);
      createForm.reset(defaultFormValues());
      await invalidate();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: createForm.setError,
        fallback: 'Failed to create approval level',
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (reference: string) => deleteApprovalLevel(reference),
    onSuccess: async () => {
      toastSuccess('Approval level deleted');
      await invalidate();
    },
    onError: (err) => handleMutationError(err, { fallback: 'Failed to delete approval level' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      reference,
      values,
    }: {
      reference: string;
      values: EditApprovalLevelFormValues;
    }) => updateApprovalLevel(reference, toUpdatePayload(values)),
    onSuccess: async () => {
      toastSuccess('Approval level updated');
      setEditingLevel(null);
      await invalidate();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: editForm.setError,
        fallback: 'Failed to update approval level',
      }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ reference, isActive }: { reference: string; isActive: boolean }) =>
      updateApprovalLevel(reference, { isActive }),
    onSuccess: async () => {
      toastSuccess('Approval level updated');
      setDeactivateTarget(null);
      await invalidate();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: editForm.setError,
        fallback: 'Failed to update approval level',
      }),
  });

  const openCreateForm = () => {
    createForm.reset(defaultFormValues());
    setShowForm(true);
  };

  const openEditForm = (level: ApprovalLevelResponse) => {
    editForm.reset(toFormValues(level));
    setEditingLevel(level);
  };

  return {
    showForm,
    setShowForm,
    editingLevel,
    setEditingLevel,
    deleteTarget,
    setDeleteTarget,
    deactivateTarget,
    setDeactivateTarget,
    createForm,
    editForm,
    exportMutation,
    createMutation,
    deleteMutation,
    updateMutation,
    toggleActiveMutation,
    openCreateForm,
    openEditForm,
  };
}
