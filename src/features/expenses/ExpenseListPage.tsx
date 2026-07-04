import { Link } from 'react-router-dom';
import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ExpenseListFilters } from '@/features/expenses/components/ExpenseListFilters';
import { ExpensesTable } from '@/features/expenses/components/ExpensesTable';
import { ExpenseStatusSummary } from '@/features/expenses/components/ExpenseStatusSummary';
import { useExpensesList } from '@/features/expenses/hooks/use-expenses-list';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { TablePagination } from '@/shared/components/TablePagination';
import { formatTotalLabel,
  resolvePaginationMeta,
  shouldShowPagination,
  DEFAULT_PAGE_SIZE,
} from '@/shared/lib/pagination';

export function ExpenseListPage() {
  const list = useExpensesList();

  if (list.listQuery.isLoading) {
    return <LoadingState message="Loading expenses…" />;
  }

  if (list.listQuery.isError) {
    return (
      <ErrorState
        message={(list.listQuery.error as Error).message}
        onRetry={() => void list.listQuery.refetch()}
        retrying={list.listQuery.isFetching}
      />
    );
  }

  const allItems = list.listQuery.data?.items ?? [];
  const items = allItems.filter((expense) =>
    list.search.trim()
      ? expense.title.toLowerCase().includes(list.search.trim().toLowerCase()) ||
        expense.reference.toLowerCase().includes(list.search.trim().toLowerCase())
      : true,
  );
  const meta = resolvePaginationMeta(list.listQuery.data?.meta, allItems.length, list.page, DEFAULT_PAGE_SIZE);
  const hasSearchFilter = list.search.trim().length > 0;
  const isFilteredEmpty = items.length === 0 && (hasSearchFilter || meta.total > 0);
  const resetPage = () => list.setPage(1);

  return (
    <PageShell wide>
      <PageHeader
        title={list.canViewAll ? 'All expenses' : 'My expenses'}
        meta={formatTotalLabel(meta.total, 'expense')}
        actions={
          <div className="flex flex-wrap gap-2">
            {list.canExport ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => list.exportMutation.mutate()}
                disabled={list.exportMutation.isPending || hasSearchFilter}
                title={
                  hasSearchFilter
                    ? 'Clear search to export the full filtered list from the server'
                    : undefined
                }
              >
                <DownloadSimpleIcon className="size-4" />
                Export
              </Button>
            ) : null}
            {list.canCreate ? (
              <Button asChild>
                <Link to="/expenses/new">New expense</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <ExpenseStatusSummary
        counts={list.statusCountsQuery.data}
        activeFilter={list.filter}
        onFilterChange={(value) => {
          list.setFilter(value);
          resetPage();
        }}
      />

      <ExpenseListFilters
        search={list.search}
        onSearchChange={list.setSearch}
        sortBy={list.sortBy}
        onSortByChange={list.setSortBy}
        sortOrder={list.sortOrder}
        onSortOrderChange={list.setSortOrder}
        onFilterChange={resetPage}
      />

      {items.length === 0 ? (
        <EmptyState
          title={isFilteredEmpty ? 'No matching expenses' : 'No expenses yet'}
          description={
            isFilteredEmpty
              ? 'Try adjusting your search or filters.'
              : 'Create your first expense claim to get started.'
          }
          action={
            !isFilteredEmpty && list.canCreate ? (
              <Button asChild>
                <Link to="/expenses/new">Create expense</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataCard
          footer={
            shouldShowPagination(meta) ? (
              <TablePagination meta={meta} onPageChange={list.setPage} />
            ) : undefined
          }
        >
          <ExpensesTable expenses={items} canViewAll={list.canViewAll} />
        </DataCard>
      )}
    </PageShell>
  );
}
