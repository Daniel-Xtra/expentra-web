import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowSquareOutIcon,
  DownloadSimpleIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateDepartmentDialog } from '@/features/departments/components/DepartmentFormDialogs';
import { DepartmentHealthBadge } from '@/features/departments/components/DepartmentHealthBadge';
import { DepartmentOverviewCard } from '@/features/departments/components/DepartmentOverviewCard';
import { DepartmentStatusBadge } from '@/features/departments/components/DepartmentStatusBadge';
import { DepartmentStatusSummary } from '@/features/departments/components/DepartmentStatusSummary';
import {
  departmentFormSchema,
  NO_MANAGER_VALUE,
  type DepartmentFormValues,
} from '@/features/departments/department-form';
import {
  DEPARTMENTS_ALL_VALUE,
  useDepartmentsList,
} from '@/features/departments/hooks/use-departments-list';
import { useCreateDepartmentMutation } from '@/features/departments/hooks/use-department-mutations';
import { DataCard } from '@/shared/components/DataCard';
import { FilterCard } from '@/shared/components/FilterCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { FormField } from '@/shared/components/FormField';
import { SearchField } from '@/shared/components/SearchField';
import { LoadingState } from '@/shared/components/LoadingState';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { TablePagination } from '@/shared/components/TablePagination';
import {
  DEFAULT_PAGE_SIZE,
  formatTotalLabel,
  resolvePaginationMeta,
  shouldShowPagination,
} from '@/shared/lib/pagination';
import { formatDate } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';
import type { DepartmentListSortField } from '@/types/api';

const sortOptions: Array<{ value: DepartmentListSortField; label: string }> = [
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Created' },
  { value: 'headcount', label: 'Team size' },
  { value: 'pendingApprovals', label: 'Pending approvals' },
  { value: 'utilizationPercent', label: 'Budget utilization' },
];

export function DepartmentsPage() {
  const { department } = useActionCapabilities();
  const [showForm, setShowForm] = useState(false);
  const list = useDepartmentsList();

  const createForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: { name: '', code: '', managerReference: NO_MANAGER_VALUE },
  });

  const createMutation = useCreateDepartmentMutation({
    setError: createForm.setError,
    onSuccess: () => {
      createForm.reset({ name: '', code: '', managerReference: NO_MANAGER_VALUE });
      setShowForm(false);
    },
  });

  if (list.departmentsQuery.isLoading && !list.departmentsQuery.data) {
    return <LoadingState message="Loading departments…" />;
  }

  if (list.departmentsQuery.isError) {
    return (
      <ErrorState
        message={(list.departmentsQuery.error as Error).message}
        onRetry={() => void list.departmentsQuery.refetch()}
        retrying={list.departmentsQuery.isFetching}
      />
    );
  }

  const departments = list.departmentsQuery.data?.items ?? [];
  const meta = resolvePaginationMeta(
    list.departmentsQuery.data?.meta,
    departments.length,
    list.page,
    DEFAULT_PAGE_SIZE,
  );

  const counts = list.statusCountsQuery.data;
  const overviewStats = counts
    ? {
        total: counts.total,
        activeCount: counts.active,
        inactiveCount: counts.inactive,
        withManagerCount: counts.total - counts.missingManager,
      }
    : null;

  const hasActiveFilters = list.search.trim() !== '' || list.statusFilter !== DEPARTMENTS_ALL_VALUE;

  return (
    <PageShell wide className="gap-6">
      <PageHeader
        title="Departments"
        description={
          meta.total > 0 ? formatTotalLabel(meta.total, 'department') : undefined
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {department.export ? (
              <Button
                variant="outline"
                className="h-11 font-normal text-sm px-7 text-[#414651] hover:bg-white"
                disabled={list.exportMutation.isPending}
                onClick={() => void list.exportMutation.mutateAsync()}
              >
                <DownloadSimpleIcon className="size-4" />
                {list.exportMutation.isPending ? 'Exporting…' : 'Export Departments'}
              </Button>
            ) : null}
            {department.create ? (
              <Button className="h-11 font-normal text-sm px-7 bg-primary-500" onClick={() => setShowForm(true)}>
                <PlusIcon className="size-4" />
                Add department
              </Button>
            ) : null}
          </div>
        }
      />

      <DepartmentOverviewCard
        stats={overviewStats}
        isLoading={list.statusCountsQuery.isLoading && !counts}
      />

      <DepartmentStatusSummary
        counts={counts}
        activeFilter={list.statusFilter}
        onFilterChange={(value) => {
          list.setStatusFilter(value);
          list.setPage(1);
        }}
        isLoading={list.statusCountsQuery.isLoading}
      />

      <CreateDepartmentDialog
        open={showForm}
        onOpenChange={setShowForm}
        form={createForm}
        loading={createMutation.isPending}
        onSubmit={createForm.handleSubmit((values) => createMutation.mutateAsync(values))}
      />

      <FilterCard>
        <SearchField
          placeholder="Search departments by reference, name, or code"
          value={list.search}
          onValueChange={(value) => {
            list.setSearch(value);
            list.setPage(1);
          }}
        />
        <FormField className="min-w-[160px]">
          <Select
            value={list.sortBy}
            onValueChange={(value) => {
              list.setSortBy(value as DepartmentListSortField);
              list.setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField className="min-w-[120px]">
          <Select
            value={list.sortOrder}
            onValueChange={(value) => {
              list.setSortOrder(value as 'ASC' | 'DESC');
              list.setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASC">Ascending</SelectItem>
              <SelectItem value="DESC">Descending</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FilterCard>

      <DataCard
        footer={
          shouldShowPagination(meta) ? (
            <TablePagination meta={meta} onPageChange={list.setPage} />
          ) : undefined
        }
      >
        {departments.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? 'No departments found' : 'No departments yet'}
            description={
              hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'Add your first department to organize teams.'
            }
            action={
              department.create ? (
                <Button onClick={() => setShowForm(true)}>Add department</Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12 text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.reference}>
                  <TableCell>
                    <Link
                      to={`/admin/departments/${dept.reference}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {dept.name}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{dept.code}</p>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      {dept.hasManager && dept.manager ? (
                        <>
                          <Link
                            to={`/admin/users/${dept.manager.reference}`}
                            className="font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {formatUserName(dept.manager)}
                          </Link>
                          {dept.manager.email && (
                            <p className="truncate text-xs text-muted-foreground">
                              {dept.manager.email}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-destructive">No manager</p>
                          <p className="text-xs text-muted-foreground">
                            Expense submission blocked
                          </p>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {dept.headcount ?? '—'}
                  </TableCell>
                  <TableCell>
                    {dept.pendingApprovalCount > 0 ? (
                      <Link
                        to="/approvals"
                        className="font-medium text-primary hover:underline"
                      >
                        {dept.pendingApprovalCount}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DepartmentHealthBadge department={dept} />
                  </TableCell>
                  <TableCell>
                    <DepartmentStatusBadge isActive={dept.isActive} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(dept.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" asChild aria-label={`View ${dept.name}`}>
                      <Link to={`/admin/departments/${dept.reference}`}>
                        <ArrowSquareOutIcon className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataCard>
    </PageShell>
  );
}
