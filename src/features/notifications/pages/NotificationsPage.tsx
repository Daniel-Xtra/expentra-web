import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { QueryStatus } from '@/shared/components/QueryStatus';
import { TablePagination } from '@/shared/components/TablePagination';
import { AppIcon } from '@/shared/reusable/AppIcon';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { DEFAULT_PAGE_SIZE, resolvePaginationMeta, shouldShowPagination } from '@/shared/lib/pagination';
import { hasNavAccess, NOTIFICATION_READ_ACCESS } from '@/shared/navigation';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api';
import { queryKeys, invalidateNotifications } from '@/shared/api/query-keys';
import { useNotificationPreferences } from '@/features/notifications/hooks/use-notification-preferences';
import { NotificationItem } from '../components/NotificationItem';
import { NotificationPreferencesPanel } from '../components/NotificationPreferencesPanel';

type InboxFilter = 'all' | 'unread' | 'read';

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
  const [markingReference, setMarkingReference] = useState<string | null>(null);
  const unreadOnly = inboxFilter === 'unread';
  const readOnly = inboxFilter === 'read';

  const preferences = useNotificationPreferences(canReadNotifications);

  useEffect(() => {
    const nextTab = tabParam === 'preferences' ? 'preferences' : 'inbox';
    setTimeout(() => {
      setActiveTab(nextTab);
    }, 0);
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
    placeholderData: (previous) => previous,
  });

  const readMutation = useMutation({
    mutationFn: (reference: string) => markNotificationRead(reference),
    onMutate: (reference) => {
      setMarkingReference(reference);
    },
    onSuccess: async () => {
      await invalidateNotifications(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to mark notification as read'),
    onSettled: () => {
      setMarkingReference(null);
    },
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

  const isInitialLoading = notificationsQuery.isLoading && !notificationsQuery.data;
  const notifications = notificationsQuery.data?.items ?? [];
  const meta = resolvePaginationMeta(
    notificationsQuery.data?.meta,
    notificationsQuery.data?.items?.length ?? 0,
    page,
    DEFAULT_PAGE_SIZE,
  );
  const unreadCount = meta.unreadCount ?? 0;
  const isRefreshing = notificationsQuery.isFetching && !notificationsQuery.isLoading;

  return (
    <PageShell wide>
      <PageHeader
        title="Notifications"
        description={
          activeTab === 'preferences'
            ? 'Choose in-app and email alerts.'
            : 'Approvals, payouts, budgets, and account updates.'
        }
        actions={
          activeTab === 'inbox' && caps.notification.mark ? (
            <Button
              className="h-11 bg-primary-500 px-7 text-sm font-normal"
              disabled={unreadCount === 0 || readAllMutation.isPending || isInitialLoading}
              onClick={() => void readAllMutation.mutateAsync()}
            >
              <CheckIcon className="size-4" />
              {readAllMutation.isPending ? 'Marking…' : 'Mark all read'}
            </Button>
          ) : undefined
        }
      />

      <QueryStatus query={notificationsQuery} loadingMessage="Loading notifications…">
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Show</span>
            <Select
              value={inboxFilter}
              onValueChange={(value) => {
                setInboxFilter(value as InboxFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[9rem]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            {notifications.length === 0 ? (
              <EmptyState
                icon={<AppIcon icon="notification" className="size-6" />}
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
              <ul
                className={cn(
                  'divide-y divide-border/60',
                  isRefreshing && 'opacity-70',
                )}
                aria-busy={isRefreshing}
              >
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.reference}
                    notification={notification}
                    canMarkRead={caps.notification.mark}
                    onMarkRead={(reference) => void readMutation.mutateAsync(reference)}
                    isMarkingRead={markingReference === notification.reference}
                  />
                ))}
              </ul>
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <QueryStatus query={preferences.preferencesQuery} loadingMessage="Loading preferences…">
            {preferences.preferencesQuery.data ? (
              <NotificationPreferencesPanel
                preferences={preferences.preferencesQuery.data}
                isUpdating={preferences.isUpdating}
                canUpdate={caps.notification.update}
                onToggle={(input) => void preferences.updateMutation.mutateAsync(input)}
              />
            ) : null}
          </QueryStatus>
        </TabsContent>
      </Tabs>
      </QueryStatus>
    </PageShell>
  );
}
