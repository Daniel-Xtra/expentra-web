import { Link } from 'react-router-dom';
import arrowDownIconUrl from '@/assets/icons/arrow-down.png';
import logoutIconUrl from '@/assets/icons/logout.png';
import settingsIconUrl from '@/assets/icons/settings.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AssetIcon } from '@/shared/components/AssetIcon';
import { UserAvatar } from '@/shared/components/UserAvatar';
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
          className="flex cursor-pointer items-center gap-3 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-muted/60"
        >
          <UserAvatar user={user} size="md" />

          <div className="hidden min-w-0 text-left md:block">
            <p className="max-w-[140px] truncate font-sans text-sm text-neutral-950">
              <ProfileName user={user} />
            </p>
            <p className="max-w-[140px] truncate font-sans text-xs/[16.8px] font-normal text-black-400">
              {roleLabel}
            </p>
          </div>

          <AssetIcon src={arrowDownIconUrl} className="size-7 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="truncate text-xs font-medium text-foreground">
            <ProfileName user={user} />
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{roleLabel}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <AssetIcon src={settingsIconUrl} className="size-3.5" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void onSignOut()}>
          <AssetIcon src={logoutIconUrl} className="size-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
