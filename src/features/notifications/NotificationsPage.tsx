import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckIcon } from '@phosphor-icons/react';
import notificationIconUrl from '@/assets/notification.png';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { AssetIcon } from '@/shared/components/AssetIcon';
import { FilterCard } from '@/shared/components/FilterCard';
import { FormField } from '@/shared/components/FormField';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { TablePagination } from '@/shared/components/TablePagination';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { DEFAULT_PAGE_SIZE, formatTotalLabel, resolvePaginationMeta, shouldShowPagination } from '@/shared/lib/pagination';
import { getApiErrorMessage } from '@/shared/api/client';
import { hasNavAccess, NOTIFICATION_READ_ACCESS } from '@/shared/navigation';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { useAuth } from '@/features/auth/use-auth';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './api';
import { queryKeys, invalidateNotifications } from '@/shared/api/query-keys';
import { useNotificationPreferences } from '@/features/notifications/hooks/use-notification-preferences';
import { NotificationItem } from './NotificationItem';
import { NotificationPreferencesPanel } from './NotificationPreferencesPanel';

type InboxFilter = 'all' | 'unread' | 'read';

function NotificationListSkeleton() {
  return (
    <ul className="divide-y divide-border/60">
      {Array.from({ length: 6 }).map((_, index) => (
        <li key={index} className="flex items-start gap-4 px-6 py-4">
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="ml-auto h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-3/5 max-w-sm" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NotificationsPage() {
  const { authorization } = useAuth();
  const caps = useActionCapabilities();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const canReadNotifications = hasNavAccess(
    authorization?.capabilities,
    NOTIFICATION_READ_ACCESS,
  );
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabParam === 'preferences' ? 'preferences' : 'inbox',
  );
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>('all');
  const [page, setPage] = useState(1);
  const unreadOnly = inboxFilter === 'unread';
  const readOnly = inboxFilter === 'read';

  const preferences = useNotificationPreferences(canReadNotifications);

  useEffect(() => {
    const nextTab = tabParam === 'preferences' ? 'preferences' : 'inbox';
    setActiveTab(nextTab);
  }, [tabParam]);

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.inbox(inboxFilter, page),
    queryFn: () =>
      listNotifications({
        page,
        limit: DEFAULT_PAGE_SIZE,
        unreadOnly: unreadOnly || undefined,
        readOnly: readOnly || undefined,
      }),
    enabled: canReadNotifications,
    retry: 1,
  });

  const readMutation = useMutation({
    mutationFn: (reference: string) => markNotificationRead(reference),
    onSuccess: async () => {
      await invalidateNotifications(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to mark notification as read'),
  });

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      toastSuccess('All notifications marked as read');
      await invalidateNotifications(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to mark all notifications as read'),
  });

  if (!canReadNotifications) {
    return (
      <ErrorState message="You do not have permission to view notifications. Contact your administrator if you need access." />
    );
  }

  if (notificationsQuery.isLoading && !notificationsQuery.data) {
    return <LoadingState message="Loading notifications…" />;
  }

  if (notificationsQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          notificationsQuery.error,
          'Failed to load notifications',
        )}
        onRetry={() => void notificationsQuery.refetch()}
        retrying={notificationsQuery.isFetching}
      />
    );
  }

  const notifications = notificationsQuery.data?.items ?? [];
  const meta = resolvePaginationMeta(
    notificationsQuery.data?.meta,
    notificationsQuery.data?.items?.length ?? 0,
    page,
    DEFAULT_PAGE_SIZE,
  );
  const unreadCount = meta.unreadCount ?? 0;
  const isRefreshing = notificationsQuery.isFetching && !notificationsQuery.isLoading;

  const inboxMeta =
    unreadCount > 0
      ? `${formatTotalLabel(meta.total, 'notification')} · ${unreadCount} unread`
      : formatTotalLabel(meta.total, 'notification');

  return (
    <PageShell wide>
      <PageHeader
        title="Notifications"
        description="Stay on top of expense approvals, budget alerts, and account updates."
        meta={activeTab === 'inbox' ? inboxMeta : 'Manage how you receive updates'}
        actions={
          activeTab === 'inbox' && caps.notification.mark ? (
            <Button
              variant="outline"
              disabled={unreadCount === 0 || readAllMutation.isPending}
              onClick={() => void readAllMutation.mutateAsync()}
            >
              <CheckIcon className="size-4" />
              {readAllMutation.isPending ? 'Marking…' : 'Mark all read'}
            </Button>
          ) : undefined
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setSearchParams(value === 'preferences' ? { tab: 'preferences' } : {}, { replace: true });
          if (value === 'inbox') {
            setPage(1);
          }
        }}
      >
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <FilterCard>
            <FormField label="Show" className="w-full sm:w-[200px]">
              <Select
                value={inboxFilter}
                onValueChange={(value) => {
                  setInboxFilter(value as InboxFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All notifications</SelectItem>
                  <SelectItem value="unread">Unread only</SelectItem>
                  <SelectItem value="read">Read only</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FilterCard>

          <DataCard
            title="Inbox"
            description={
              unreadOnly
                ? 'Notifications you have not opened yet'
                : readOnly
                  ? 'Notifications you have already read'
                  : 'Your most recent in-app notifications'
            }
            footer={
              shouldShowPagination(meta) ? (
                <TablePagination meta={meta} onPageChange={setPage} />
              ) : undefined
            }
          >
            {isRefreshing ? (
              <NotificationListSkeleton />
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={<AssetIcon src={notificationIconUrl} className="size-6" />}
                title={
                  unreadOnly
                    ? 'No unread notifications'
                    : readOnly
                      ? 'No read notifications'
                      : 'No notifications yet'
                }
                description={
                  unreadOnly
                    ? 'You have read everything in your inbox.'
                    : readOnly
                      ? 'Notifications you open will appear here.'
                      : 'When something needs your attention, it will show up here.'
                }
                action={
                  unreadOnly || readOnly ? (
                    <Button variant="outline" size="sm" onClick={() => setInboxFilter('all')}>
                      Show all notifications
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="divide-y divide-border/60">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.reference}
                    notification={notification}
                    canMarkRead={caps.notification.mark}
                    onMarkRead={(reference) => void readMutation.mutateAsync(reference)}
                    isMarkingRead={readMutation.isPending}
                  />
                ))}
              </ul>
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          {preferences.preferencesQuery.isLoading ? (
            <div className="rounded-lg border border-border/60 p-6">
              <Skeleton className="mb-4 h-5 w-40" />
              <Skeleton className="mb-6 h-4 w-full max-w-lg" />
              <div className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : preferences.preferencesQuery.isError ? (
            <ErrorState
              message={(preferences.preferencesQuery.error as Error).message}
              onRetry={() => void preferences.preferencesQuery.refetch()}
              retrying={preferences.preferencesQuery.isFetching}
            />
          ) : preferences.preferencesQuery.data ? (
            <NotificationPreferencesPanel
              preferences={preferences.preferencesQuery.data}
              isUpdating={preferences.isUpdating}
              canUpdate={caps.notification.update}
              onToggle={(input) => void preferences.updateMutation.mutateAsync(input)}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
