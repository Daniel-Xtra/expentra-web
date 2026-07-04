import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '@/features/notifications/api';
import { queryKeys } from '@/shared/api/query-keys';
import { toastError, toastSuccess } from '@/shared/lib/toast';

export function useNotificationPreferences(enabled = true) {
  const queryClient = useQueryClient();

  const preferencesQuery = useQuery({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: fetchNotificationPreferences,
    enabled,
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: (input: { emailEnabled?: boolean; inAppEnabled?: boolean }) =>
      updateNotificationPreferences(input),
    onSuccess: async () => {
      toastSuccess('Notification preferences updated');
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preferences() });
    },
    onError: (err) => toastError(err, 'Failed to update notification preferences'),
  });

  return {
    preferencesQuery,
    updateMutation,
    isUpdating: updateMutation.isPending,
  };
}
