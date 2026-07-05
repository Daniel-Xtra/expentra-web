import { DotsThreeVerticalIcon, PlusIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { FilterCard } from '@/shared/components/FilterCard';
import { SearchField } from '@/shared/components/SearchField';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { TablePagination } from '@/shared/components/TablePagination';
import { shouldShowPagination } from '@/shared/lib/pagination';
import { StatusPill } from '@/shared/components/StatusPill';
import { formatRoleName } from '@/shared/utils/format';
import type { PaginationMeta, RoleResponse } from '@/types/api';

type RolesTabProps = {
  search: string;
  onSearchChange: (value: string) => void;
  roles: RoleResponse[];
  rolesQueryError: Error | null;
  onRetryRoles?: () => void;
  rolesRetrying?: boolean;
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onCreateRole: () => void;
  onEditRole: (role: RoleResponse) => void;
  onEditPermissions: (reference: string) => void;
  onDeleteRole: (role: RoleResponse) => void;
  canCreateRole?: boolean;
  canUpdateRole?: boolean;
  canEditPermissions?: boolean;
  canDeleteRole?: boolean;
};

export function RolesTab({
  search,
  onSearchChange,
  roles,
  rolesQueryError,
  onRetryRoles,
  rolesRetrying,
  meta,
  onPageChange,
  onCreateRole,
  onEditRole,
  onEditPermissions,
  onDeleteRole,
  canCreateRole = true,
  canUpdateRole = true,
  canEditPermissions = true,
  canDeleteRole = true,
}: RolesTabProps) {
  const hasRowActions = canUpdateRole || canEditPermissions || canDeleteRole;

  return (
    <div className="space-y-4">
      <FilterCard>
        <SearchField
          placeholder="Search roles by reference, name, or description"
          value={search}
          onValueChange={onSearchChange}
        />
      </FilterCard>

      {rolesQueryError ? (
        <ErrorState
          message={rolesQueryError.message}
          onRetry={onRetryRoles}
          retrying={rolesRetrying}
        />
      ) : roles.length === 0 ? (
        <EmptyState
          title={search ? 'No roles found' : 'No roles yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Create a role to define permissions for your team.'
          }
          action={
            canCreateRole ? (
              <Button onClick={onCreateRole}>
                <PlusIcon className="size-4" />
                Create Roles
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.reference}>
                  <TableCell>
                    <ReferenceCell value={role.reference} />
                  </TableCell>
                  <TableCell className="font-medium">{formatRoleName(role.name)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.permissionCount ?? 0}
                  </TableCell>
                  <TableCell>
                    <StatusPill active />
                  </TableCell>
                  <TableCell className="text-right">
                    {hasRowActions ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Role actions">
                            <DotsThreeVerticalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canUpdateRole && (
                            <DropdownMenuItem onClick={() => onEditRole(role)}>
                              Edit role
                            </DropdownMenuItem>
                          )}
                          {canEditPermissions && (
                            <DropdownMenuItem onClick={() => void onEditPermissions(role.reference)}>
                              Edit permissions
                            </DropdownMenuItem>
                          )}
                          {canDeleteRole && (canUpdateRole || canEditPermissions) && (
                            <DropdownMenuSeparator />
                          )}
                          {canDeleteRole && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDeleteRole(role)}
                            >
                              Delete role
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {shouldShowPagination(meta) ? (
            <TablePagination meta={meta} onPageChange={onPageChange} />
          ) : null}
        </Card>
      )}
    </div>
  );
}
