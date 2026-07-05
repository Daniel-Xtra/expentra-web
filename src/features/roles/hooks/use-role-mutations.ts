import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  createRole,
  deleteRole,
  updateRole,
} from '@/features/roles/api';
import {
  createRoleSchema,
  type CreateRoleFormValues,
} from '@/features/roles/schemas';
import { handleMutationError } from '@/shared/api/form-errors';
import { queryKeys } from '@/shared/api/query-keys';
import { formatRoleName } from '@/shared/utils/format';
import { toastSuccess } from '@/shared/lib/toast';
import type { RoleResponse } from '@/types/api';

export function useRoleMutations() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ reference: string; label: string } | null>(
    null,
  );

  const createRoleForm = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: '', description: '', templateKey: '' },
  });

  const editRoleForm = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: '', description: '', templateKey: '' },
  });

  const invalidateRoles = () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });

  const createRoleMutation = useMutation({
    mutationFn: (values: CreateRoleFormValues) =>
      createRole({
        name: values.name,
        description: values.description || undefined,
        templateKey: values.templateKey || undefined,
      }),
    onSuccess: async () => {
      toastSuccess('Role created');
      createRoleForm.reset({ name: '', description: '', templateKey: '' });
      setShowCreateForm(false);
      await invalidateRoles();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: createRoleForm.setError,
        fallback: 'Failed to create role',
      }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({
      reference,
      values,
    }: {
      reference: string;
      values: CreateRoleFormValues;
    }) =>
      updateRole(reference, {
        name: values.name,
        description: values.description || undefined,
      }),
    onSuccess: async () => {
      toastSuccess('Role updated');
      setEditingRole(null);
      await invalidateRoles();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: editRoleForm.setError,
        fallback: 'Failed to update role',
      }),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (reference: string) => deleteRole(reference),
    onSuccess: async () => {
      toastSuccess('Role deleted');
      await invalidateRoles();
    },
    onError: (err) => handleMutationError(err, { fallback: 'Failed to delete role' }),
  });

  const openCreateForm = () => {
    createRoleForm.reset({ name: '', description: '', templateKey: '' });
    setShowCreateForm(true);
  };

  const openEditRole = (role: RoleResponse) => {
    editRoleForm.reset({
      name: formatRoleName(role.name),
      description: role.description ?? '',
    });
    setEditingRole(role);
  };

  return {
    showCreateForm,
    setShowCreateForm,
    editingRole,
    setEditingRole,
    deleteTarget,
    setDeleteTarget,
    createRoleForm,
    editRoleForm,
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation,
    openCreateForm,
    openEditRole,
  };
}
