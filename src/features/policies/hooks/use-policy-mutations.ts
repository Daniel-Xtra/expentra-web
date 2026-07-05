import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { createPolicy, deletePolicy, updatePolicy } from '@/features/policies/api';
import {
  buildPolicyConfig,
  createEditPolicyFormSchema,
  createPolicyFormSchema,
  getDefaultPolicyFormValues,
  policyToFormValues,
  type EditPolicyFormValues,
  type PolicyFormValues,
} from '@/features/policies/policy-config';
import { templateConditionsToForm } from '@/features/policies/policy-conditions';
import { useCatalogFormResolver } from '@/features/policies/hooks/useCatalogFormResolver';
import { handleMutationError } from '@/shared/api/form-errors';
import { queryKeys } from '@/shared/api/query-keys';
import { toastSuccess } from '@/shared/lib/toast';
import type { ExpensePolicyResponse, PolicyCatalogResponse, PolicyCatalogTemplate } from '@/types/api';

export function usePolicyMutations(catalog: PolicyCatalogResponse) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<ExpensePolicyResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ reference: string; label: string } | null>(
    null,
  );

  const createFormResolver = useCatalogFormResolver(catalog, createPolicyFormSchema);
  const editFormResolver = useCatalogFormResolver(catalog, createEditPolicyFormSchema);

  const createForm = useForm<PolicyFormValues>({
    resolver: createFormResolver,
    defaultValues: getDefaultPolicyFormValues(catalog),
  });

  const editForm = useForm<EditPolicyFormValues>({
    resolver: editFormResolver,
    defaultValues: {
      ...getDefaultPolicyFormValues(catalog),
      isActive: 'active',
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.policies.all });

  const createMutation = useMutation({
    mutationFn: (values: PolicyFormValues) =>
      createPolicy({
        name: values.name,
        ruleType: 'CONDITIONAL',
        severity: values.severity,
        config: buildPolicyConfig(catalog, values),
      }),
    onSuccess: async () => {
      toastSuccess('Policy created');
      setShowForm(false);
      createForm.reset(getDefaultPolicyFormValues(catalog));
      await invalidate();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: createForm.setError,
        fallback: 'Failed to create policy',
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (reference: string) => deletePolicy(reference),
    onSuccess: async () => {
      toastSuccess('Policy deleted');
      await invalidate();
    },
    onError: (err) => handleMutationError(err, { fallback: 'Failed to delete policy' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      reference,
      values,
    }: {
      reference: string;
      values: EditPolicyFormValues;
    }) =>
      updatePolicy(reference, {
        name: values.name,
        severity: values.severity,
        config: buildPolicyConfig(catalog, values),
        isActive: values.isActive === 'active',
      }),
    onSuccess: async () => {
      toastSuccess('Policy updated');
      setEditingPolicy(null);
      await invalidate();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: editForm.setError,
        fallback: 'Failed to update policy',
      }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ reference, isActive }: { reference: string; isActive: boolean }) =>
      updatePolicy(reference, { isActive }),
    onSuccess: async () => {
      toastSuccess('Policy updated');
      await invalidate();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: editForm.setError,
        fallback: 'Failed to update policy',
      }),
  });

  const openCreateForm = (template?: PolicyCatalogTemplate) => {
    const defaults = getDefaultPolicyFormValues(catalog);
    if (template) {
      const parsed = templateConditionsToForm(catalog, template);
      createForm.reset({
        ...defaults,
        name: template.name,
        match: parsed.match,
        conditions: parsed.conditions,
      });
    } else {
      createForm.reset(defaults);
    }
    setShowForm(true);
  };

  const openEditForm = (policy: ExpensePolicyResponse) => {
    editForm.reset(policyToFormValues(catalog, policy));
    setEditingPolicy(policy);
  };

  return {
    showForm,
    setShowForm,
    editingPolicy,
    setEditingPolicy,
    deleteTarget,
    setDeleteTarget,
    createForm,
    editForm,
    createMutation,
    deleteMutation,
    updateMutation,
    toggleActiveMutation,
    openCreateForm,
    openEditForm,
  };
}
