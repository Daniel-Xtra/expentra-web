import { DotsThreeVerticalIcon, ShieldCheckIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import arrowRightIconUrl from '@/assets/icons/arrow-right.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AssetIcon } from '@/shared/components/AssetIcon';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { formatLabel, formatRoleName } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';
import type { UserResponse } from '@/types/api';
import type { UseMutationResult } from '@tanstack/react-query';

type UpdateUserMutation = UseMutationResult<
  UserResponse,
  Error,
  {
    reference: string;
    roleReference?: string | null;
    departmentReference?: string | null;
    isActive?: boolean;
    displayName?: string;
  }
>;

function UserDisplayName({ user }: { user: UserResponse }) {
  if (user.firstName) {
    return (
      <>
        <span className="font-semibold">{user.firstName}</span>
        {user.lastName ? <span className="font-normal"> {user.lastName}</span> : null}
      </>
    );
  }

  return <span className="font-semibold">{formatUserName(user)}</span>;
}

function DetailArrow() {
  return (
    <AssetIcon
      src={arrowRightIconUrl}
      className="mx-1.5 inline-block size-3.5 shrink-0 align-middle"
    />
  );
}

function DetailSegment({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <p className="font-sans text-xs/[16.8px] text-black-400">
      {label}
      <DetailArrow />
      <span className={cn('font-semibold text-neutral-950', valueClassName)}>
        {value}
      </span>
    </p>
  );
}

type EmployeeActionsProps = {
  user: UserResponse;
  canUpdateUsers: boolean;
  onEditUser: (user: UserResponse) => void;
  updateUserMutation: UpdateUserMutation;
};

export function EmployeeActions({
  user,
  canUpdateUsers,
  onEditUser,
  updateUserMutation,
}: EmployeeActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Employee actions">
          <DotsThreeVerticalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/admin/users/${user.reference}`}>View profile</Link>
        </DropdownMenuItem>
        {canUpdateUsers ? (
          <>
            <DropdownMenuItem onClick={() => onEditUser(user)}>Edit employee</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                void updateUserMutation.mutateAsync({
                  reference: user.reference,
                  isActive: !user.isActive,
                })
              }
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type EmployeeCardProps = {
  user: UserResponse;
  canUpdateUsers: boolean;
  onEditUser: (user: UserResponse) => void;
  updateUserMutation: UpdateUserMutation;
};

export function EmployeeCard({
  user,
  canUpdateUsers,
  onEditUser,
  updateUserMutation,
}: EmployeeCardProps) {
  const departmentName = user.department?.name
    ? formatLabel(user.department.name)
    : 'Unassigned';
  const roleName = user.role?.name ? formatRoleName(user.role.name) : 'No role';

  return (
    <Card className="overflow-hidden rounded-xl border-black-50">
      <CardContent className="relative p-4 sm:p-5">
        <div className="absolute top-3 right-3">
          <EmployeeActions
            user={user}
            canUpdateUsers={canUpdateUsers}
            onEditUser={onEditUser}
            updateUserMutation={updateUserMutation}
          />
        </div>

        <div className="flex gap-4 pr-8">
          <Link to={`/admin/users/${user.reference}`} className="shrink-0">
            <UserAvatar user={user} size="xl" />
          </Link>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/admin/users/${user.reference}`}
                  className="font-sans text-sm text-neutral-950 hover:text-primary hover:underline"
                >
                  <UserDisplayName user={user} />
                </Link>
                {user.isEmailVerified ? (
                  <ShieldCheckIcon
                    className="size-4 shrink-0 text-success-800"
                    weight="fill"
                    aria-label="Email verified"
                  />
                ) : null}
                {user.isDepartmentManager ? (
                  <span className="rounded-full bg-primary-50 px-2.5 py-0.5 font-sans text-[10px] font-semibold tracking-wide text-primary-500 uppercase">
                    Manager
                  </span>
                ) : null}
              </div>
              <p className="mt-1 truncate font-sans text-xs/[16.8px] text-black-400">
                {user.email}
              </p>
            </div>

            <hr className="border-neutral-200" />

            <div className="space-y-1.5">
              <DetailSegment
                label="Reference"
                value={<ReferenceCell value={user.reference} variant="compact" />}
              />
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                <DetailSegment label="Department" value={departmentName} />
                <DetailSegment label="Role" value={roleName} />
              </div>
              <DetailSegment
                label="Status"
                value={user.isActive ? 'Active' : 'Inactive'}
                valueClassName={
                  user.isActive ? 'text-success-800' : 'text-black-400'
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
