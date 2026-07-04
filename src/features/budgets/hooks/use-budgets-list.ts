import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listDepartments } from '@/features/departments/api';
import {
  fetchBudgetHealthCounts,
  fetchCommittedByDepartment,
  fetchOrganizationBudgetSummary,
  listBudgets,
  type ListBudgetsParams,
} from '@/features/budgets/api';
import { resolveBudgetHealthFilter } from '@/features/budgets/components/BudgetHealthSummary';
import { ALL_VALUE } from '@/features/budgets/constants';
import { queryKeys } from '@/shared/api/query-keys';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';
import type { BudgetListSortField, BudgetListSortOrder } from '@/types/api';

export function useBudgetsList() {
  const currentYear = new Date().getFullYear();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState(ALL_VALUE);
  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [statusFilter, setStatusFilter] = useState(ALL_VALUE);
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortBy, setSortBy] = useState<BudgetListSortField>('utilizationPercent');
  const [sortOrder, setSortOrder] = useState<BudgetListSortOrder>('DESC');
  const [page, setPage] = useState(1);

  const selectedYear = Number(yearFilter);

  const listParams: ListBudgetsParams = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    year: selectedYear,
    departmentReference: departmentFilter === ALL_VALUE ? undefined : departmentFilter,
    sortBy,
    sortOrder,
    healthFilter: resolveBudgetHealthFilter(healthFilter),
  };

  const budgetsQuery = useQuery({
    queryKey: queryKeys.budgets.list(listParams, statusFilter, search),
    queryFn: () => listBudgets(listParams),
  });

  const orgSummaryQuery = useQuery({
    queryKey: queryKeys.budgets.organizationSummary(selectedYear),
    queryFn: () => fetchOrganizationBudgetSummary(selectedYear),
  });

  const healthCountsQuery = useQuery({
    queryKey: queryKeys.budgets.healthCounts(selectedYear),
    queryFn: () => fetchBudgetHealthCounts(selectedYear),
  });

  const byDepartmentQuery = useQuery({
    queryKey: queryKeys.budgets.byDepartment(selectedYear),
    queryFn: () => fetchCommittedByDepartment(selectedYear),
  });

  const departmentsQuery = useQuery({
    queryKey: queryKeys.departments.catalog(),
    queryFn: () => listDepartments({ page: 1, limit: 100 }),
  });

  return {
    currentYear,
    search,
    setSearch,
    departmentFilter,
    setDepartmentFilter,
    yearFilter,
    setYearFilter,
    statusFilter,
    setStatusFilter,
    healthFilter,
    setHealthFilter,
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
    healthCountsQuery,
    byDepartmentQuery,
    departmentsQuery,
  };
}
