import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HouseIcon,
  ListIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useUnreadNotifications } from '@/features/notifications/hooks/use-unread-notifications';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getBreadcrumbs } from '@/shared/lib/breadcrumbs';
import { hasNavAccess, NOTIFICATION_READ_ACCESS } from '@/shared/navigation';
import { AppIcon } from '@/shared/reusable/AppIcon';
import { NavbarProfileDropdown } from '@/shared/components/NavbarProfileDropdown';

type TopBarProps = {
  onMenuClick: () => void;
};


export function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const { user, authorization, signOut } = useAuth();
  const canReadNotifications = hasNavAccess(
    authorization?.capabilities,
    NOTIFICATION_READ_ACCESS,
  );
  const { unreadCount } = useUnreadNotifications(canReadNotifications);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-3 md:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <ListIcon className="size-4" />
        </Button>

        <Breadcrumb className="hidden min-w-0 sm:block">
          <BreadcrumbList className="flex-nowrap gap-1 text-xs">
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={`${crumb.label}-${index}`}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link
                        to={crumb.href}
                        className="inline-flex cursor-pointer items-center gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        {index === 0 && <HouseIcon className="size-3.5" />}
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="font-semibold text-foreground">
                      {index === 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                          <HouseIcon className="size-3.5 text-muted-foreground" />
                          {crumb.label}
                        </span>
                      ) : (
                        crumb.label
                      )}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <p className="truncate text-sm font-semibold text-foreground sm:hidden">
          {breadcrumbs[breadcrumbs.length - 1]?.label ?? 'Expentra'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          {canReadNotifications && (
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted/60"
            >
              <AppIcon icon="notification" className="size-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          <div className="mx-1 h-8 w-px bg-border" aria-hidden />
        </div>

        {canReadNotifications && (
          <Button variant="ghost" size="icon-sm" className="relative sm:hidden" asChild>
            <Link to="/notifications" aria-label="Notifications">
              <AppIcon icon="notification" className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </Button>
        )}

        <NavbarProfileDropdown
          user={user}
          authorization={authorization}
          onSignOut={signOut}
        />
      </div>
    </header>
  );
}
