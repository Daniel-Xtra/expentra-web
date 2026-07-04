import { BriefcaseIcon, DotsThreeVerticalIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserStatusSummary } from '@/features/users/components/UserStatusSummary';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { FilterCard } from '@/shared/components/FilterCard';
import { SearchField } from '@/shared/components/SearchField';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { SimplePagination } from '@/shared/components/SimplePagination';
import { StatusPill } from '@/shared/components/StatusPill';
import { ViewModeToggle, type ViewMode } from '@/shared/components/ViewModeToggle';
import { formatLabel, formatRoleName } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';
import type { DepartmentResponse, RoleResponse, UserResponse } from '@/types/api';
import type { UseMutationResult } from '@tanstack/react-query';

type EmployeesTabProps = {
  canUpdateUsers: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  departments: DepartmentResponse[];
  allRoles: RoleResponse[];
  users: UserResponse[];
  usersQueryError: Error | null;
  onRetryUsers?: () => void;
  usersRetrying?: boolean;
  statusCounts?: { total: number; active: number; inactive: number; unassignedDepartment: number };
  statusCountsLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedUsers: string[];
  onToggleUser: (reference: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onEditUser: (user: UserResponse) => void;
  updateUserMutation: UseMutationResult<
    UserResponse,
    Error,
    {
      reference: string;
      roleReference?: string | null;
      departmentReference?: string | null;
      isActive?: boolean;
    }
  >;
  bulkDeactivateMutation: UseMutationResult<void, Error, string[]>;
};

export function EmployeesTab({
  canUpdateUsers,
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  users,
  usersQueryError,
  onRetryUsers,
  usersRetrying,
  statusCounts,
  statusCountsLoading,
  page,
  totalPages,
  onPageChange,
  selectedUsers,
  onToggleUser,
  onToggleAll,
  onEditUser,
  updateUserMutation,
  bulkDeactivateMutation,
}: EmployeesTabProps) {
  return (
    <div className="space-y-4">
      <UserStatusSummary
        counts={statusCounts}
        activeFilter={statusFilter}
        onFilterChange={onStatusFilterChange}
        isLoading={statusCountsLoading}
      />

      <FilterCard>
        <SearchField
          placeholder="Search employees by reference, name, or email"
          value={search}
          onValueChange={onSearchChange}
        />
        <div className="flex items-center">
          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      </FilterCard>

      {selectedUsers.length > 0 && canUpdateUsers ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {selectedUsers.length} employee{selectedUsers.length === 1 ? '' : 's'} selected
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={bulkDeactivateMutation.isPending}
            onClick={() => void bulkDeactivateMutation.mutateAsync(selectedUsers)}
          >
            Deactivate selected
          </Button>
        </div>
      ) : null}

      {usersQueryError ? (
        <ErrorState
          message={usersQueryError.message}
          onRetry={onRetryUsers}
          retrying={usersRetrying}
        />
      ) : users.length === 0 ? (
        <EmptyState
          title="No employees found"
          description={
            search ? 'Try a different search term.' : 'No team members are registered yet.'
          }
        />
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {users.map((user) => (
                <EmployeeCard
                  key={user.reference}
                  user={user}
                  canUpdateUsers={canUpdateUsers}
                  onEditUser={onEditUser}
                  updateUserMutation={updateUserMutation}
                />
              ))}
            </div>
          ) : (
            <Card className="border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    {canUpdateUsers ? (
                      <TableHead className="w-10">
                        <input
                          type="checkbox"
                          aria-label="Select all employees"
                          checked={users.length > 0 && selectedUsers.length === users.length}
                          onChange={(event) => onToggleAll(event.target.checked)}
                        />
                      </TableHead>
                    ) : null}
                    <TableHead>Reference</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.reference}>
                      {canUpdateUsers ? (
                        <TableCell>
                          <input
                            type="checkbox"
                            aria-label={`Select ${formatUserName(user)}`}
                            checked={selectedUsers.includes(user.reference)}
                            onChange={(event) =>
                              onToggleUser(user.reference, event.target.checked)
                            }
                          />
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <ReferenceCell value={user.reference} />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          to={`/admin/users/${user.reference}`}
                          className="hover:text-primary hover:underline"
                        >
                          {formatUserName(user)}
                        </Link>
                        {user.isDepartmentManager ? (
                          <span className="ml-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            Manager
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        {user.department?.name ? (
                          <Link
                            to={`/admin/departments/${user.department.reference}`}
                            className="text-foreground hover:text-primary hover:underline"
                          >
                            {formatLabel(user.department.name)}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {user.role?.name ? formatRoleName(user.role.name) : '—'}
                      </TableCell>
                      <TableCell>
                        <StatusPill active={user.isActive} />
                      </TableCell>
                      <TableCell className="text-right">
                        <EmployeeActions
                          user={user}
                          canUpdateUsers={canUpdateUsers}
                          onEditUser={onEditUser}
                          updateUserMutation={updateUserMutation}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
          <SimplePagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
}

type EmployeeActionsProps = {
  user: UserResponse;
  canUpdateUsers: boolean;
  onEditUser: (user: UserResponse) => void;
  updateUserMutation: EmployeesTabProps['updateUserMutation'];
};

function EmployeeActions({
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
  updateUserMutation: EmployeesTabProps['updateUserMutation'];
};

function EmployeeCard({ user, canUpdateUsers, onEditUser, updateUserMutation }: EmployeeCardProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="relative space-y-3 py-4">
        <div className="absolute top-2 right-2">
          <EmployeeActions
            user={user}
            canUpdateUsers={canUpdateUsers}
            onEditUser={onEditUser}
            updateUserMutation={updateUserMutation}
          />
        </div>

        <div className="pr-8">
          <Link
            to={`/admin/users/${user.reference}`}
            className="font-semibold text-foreground hover:text-primary hover:underline"
          >
            {formatUserName(user)}
          </Link>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill active={user.isActive} />
          {user.isDepartmentManager ? (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Manager
            </span>
          ) : null}
          {user.department?.name && (
            <Link
              to={`/admin/departments/${user.department.reference}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <BriefcaseIcon className="size-3" />
              {formatLabel(user.department.name)}
            </Link>
          )}
          {user.role?.name && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              {formatRoleName(user.role.name)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
