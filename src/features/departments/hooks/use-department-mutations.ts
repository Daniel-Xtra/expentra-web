import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDepartment } from '@/features/departments/api';
import {
  toCreateDepartmentPayload,
  type DepartmentFormValues,
} from '@/features/departments/department-form';
import { handleMutationError } from '@/shared/api/form-errors';
import { invalidateDepartments } from '@/shared/api/query-keys';
import { toastSuccess } from '@/shared/lib/toast';
import type { UseFormSetError } from 'react-hook-form';

export function useCreateDepartmentMutation(options: {
  setError: UseFormSetError<DepartmentFormValues>;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: DepartmentFormValues) =>
      createDepartment(toCreateDepartmentPayload(values)),
    onSuccess: async () => {
      toastSuccess('Department created');
      options.onSuccess?.();
      await invalidateDepartments(queryClient);
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: options.setError,
        fallback: 'Failed to create department',
      }),
  });
}
