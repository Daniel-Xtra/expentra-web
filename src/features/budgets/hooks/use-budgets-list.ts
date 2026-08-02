import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listDepartments } from '@/features/departments/api';
import {
  fetchCommittedByDepartment,
  fetchOrganizationBudgetForecast,
  fetchOrganizationBudgetSummary,
  listBudgets,
  type ListBudgetsParams,
} from '@/features/budgets/api';
import { ALL_VALUE } from '@/features/budgets/constants';
import { queryKeys } from '@/shared/api/query-keys';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';
import type { BudgetListSortField, BudgetListSortOrder } from '@/types/api';

export function useBudgetsList() {
  const currentYear = new Date().getFullYear();
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [statusFilter, setStatusFilter] = useState(ALL_VALUE);
  const [sortBy, setSortBy] = useState<BudgetListSortField>('utilizationPercent');
  const [sortOrder, setSortOrder] = useState<BudgetListSortOrder>('DESC');
  const [page, setPage] = useState(1);

  const selectedYear = Number(yearFilter);

  const listParams: ListBudgetsParams = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    year: selectedYear,
    sortBy,
    sortOrder
  };

  const budgetsQuery = useQuery({
    queryKey: queryKeys.budgets.list(listParams, statusFilter, search),
    queryFn: () => listBudgets(listParams),
  });

  const orgSummaryQuery = useQuery({
    queryKey: queryKeys.budgets.organizationSummary(selectedYear),
    queryFn: () => fetchOrganizationBudgetSummary(selectedYear),
  });

  const orgForecastQuery = useQuery({
    queryKey: queryKeys.budgets.organizationForecast(selectedYear),
    queryFn: () => fetchOrganizationBudgetForecast(selectedYear),
  });

  const byDepartmentQuery = useQuery({
    queryKey: queryKeys.budgets.byDepartment(selectedYear),
    queryFn: () => fetchCommittedByDepartment(selectedYear),
  });

  return {
    currentYear,
    search,
    setSearch,
    yearFilter,
    setYearFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    selectedYear,
    listParams,
    budgetsQuery,
    orgSummaryQuery,
    orgForecastQuery,
    byDepartmentQuery,
  };
}

export function useBudgetCatalogData(catalogEnabled: boolean) {
  const departmentsQuery = useQuery({
    queryKey: queryKeys.departments.catalog(),
    queryFn: () => listDepartments({ page: 1, limit: 100 }),
    enabled: catalogEnabled,
  });

  return {
    departments: departmentsQuery.data?.items ?? [],
    isLoading: departmentsQuery.isLoading,
    departmentsQuery,
  };
}
