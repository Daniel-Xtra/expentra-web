import { Link } from 'react-router-dom';
import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ExpenseListFilters } from '@/features/expenses/components/ExpenseListFilters';
import { ExpensesTable } from '@/features/expenses/components/ExpensesTable';
import { ExpenseStatusSummary } from '@/features/expenses/components/ExpenseStatusSummary';
import { useExpensesList } from '@/features/expenses/hooks/use-expenses-list';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { QueryStatus } from '@/shared/components/QueryStatus';
import { TablePagination } from '@/shared/components/TablePagination';
import {
  resolvePaginationMeta,
  shouldShowPagination,
  DEFAULT_PAGE_SIZE,
} from '@/shared/lib/pagination';

export function ExpenseListPage() {
  const list = useExpensesList();

  const allItems = list.listQuery.data?.items ?? [];
  const items = allItems.filter((expense) =>
    list.search.trim()
      ? expense.title.toLowerCase().includes(list.search.trim().toLowerCase()) ||
        expense.reference.toLowerCase().includes(list.search.trim().toLowerCase())
      : true,
  );
  const meta = resolvePaginationMeta(
    list.listQuery.data?.meta,
    allItems.length,
    list.page,
    DEFAULT_PAGE_SIZE,
  );
  const hasSearchFilter = list.search.trim().length > 0;
  const isFilteredEmpty = items.length === 0 && (hasSearchFilter || meta.total > 0);
  const resetPage = () => list.setPage(1);
  const isInitialLoading = list.listQuery.isLoading && !list.listQuery.data;

  return (
    <PageShell wide>
      <PageHeader
        title={list.canViewAll ? 'All expenses' : 'My expenses'}
        description={
          list.canViewAll
            ? 'Organization-wide expense claims.'
            : 'Track drafts, submissions, and reimbursements.'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {list.canExport ? (
              <div className="flex flex-col items-end gap-1">
                <Button
                  variant="outline"
                  className="h-11 px-7 text-sm font-normal text-[#414651] hover:bg-white"
                  onClick={() => list.exportMutation.mutate()}
                  disabled={list.exportMutation.isPending || hasSearchFilter || isInitialLoading}
                  aria-describedby={hasSearchFilter ? 'expense-search-export-hint' : undefined}
                  title={
                    hasSearchFilter
                      ? 'Clear search to export the full filtered list from the server'
                      : undefined
                  }
                >
                  <DownloadSimpleIcon className="size-4" />
                  Export
                </Button>
                {hasSearchFilter ? (
                  <p className="text-xs text-muted-foreground">Clear search to export.</p>
                ) : null}
              </div>
            ) : null}
            {list.canCreate ? (
              <Button asChild className="h-11 px-5 text-sm font-normal">
                <Link to="/expenses/new">Create expense</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <QueryStatus query={list.listQuery} loadingMessage="Loading expenses…">
        <>
          <ExpenseStatusSummary
            counts={list.statusCountsQuery.data}
            isLoading={list.statusCountsQuery.isLoading}
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
                  ? 'No matches on this page. Try another term, or clear search and change page.'
                  : 'Create your first claim to get started.'
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
        </>
      </QueryStatus>
    </PageShell>
  );
}
