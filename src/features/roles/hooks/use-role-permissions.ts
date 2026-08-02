import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { applyRoleTemplate, getRole, setRolePermissions } from '@/features/roles/api';
import { handleMutationError } from '@/shared/api/form-errors';
import { queryKeys } from '@/shared/api/query-keys';
import { toastSuccess } from '@/shared/lib/toast';
import { normalizeReference } from '@/shared/utils/reference';
import type { RoleResponse } from '@/types/api';

export function useRolePermissions() {
  const queryClient = useQueryClient();
  const [editingRoleRef, setEditingRoleRef] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const applyTemplateMutation = useMutation({
    mutationFn: ({ reference, templateKey }: { reference: string; templateKey: string }) =>
      applyRoleTemplate(reference, templateKey),
    onSuccess: async (role) => {
      toastSuccess('Template applied to role');
      setEditingRole(role);
      setSelectedPermissions(
        role.permissions?.map((permission) => normalizeReference(permission.reference)) ?? [],
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
    onError: (err) => handleMutationError(err, { fallback: 'Failed to apply template' }),
  });

  const permissionsMutation = useMutation({
    mutationFn: ({ reference, permissions }: { reference: string; permissions: string[] }) =>
      setRolePermissions(reference, permissions),
    onSuccess: async (role) => {
      toastSuccess('Permissions updated');
      closeDialog();
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      return role;
    },
    onError: (err) => handleMutationError(err, { fallback: 'Failed to update permissions' }),
  });

  const openDialog = async (reference: string) => {
    setEditingRoleRef(reference);
    setLoading(true);
    try {
      const role = await getRole(reference);
      setEditingRole(role);
      setSelectedPermissions(
        role.permissions
          ?.map((permission) => permission.reference)
          .filter((value): value is string => Boolean(value?.trim()))
          .map(normalizeReference) ?? [],
      );
    } catch (error) {
      setEditingRoleRef(null);
      setEditingRole(null);
      setSelectedPermissions([]);
      handleMutationError(error, { fallback: 'Failed to load role permissions' });
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setEditingRoleRef(null);
    setEditingRole(null);
    setSelectedPermissions([]);
  };

  const isSelected = (reference: string) =>
    selectedPermissions.includes(normalizeReference(reference));

  const togglePermission = (reference: string, checked: boolean) => {
    if (!reference?.trim()) {
      return;
    }

    const normalized = normalizeReference(reference);
    setSelectedPermissions((current) => {
      const normalizedCurrent = current.map(normalizeReference);
      if (checked) {
        return normalizedCurrent.includes(normalized)
          ? normalizedCurrent
          : [...normalizedCurrent, normalized];
      }
      return normalizedCurrent.filter((item) => item !== normalized);
    });
  };

  return {
    editingRoleRef,
    editingRole,
    selectedPermissions,
    loading,
    permissionsMutation,
    applyTemplateMutation,
    openDialog,
    closeDialog,
    isSelected,
    togglePermission,
  };
}
