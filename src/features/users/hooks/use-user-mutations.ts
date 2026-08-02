import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { adminUpdateUser, exportUsers } from '@/features/users/api';
import { NONE_VALUE } from '@/features/users/constants';
import {
  editEmployeeSchema,
  type EditEmployeeFormValues,
} from '@/features/users/schemas';
import { handleMutationError } from '@/shared/api/form-errors';
import { queryKeys } from '@/shared/api/query-keys';
import { toastSuccess } from '@/shared/lib/toast';
import type { ListUsersParams } from '@/features/users/api';
import type { UserResponse } from '@/types/api';

export function useUserMutations() {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const editEmployeeForm = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: { roleReference: NONE_VALUE, departmentReference: NONE_VALUE },
  });

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

  const updateUserMutation = useMutation({
    mutationFn: ({
      reference,
      roleReference,
      departmentReference,
      isActive,
    }: {
      reference: string;
      roleReference?: string | null;
      departmentReference?: string | null;
      isActive?: boolean;
      displayName?: string;
    }) => adminUpdateUser(reference, { roleReference, departmentReference, isActive }),
    onSuccess: async (_data, variables) => {
      if (variables.isActive === false) {
        toastSuccess(
          variables.displayName
            ? `${variables.displayName} deactivated`
            : 'Employee deactivated',
        );
      } else if (variables.isActive === true) {
        toastSuccess(
          variables.displayName
            ? `${variables.displayName} activated`
            : 'Employee activated',
        );
      } else {
        toastSuccess(
          variables.displayName
            ? `${variables.displayName} updated successfully`
            : 'Employee updated successfully',
        );
      }
      setEditingUser(null);
      await invalidateUsers();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: editEmployeeForm.setError,
        fallback: 'Failed to update employee',
      }),
  });

  const bulkDeactivateMutation = useMutation({
    mutationFn: async (references: string[]) => {
      await Promise.all(
        references.map((reference) => adminUpdateUser(reference, { isActive: false })),
      );
    },
    onSuccess: async () => {
      toastSuccess('Selected employees deactivated');
      setSelectedUsers([]);
      await invalidateUsers();
    },
    onError: (err) => handleMutationError(err, { fallback: 'Failed to deactivate employees' }),
  });

  const openEditUser = (user: UserResponse) => {
    setEditingUser(user);
    editEmployeeForm.reset({
      roleReference: user.role?.reference ?? NONE_VALUE,
      departmentReference: user.department?.reference ?? NONE_VALUE,
    });
  };

  const handleExportUsers = async (params: ListUsersParams) => {
    setExporting(true);
    try {
      const message = await exportUsers(params);
      toastSuccess(message);
    } catch (err) {
      handleMutationError(err, { fallback: 'Failed to export users' });
    } finally {
      setExporting(false);
    }
  };

  const toggleUserSelection = (reference: string, checked: boolean) => {
    setSelectedUsers((current) =>
      checked ? [...current, reference] : current.filter((item) => item !== reference),
    );
  };

  const toggleAllUsers = (userReferences: string[], checked: boolean) => {
    setSelectedUsers(checked ? userReferences : []);
  };

  return {
    editingUser,
    setEditingUser,
    selectedUsers,
    exporting,
    editEmployeeForm,
    updateUserMutation,
    bulkDeactivateMutation,
    openEditUser,
    handleExportUsers,
    toggleUserSelection,
    toggleAllUsers,
  };
}
