import { NavLink } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePendingApprovalCount } from '@/features/approvals/hooks/use-pending-approval-count';
import { usePendingPayoutsCount } from '@/features/payouts/hooks/use-pending-payouts-count';
import { useVisibleNavSections } from '@/shared/hooks/use-visible-nav-sections';
import type { NavItem } from '@/shared/navigation';
import { BrandLogo } from './BrandLogo';
import { LoadingState } from './LoadingState';
import { navIconFallback, navIconMap } from './nav-icon-map';

const SIDEBAR_WIDTH = 260;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

function NavItemLink({
  item,
  badgeCount,
}: {
  item: NavItem;
  badgeCount?: number;
}) {
  const Icon = navIconMap[item.to] ?? navIconFallback;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
          isActive
            ? 'bg-success-50 text-foreground [&_svg]:text-success-800'
            : 'text-sidebar-foreground hover:bg-muted/70 hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={16}
            weight={isActive ? 'duotone' : 'regular'}
            className="shrink-0"
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {badgeCount != null && badgeCount > 0 && (
            <span className="flex size-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
              {badgeCount > 9 ? '9+' : badgeCount}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function badgeForNavItem(
  to: string,
  pendingApprovals: number,
  pendingPayouts: number,
): number | undefined {
  if (to === '/approvals') {
    return pendingApprovals;
  }
  if (to === '/payouts') {
    return pendingPayouts;
  }
  return undefined;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { sections, isAuthorizationPending } = useVisibleNavSections();
  const { pendingCount: pendingApprovals } = usePendingApprovalCount(
    !isAuthorizationPending,
  );
  const { pendingCount: pendingPayouts } = usePendingPayoutsCount(
    !isAuthorizationPending,
  );

  return (
    <div className="flex h-full flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
        <BrandLogo variant="lockup" size="sm" href="/dashboard" />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {isAuthorizationPending ? (
          <LoadingState message="Loading navigation…" />
        ) : sections.length === 0 ? (
          <p className="px-3 text-xs text-muted-foreground">
            No pages are available for your role yet.
          </p>
        ) : (
          sections.map((section) => (
            <div key={section.title ?? 'main'} className="space-y-1">
              {section.title && (
                <p className="px-3 py-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <div key={item.to} onClick={onNavigate}>
                  <NavItemLink
                    item={item}
                    badgeCount={badgeForNavItem(
                      item.to,
                      pendingApprovals,
                      pendingPayouts,
                    )}
                  />
                </div>
              ))}
            </div>
          ))
        )}
      </nav>
    </div>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden md:block"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <SidebarContent />
      </aside>

      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent side="left" className="w-[280px] p-0 sm:max-w-[280px]">
          <SidebarContent onNavigate={onClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}
