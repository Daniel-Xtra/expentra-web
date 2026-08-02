import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useBudgetCatalogData, useBudgetsList } from '@/features/budgets/hooks/use-budgets-list';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { QueryStatus } from '@/shared/components/QueryStatus';
import { TablePagination } from '@/shared/components/TablePagination';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import {
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
  const catalog = useBudgetCatalogData(mutations.showForm);

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

  const departments = catalog.departments;
  const yearOptions = buildYearOptions(list.currentYear);
  const hasActiveFilters =
    list.search.trim() !== '' ||
    list.statusFilter !== ALL_VALUE;
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
    list.byDepartmentQuery.isLoading ||
    list.orgForecastQuery.isLoading;

  const resetPage = () => list.setPage(1);

  return (
    <QueryStatus query={list.budgetsQuery} loadingMessage="Loading budgets…">
    <PageShell wide className="gap-6">
      <PageHeader
        title="Budgets"
        description={`Set and monitor annual department budget limits for ${list.selectedYear}.`}
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
                className="h-11 font-normal text-sm px-7 hover:bg-white text-[#414651]"
                onClick={() => mutations.exportMutation.mutate()}
                disabled={mutations.exportMutation.isPending || meta.total === 0}
              >
                <DownloadSimpleIcon className="size-4" />
                Export Budgets
              </Button>
            ) : null}
            {budget.create ? (
              <Button className="h-11 font-normal text-sm px-7 bg-primary-500" onClick={mutations.openCreateForm}>Add Budget</Button>
            ) : null}
          </div>
        }
      />

      <BudgetOrgSummaryStrip
        summary={list.orgSummaryQuery.data}
        forecast={list.orgForecastQuery.data}
        departmentRows={departmentRows}
        budgetCount={meta.total}
        year={list.selectedYear}
        isLoading={insightsLoading}
      />

      <BudgetFilters
        search={list.search}
        onSearchChange={(value) => {
          list.setSearch(value);
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
        catalogLoading={catalog.isLoading}
        onSubmit={mutations.createForm.handleSubmit((values) =>
          mutations.createMutation.mutateAsync(values),
        )}
        departments={departments}
        currentYear={list.currentYear}
      />

      <EditBudgetDialog
        budget={mutations.editingBudget}
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
    </QueryStatus>
  );
}
