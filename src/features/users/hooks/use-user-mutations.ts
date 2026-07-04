import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  adminCreateUser,
  adminUpdateUser,
  exportUsers,
} from '@/features/users/api';
import { NONE_VALUE } from '@/features/users/constants';
import {
  createUserSchema,
  editEmployeeSchema,
  type CreateUserFormValues,
  type EditEmployeeFormValues,
} from '@/features/users/schemas';
import { handleMutationError } from '@/shared/api/form-errors';
import { queryKeys } from '@/shared/api/query-keys';
import { toastSuccess } from '@/shared/lib/toast';
import type { ListUsersParams } from '@/features/users/api';
import type { UserResponse } from '@/types/api';

export function useUserMutations() {
  const queryClient = useQueryClient();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const createUserForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      roleReference: NONE_VALUE,
      departmentReference: NONE_VALUE,
    },
  });

  const editEmployeeForm = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: { roleReference: NONE_VALUE, departmentReference: NONE_VALUE },
  });

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

  const createUserMutation = useMutation({
    mutationFn: (values: CreateUserFormValues) =>
      adminCreateUser({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
        roleReference: values.roleReference === NONE_VALUE ? undefined : values.roleReference,
        departmentReference:
          values.departmentReference === NONE_VALUE ? null : values.departmentReference,
      }),
    onSuccess: async () => {
      toastSuccess('Employee created');
      createUserForm.reset();
      setShowCreateUser(false);
      await invalidateUsers();
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: createUserForm.setError,
        fallback: 'Failed to create employee',
      }),
  });

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
    }) => adminUpdateUser(reference, { roleReference, departmentReference, isActive }),
    onSuccess: async () => {
      toastSuccess('Employee updated');
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

  const openCreateUserForm = () => {
    createUserForm.reset({
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      roleReference: NONE_VALUE,
      departmentReference: NONE_VALUE,
    });
    setShowCreateUser(true);
  };

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
    showCreateUser,
    setShowCreateUser,
    editingUser,
    setEditingUser,
    selectedUsers,
    exporting,
    createUserForm,
    editEmployeeForm,
    createUserMutation,
    updateUserMutation,
    bulkDeactivateMutation,
    openCreateUserForm,
    openEditUser,
    handleExportUsers,
    toggleUserSelection,
    toggleAllUsers,
  };
}
