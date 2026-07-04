import { useQuery } from '@tanstack/react-query';
import { fetchUnreadNotificationCount } from '@/features/notifications/api';
import { queryKeys } from '@/shared/api/query-keys';

const UNREAD_POLL_INTERVAL_MS = 60_000;

export function useUnreadNotifications(enabled = true) {
  const countQuery = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: fetchUnreadNotificationCount,
    enabled,
    staleTime: 30_000,
    refetchInterval: UNREAD_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  return {
    unreadCount: countQuery.data ?? 0,
    isLoading: countQuery.isLoading,
    isFetching: countQuery.isFetching,
  };
}
