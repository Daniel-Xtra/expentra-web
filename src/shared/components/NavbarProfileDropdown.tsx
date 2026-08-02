import { Link } from 'react-router-dom';
import { CaretRightIcon } from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppIcon } from '@/shared/reusable/AppIcon';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { cn } from '@/lib/utils';
import { formatUserName, resolveRoleLabel } from '@/shared/utils/user';
import type { AuthorizationMe, UserResponse } from '@/types/api';

type NavbarProfileDropdownProps = {
  user?: UserResponse | null;
  authorization?: AuthorizationMe | null;
  onSignOut: () => void;
};

function ProfileName({ user }: { user?: UserResponse | null }) {
  if (user?.firstName) {
    return (
      <>
        <span className="font-semibold">{user.firstName}</span>
        {user.lastName ? <span className="font-normal"> {user.lastName}</span> : null}
      </>
    );
  }

  return <span className="font-semibold">{formatUserName(user)}</span>;
}

function MenuIcon({ icon }: { icon: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/70">
      <AppIcon icon={icon} className="size-4" />
    </span>
  );
}

export function NavbarProfileDropdown({
  user,
  authorization,
  onSignOut,
}: NavbarProfileDropdownProps) {
  const roleLabel = resolveRoleLabel(authorization, user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent py-1 pl-1 pr-2 transition-colors hover:border-border/60 hover:bg-muted/40"
        >
          <UserAvatar user={user} size="md" />

          <div className="hidden min-w-0 text-left md:block">
            <p className="max-w-[148px] truncate text-sm leading-tight text-neutral-950">
              <ProfileName user={user} />
            </p>
            <p className="max-w-[148px] truncate text-xs leading-tight text-black-400">
              {roleLabel}
            </p>
          </div>

          <AppIcon icon="arrow-down" className="size-6 shrink-0 opacity-80" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={cn(
          'w-60 overflow-hidden rounded-lg border border-border/60 bg-popover p-1.5 shadow-md',
          'data-[side=bottom]:slide-in-from-top-1',
        )}
      >
        <DropdownMenuItem asChild className="rounded-md px-2.5 py-2 focus:bg-muted/60">
          <Link to="/profile" className="flex w-full items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <MenuIcon icon="settings" />
              <span className="text-sm font-medium text-foreground">Account settings</span>
            </span>
            <CaretRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5 bg-border/70" />

        <div className="px-1 pb-1">
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-destructive/25 bg-background text-sm font-medium text-destructive transition-colors hover:border-destructive/40 hover:bg-destructive/5"
          >
            Logout
            <AppIcon icon="logout" className="size-4" />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
