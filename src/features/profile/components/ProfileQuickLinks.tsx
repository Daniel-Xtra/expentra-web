import { Link } from 'react-router-dom';
import { ArrowRightIcon, BuildingsIcon, ReceiptIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import notificationIconUrl from '@/assets/icons/notification.png';
import { Card, CardContent } from '@/components/ui/card';
import { AssetIcon } from '@/shared/components/AssetIcon';

type ProfileQuickLinksProps = {
  canReadNotifications: boolean;
  departmentOverviewPath?: string;
  variant?: 'grid' | 'stack';
};

type QuickLink = {
  to: string;
  label: string;
  icon: ReactNode;
  show: boolean;
  description?: string;
};

export function ProfileQuickLinks({
  canReadNotifications,
  departmentOverviewPath,
  variant = 'grid',
}: ProfileQuickLinksProps) {
  const links: QuickLink[] = [
    {
      to: '/expenses',
      label: 'My expenses',
      icon: <ReceiptIcon className="size-4 shrink-0 text-muted-foreground" />,
      show: true,
    },
    {
      to: departmentOverviewPath ?? '/department-overview',
      label: 'Department overview',
      icon: <BuildingsIcon className="size-4 shrink-0 text-muted-foreground" />,
      show: Boolean(departmentOverviewPath),
    },
    {
      to: '/notifications',
      label: 'Notifications',
      description: 'Inbox and delivery preferences',
      icon: <AssetIcon src={notificationIconUrl} className="size-4 shrink-0" />,
      show: canReadNotifications,
    },
  ].filter((link) => link.show);

  if (links.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/60">
      <CardContent className="py-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Quick links</h2>
        <div
          className={
            variant === 'stack' ? 'flex flex-col gap-2' : 'grid gap-2 sm:grid-cols-2 lg:grid-cols-3'
          }
        >
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3 hover:bg-muted/50"
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {link.icon}
                  {link.label}
                </span>
                {link.description ? (
                  <span className="mt-0.5 block pl-6 text-xs text-muted-foreground">
                    {link.description}
                  </span>
                ) : null}
              </span>
              <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
