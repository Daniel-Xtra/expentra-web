import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  buildExpenseListParams,
  resolveInitialExpenseFilter,
  type ExpenseListScope,
} from '@/features/expenses/constants';
import {
  exportExpenses,
  exportMyExpenses,
  fetchExpenseStatusCounts,
  fetchMyExpenseStatusCounts,
  listExpenses,
  listMyExpenses,
  type ExpenseListSortField,
  type ExpenseListSortOrder,
} from '@/features/expenses/api';
import { queryKeys } from '@/shared/api/query-keys';
import { canAccess } from '@/shared/lib/capabilities';
import { toastError, toastSuccess } from '@/shared/lib/toast';

function writeStatusParam(
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  filter: string,
) {
  setSearchParams(
    (previous) => {
      const next = new URLSearchParams(previous);
      if (filter === 'all') {
        next.delete('status');
      } else {
        next.set('status', filter);
      }
      return next;
    },
    { replace: true },
  );
}

export function useExpensesList() {
  const { authorization } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilterState] = useState(() => resolveInitialExpenseFilter(searchParams));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ExpenseListSortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<ExpenseListSortOrder>('DESC');

  const canViewAll = canAccess(authorization?.capabilities, 'expense:read:company');
  const canCreate = canAccess(authorization?.capabilities, 'expense:create');
  const canExport = canViewAll || canAccess(authorization?.capabilities, 'expense:read');
  const scope: ExpenseListScope = canViewAll ? 'all' : 'me';

  const listParams = useMemo(
    () => buildExpenseListParams(filter, page, sortBy, sortOrder),
    [filter, page, sortBy, sortOrder],
  );

  const listQuery = useQuery({
    queryKey: queryKeys.expenses.list(scope, listParams),
    queryFn: () => (canViewAll ? listExpenses(listParams) : listMyExpenses(listParams)),
  });

  const statusCountsQuery = useQuery({
    queryKey: queryKeys.expenses.statusCounts(scope),
    queryFn: () =>
      canViewAll ? fetchExpenseStatusCounts() : fetchMyExpenseStatusCounts(),
  });

  const setFilter = (value: string) => {
    setFilterState(value);
    writeStatusParam(setSearchParams, value);
  };

  const exportMutation = useMutation({
    mutationFn: () =>
      canViewAll ? exportExpenses(listParams) : exportMyExpenses(listParams),
    onSuccess: (message) => toastSuccess(message),
    onError: (err) => toastError(err, 'Failed to export expenses'),
  });

  return {
    scope,
    canViewAll,
    canCreate,
    canExport,
    filter,
    setFilter,
    search,
    setSearch,
    page,
    setPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    listParams,
    listQuery,
    statusCountsQuery,
    exportMutation,
  };
}
