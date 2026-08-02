import { ArrowRightIcon, DotIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { formatRelativeTime } from '@/shared/utils/format';
import type { NotificationResponse } from '@/types/api';
import { getNotificationDisplay } from '../notification-display';

type NotificationItemProps = {
  notification: NotificationResponse;
  onMarkRead: (reference: string) => void;
  isMarkingRead: boolean;
  canMarkRead?: boolean;
};

export function NotificationItem({
  notification,
  onMarkRead,
  isMarkingRead,
  canMarkRead = true,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const caps = useActionCapabilities();
  const isUnread = !notification.readAt;
  const display = getNotificationDisplay(notification, {
    canReadBudgets: caps.budget.read,
  });
  const Icon = display.icon;
  const hasHref = Boolean(display.href);

  const handleOpen = () => {
    if (isMarkingRead) {
      return;
    }

    if (isUnread && canMarkRead) {
      onMarkRead(notification.reference);
    }

    if (display.href) {
      navigate(display.href);
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleOpen}
        disabled={isMarkingRead}
        aria-label={
          hasHref
            ? display.hrefLabel ?? 'Open notification'
            : isUnread && canMarkRead
              ? 'Mark as read'
              : 'Notification'
        }
        className={cn(
          'flex w-full cursor-pointer items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/40',
          isUnread && 'bg-primary/[0.03]',
          !hasHref && isUnread && canMarkRead && 'cursor-pointer',
          !hasHref && (!isUnread || !canMarkRead) && 'cursor-default',
        )}
      >
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            display.iconClassName,
          )}
        >
          <Icon className="size-5" weight="duotone" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="h-5 px-2 text-[10px] font-medium tracking-wide uppercase">
              {display.category}
            </Badge>
            {isUnread && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                <DotIcon className="size-4" weight="fill" aria-hidden />
                Unread
              </span>
            )}
            <span className="ml-auto text-[11px] text-muted-foreground">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>

          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">{display.title}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{display.body}</p>
          </div>

          {hasHref && display.hrefLabel ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              {display.hrefLabel}
              <ArrowRightIcon className="size-3.5" aria-hidden />
            </span>
          ) : null}

          {!hasHref && isUnread && canMarkRead ? (
            <span className="text-xs font-medium text-muted-foreground">Mark as read</span>
          ) : null}
        </div>
      </button>
    </li>
  );
}
