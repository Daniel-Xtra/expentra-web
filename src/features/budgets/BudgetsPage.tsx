import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BudgetHealthSummary,
} from '@/features/budgets/components/BudgetHealthSummary';
import { BudgetOrgSummaryStrip } from '@/features/budgets/components/BudgetOrgSummaryStrip';
import { BudgetFilters } from '@/features/budgets/components/BudgetFilters';
import { BudgetsTable } from '@/features/budgets/components/BudgetsTable';
import {
  CreateBudgetDialog,
  EditBudgetDialog,
} from '@/features/budgets/components/BudgetFormDialogs';
import {
  ALL_VALUE,
  buildDepartmentRowsFromBudgets,
  buildYearOptions,
} from '@/features/budgets/constants';
import { useBudgetMutations } from '@/features/budgets/hooks/use-budget-mutations';
import { useBudgetsList } from '@/features/budgets/hooks/use-budgets-list';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { TablePagination } from '@/shared/components/TablePagination';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import {
  formatTotalLabel,
  resolvePaginationMeta,
  shouldShowPagination,
} from '@/shared/lib/pagination';

export function BudgetsPage() {
  const { budget } = useActionCapabilities();
  const list = useBudgetsList();
  const mutations = useBudgetMutations({
    currentYear: list.currentYear,
    listParams: list.listParams,
  });

  if (list.budgetsQuery.isLoading) {
    return <LoadingState message="Loading budgets…" />;
  }

  if (list.budgetsQuery.isError) {
    return (
      <ErrorState
        message={(list.budgetsQuery.error as Error).message}
        onRetry={() => void list.budgetsQuery.refetch()}
        retrying={list.budgetsQuery.isFetching}
      />
    );
  }

  const budgets = (list.budgetsQuery.data?.items ?? []).filter((budget) => {
    const term = list.search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      budget.reference.toLowerCase().includes(term) ||
      budget.department?.name.toLowerCase().includes(term) ||
      budget.department?.reference.toLowerCase().includes(term) ||
      String(budget.year).includes(term);
    const matchesStatus =
      list.statusFilter === ALL_VALUE ||
      (list.statusFilter === 'active' ? budget.isActive : !budget.isActive);
    return matchesSearch && matchesStatus;
  });

  const departments = list.departmentsQuery.data?.items ?? [];
  const yearOptions = buildYearOptions(list.currentYear);
  const hasActiveFilters =
    list.search.trim() !== '' ||
    list.departmentFilter !== ALL_VALUE ||
    list.statusFilter !== ALL_VALUE ||
    list.healthFilter !== 'all';
  const meta = resolvePaginationMeta(
    list.budgetsQuery.data?.meta,
    list.budgetsQuery.data?.items?.length ?? 0,
    list.page,
    list.listParams.limit ?? 20,
  );

  const departmentRows =
    (list.byDepartmentQuery.data?.length ?? 0) > 0
      ? list.byDepartmentQuery.data!
      : buildDepartmentRowsFromBudgets(list.budgetsQuery.data?.items ?? []);

  const insightsLoading =
    list.orgSummaryQuery.isLoading ||
    list.healthCountsQuery.isLoading ||
    list.byDepartmentQuery.isLoading;

  const resetPage = () => list.setPage(1);

  return (
    <PageShell wide className="gap-6">
      <PageHeader
        title="Budgets"
        description={`Annual department limits and utilization for ${list.selectedYear}`}
        meta={formatTotalLabel(meta.total, 'budget')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={list.yearFilter}
              onValueChange={(value) => {
                list.setYearFilter(value);
                resetPage();
              }}
            >
              <SelectTrigger className="w-[108px] bg-background">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {budget.export ? (
              <Button
                variant="outline"
                onClick={() => mutations.exportMutation.mutate()}
                disabled={mutations.exportMutation.isPending || meta.total === 0}
              >
                <DownloadSimpleIcon className="size-4" />
                Export
              </Button>
            ) : null}
            {budget.create ? (
              <Button onClick={mutations.openCreateForm}>Add budget</Button>
            ) : null}
          </div>
        }
      />

      <BudgetOrgSummaryStrip
        summary={list.orgSummaryQuery.data}
        departmentRows={departmentRows}
        budgetCount={meta.total}
        year={list.selectedYear}
        isLoading={insightsLoading}
      />

      <BudgetHealthSummary
        counts={list.healthCountsQuery.data}
        activeFilter={list.healthFilter}
        onFilterChange={(value) => {
          list.setHealthFilter(value);
          resetPage();
        }}
        isLoading={list.healthCountsQuery.isLoading}
        budgetCount={meta.total}
      />

      <BudgetFilters
        search={list.search}
        onSearchChange={(value) => {
          list.setSearch(value);
          resetPage();
        }}
        departmentFilter={list.departmentFilter}
        onDepartmentFilterChange={(value) => {
          list.setDepartmentFilter(value);
          resetPage();
        }}
        statusFilter={list.statusFilter}
        onStatusFilterChange={(value) => {
          list.setStatusFilter(value);
          resetPage();
        }}
        sortBy={list.sortBy}
        onSortByChange={(value) => {
          list.setSortBy(value);
          resetPage();
        }}
        sortOrder={list.sortOrder}
        onSortOrderChange={(value) => {
          list.setSortOrder(value);
          resetPage();
        }}
        departments={departments}
      />

      <DataCard
        title="Department budgets"
        description={`${meta.total} ${meta.total === 1 ? 'record' : 'records'} for ${list.selectedYear}`}
        footer={
          shouldShowPagination(meta) ? (
            <TablePagination meta={meta} onPageChange={list.setPage} />
          ) : undefined
        }
      >
        {budgets.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? 'No budgets found' : 'No budgets yet'}
            description={
              hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'Create a budget to set department spending limits.'
            }
            action={
              budget.create ? (
                <Button onClick={mutations.openCreateForm}>Add budget</Button>
              ) : undefined
            }
          />
        ) : (
          <BudgetsTable
            budgets={budgets}
            togglePending={mutations.toggleActiveMutation.isPending}
            onEdit={mutations.openEditBudget}
            onToggleActive={(reference, isActive) =>
              void mutations.toggleActiveMutation.mutateAsync({ reference, isActive })
            }
          />
        )}
      </DataCard>

      <CreateBudgetDialog
        open={mutations.showForm}
        onOpenChange={mutations.setShowForm}
        form={mutations.createForm}
        loading={mutations.createMutation.isPending}
        onSubmit={mutations.createForm.handleSubmit((values) =>
          mutations.createMutation.mutateAsync(values),
        )}
        departments={departments}
      />

      <EditBudgetDialog
        open={Boolean(mutations.editingBudget)}
        onOpenChange={(open) => !open && mutations.setEditingBudget(null)}
        form={mutations.editForm}
        loading={mutations.updateMutation.isPending}
        onSubmit={mutations.editForm.handleSubmit((values) => {
          if (!mutations.editingBudget) return;
          return mutations.updateMutation.mutateAsync({
            reference: mutations.editingBudget.reference,
            values,
          });
        })}
      />
    </PageShell>
  );
}
