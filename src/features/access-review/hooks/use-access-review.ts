import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { downloadAccessReviewExcel, fetchAccessReview } from '@/features/access-review/api';
import { matchesAccessReviewSearch } from '@/features/access-review/utils';
import { queryKeys } from '@/shared/api/query-keys';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { toastError } from '@/shared/lib/toast';
import { formatLabel } from '@/shared/utils/format';

export function useAccessReview() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const debouncedSearch = useDebouncedValue(search);

  const reviewQuery = useQuery({
    queryKey: queryKeys.accessReview.all,
    queryFn: fetchAccessReview,
  });

  const exportMutation = useMutation({
    mutationFn: downloadAccessReviewExcel,
    onError: (err) => toastError(err, 'Failed to export access review'),
  });

  const roleOptions = useMemo(() => {
    const roles = new Set<string>();
    for (const row of reviewQuery.data ?? []) {
      if (row.roleName) {
        roles.add(row.roleName);
      }
    }
    return [...roles]
      .sort((a, b) => a.localeCompare(b))
      .map((role) => ({ value: role, label: formatLabel(role) }));
  }, [reviewQuery.data]);

  const departmentOptions = useMemo(() => {
    const departments = new Set<string>();
    for (const row of reviewQuery.data ?? []) {
      if (row.departmentName) {
        departments.add(row.departmentName);
      }
    }
    return [...departments]
      .sort((a, b) => a.localeCompare(b))
      .map((department) => ({ value: department, label: department }));
  }, [reviewQuery.data]);

  const filteredRows = useMemo(() => {
    const rows = reviewQuery.data ?? [];
    const query = debouncedSearch.trim().toLowerCase();

    return rows.filter((row) => {
      if (roleFilter !== 'all' && row.roleName !== roleFilter) {
        return false;
      }
      if (departmentFilter !== 'all' && row.departmentName !== departmentFilter) {
        return false;
      }
      if (query && !matchesAccessReviewSearch(row, query)) {
        return false;
      }
      return true;
    });
  }, [debouncedSearch, departmentFilter, reviewQuery.data, roleFilter]);

  return {
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    departmentFilter,
    setDepartmentFilter,
    roleOptions,
    departmentOptions,
    reviewQuery,
    exportMutation,
    filteredRows,
    totalUsers: reviewQuery.data?.length ?? 0,
  };
}
