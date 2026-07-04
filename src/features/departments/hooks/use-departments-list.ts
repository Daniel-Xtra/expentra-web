import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  exportDepartments,
  fetchDepartmentStatusCounts,
  listDepartments,
  type ListDepartmentsParams,
} from '@/features/departments/api';
import { resolveDepartmentListFilter } from '@/features/departments/components/DepartmentStatusSummary';
import { invalidateDepartments, queryKeys } from '@/shared/api/query-keys';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import type { DepartmentListSortField } from '@/types/api';

export const DEPARTMENTS_ALL_VALUE = 'all';
export const DEPARTMENTS_CURRENT_YEAR = new Date().getFullYear();

export function useDepartmentsList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState(DEPARTMENTS_ALL_VALUE);
  const [sortBy, setSortBy] = useState<DepartmentListSortField>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [page, setPage] = useState(1);

  const listFilterParams = resolveDepartmentListFilter(statusFilter);

  const listParams: ListDepartmentsParams = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    year: DEPARTMENTS_CURRENT_YEAR,
    sortBy,
    sortOrder,
    ...listFilterParams,
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

  const statusCountsQuery = useQuery({
    queryKey: queryKeys.departments.statusCounts(DEPARTMENTS_CURRENT_YEAR),
    queryFn: () => fetchDepartmentStatusCounts(DEPARTMENTS_CURRENT_YEAR),
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
    statusCountsQuery,
    exportMutation,
    invalidateDepartments: () => invalidateDepartments(queryClient),
  };
}
