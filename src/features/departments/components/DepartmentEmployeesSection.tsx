import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowSquareOutIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchInput } from '@/shared/components/SearchInput';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  listDepartmentUsers,
  listManagedDepartmentUsers,
} from '@/features/departments/api';
import { queryKeys } from '@/shared/api/query-keys';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { StatusPill } from '@/shared/components/StatusPill';
import { TablePagination } from '@/shared/components/TablePagination';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { DEFAULT_PAGE_SIZE, resolvePaginationMeta, shouldShowPagination } from '@/shared/lib/pagination';
import { formatRoleName } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';

type DepartmentEmployeesSectionProps = {
  departmentReference: string;
  managerReference?: string | null;
  readOnly?: boolean;
  managed?: boolean;
};

function EmployeesTableSkeleton() {
  return (
    <div className="space-y-3 px-4 py-4 sm:px-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DepartmentEmployeesSection({
  departmentReference,
  managerReference,
  readOnly = false,
  managed = false,
}: DepartmentEmployeesSectionProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);

  const employeesQuery = useQuery({
    queryKey: queryKeys.departments.employees(departmentReference, managed, {
      debouncedSearch,
      page,
    }),
    queryFn: () => {
      const params = {
        page,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
      };
      return managed
        ? listManagedDepartmentUsers(departmentReference, params)
        : listDepartmentUsers(departmentReference, params);
    },
    placeholderData: keepPreviousData,
  });

  const employees = employeesQuery.data?.items ?? [];
  const total = employeesQuery.data?.meta?.total;
  const meta = resolvePaginationMeta(
    employeesQuery.data?.meta,
    employees.length,
    page,
    DEFAULT_PAGE_SIZE,
  );

  return (
    <Card className="overflow-hidden border-border/60">
      <div className="border-b border-border/50 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <UsersThreeIcon className="size-5" weight="duotone" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">Team members</h2>
                {typeof total === 'number' && !employeesQuery.isLoading && (
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {total}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Members assigned to this department
              </p>
            </div>
          </div>

          {!readOnly ? (
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <Link to={`/admin/users?department=${departmentReference}`}>
                Manage team
                <ArrowSquareOutIcon className="size-3.5" />
              </Link>
            </Button>
          ) : null}
        </div>

        <SearchInput
          containerClassName="mt-4 max-w-md"
          placeholder="Search by reference, name, or email"
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
      </div>

      <CardContent className="p-0">
        {employeesQuery.isLoading && !employeesQuery.data ? (
          <EmployeesTableSkeleton />
        ) : employeesQuery.isError ? (
          <div className="p-6">
            <ErrorState
              message={(employeesQuery.error as Error).message}
              onRetry={() => void employeesQuery.refetch()}
              retrying={employeesQuery.isFetching}
            />
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            icon={<UsersThreeIcon className="size-8 text-muted-foreground" />}
            title={search.trim() ? 'No employees found' : 'No employees assigned'}
            description={
              search.trim()
                ? 'Try a different name or email.'
                : readOnly
                  ? 'No employees are currently assigned to this department.'
                  : 'Assign employees to this department from Users.'
            }
          
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const isManager = Boolean(
                  managerReference && employee.reference === managerReference,
                );

                return (
                  <TableRow key={employee.reference}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar user={employee} size="sm" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/admin/users/${employee.reference}`}
                              className="font-medium text-foreground hover:text-primary hover:underline"
                            >
                              {formatUserName(employee)}
                            </Link>
                            {isManager && (
                              <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                                Manager
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {employee.reference}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{employee.email}</TableCell>
                    <TableCell>
                      {employee.role?.name ? (
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                          {formatRoleName(employee.role.name)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusPill active={employee.isActive} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {shouldShowPagination(meta) ? (
        <TablePagination meta={meta} onPageChange={setPage} />
      ) : null}
    </Card>
  );
}
