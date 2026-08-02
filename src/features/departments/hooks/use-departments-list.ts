import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  exportDepartments,
  listDepartments,
  type ListDepartmentsParams,
} from '@/features/departments/api';
import { invalidateDepartments, queryKeys } from '@/shared/api/query-keys';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import type { DepartmentListSortField, DepartmentResponse } from '@/types/api';
import type { DepartmentOverviewStats } from '@/features/departments/components/DepartmentOverviewCard';

export const DEPARTMENTS_ALL_VALUE = 'all';
export const DEPARTMENTS_CURRENT_YEAR = new Date().getFullYear();

export function buildDepartmentOverviewStats(
  departments: DepartmentResponse[],
  total: number,
): DepartmentOverviewStats {
  const activeCount = departments.filter((department) => department.isActive).length;
  const withManagerCount = departments.filter((department) => department.hasManager).length;

  return {
    total: total || departments.length,
    activeCount,
    inactiveCount: departments.length - activeCount,
    withManagerCount,
    isPartial: total > departments.length,
  };
}

export function useDepartmentsList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState(DEPARTMENTS_ALL_VALUE);
  const [sortBy, setSortBy] = useState<DepartmentListSortField>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [page, setPage] = useState(1);

  const listParams: ListDepartmentsParams = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    year: DEPARTMENTS_CURRENT_YEAR,
    sortBy,
    sortOrder,
  };

  const departmentsQuery = useQuery({
    queryKey: queryKeys.departments.list({
      debouncedSearch,
      page,
      statusFilter,
      sortBy,
      sortOrder,
    }),
    queryFn: () => listDepartments(listParams),
    placeholderData: keepPreviousData,
  });

  const exportMutation = useMutation({
    mutationFn: () => exportDepartments(listParams),
    onSuccess: (message) => toastSuccess(message),
    onError: (err) => toastError(err, 'Failed to export departments'),
  });

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    listParams,
    departmentsQuery,
    exportMutation,
    invalidateDepartments: () => invalidateDepartments(queryClient),
  };
}
