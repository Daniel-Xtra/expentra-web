import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/features/auth/use-auth';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/features/users/schemas';
import { changePassword, fetchCurrentUser, updateProfile } from '@/features/users/api';
import { handleMutationError } from '@/shared/api/form-errors';
import { queryKeys } from '@/shared/api/query-keys';
import { hasNavAccess, NOTIFICATION_READ_ACCESS } from '@/shared/navigation';
import { requiredField } from '@/shared/lib/zod';
import { toastSuccess } from '@/shared/lib/toast';

const profileSchema = z.object({
  firstName: requiredField('First name'),
  lastName: requiredField('Last name'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export function useProfile() {
  const { refreshProfile, authorization } = useAuth();
  const queryClient = useQueryClient();
  const canReadNotifications = hasNavAccess(
    authorization?.capabilities,
    NOTIFICATION_READ_ACCESS,
  );

  const profileQuery = useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: fetchCurrentUser,
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: '', lastName: '' },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => updateProfile(values),
    onSuccess: async () => {
      toastSuccess('Profile updated');
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      await refreshProfile();
    },
    onError: (err) => {
      handleMutationError(err, {
        setError: profileForm.setError,
        fallback: 'Failed to update profile',
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      changePassword(values.currentPassword, values.newPassword),
    onSuccess: (message) => {
      toastSuccess(message);
      passwordForm.reset();
    },
    onError: (err) => {
      handleMutationError(err, {
        setError: passwordForm.setError,
        fallback: 'Failed to change password',
      });
    },
  });

  return {
    canReadNotifications,
    managedDepartments: authorization?.managedDepartments ?? [],
    orgGrants: authorization?.orgGrants ?? [],
    profileQuery,
    profileForm,
    passwordForm,
    updateMutation,
    changePasswordMutation,
  };
}
