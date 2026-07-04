import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listDepartments } from '@/features/departments/api';
import { listRoles } from '@/features/roles/api';
import {
  fetchUserStatusCounts,
  listUsers,
} from '@/features/users/api';
import { resolveUserListFilter } from '@/features/users/components/UserStatusSummary';
import { ALL_VALUE } from '@/features/users/constants';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { queryKeys } from '@/shared/api/query-keys';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';

type UseUsersListOptions = {
  enabled: boolean;
};

export function useUsersList({ enabled }: UseUsersListOptions) {
  const [searchParams] = useSearchParams();
  const initialDepartmentFilter = searchParams.get('department') ?? ALL_VALUE;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState(initialDepartmentFilter);
  const [roleFilter, setRoleFilter] = useState(ALL_VALUE);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);
  const listFilterParams = resolveUserListFilter(statusFilter);

  const listParams = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    departmentReference: departmentFilter !== ALL_VALUE ? departmentFilter : undefined,
    roleReference: roleFilter !== ALL_VALUE ? roleFilter : undefined,
    ...listFilterParams,
  };

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list({
      debouncedSearch,
      page,
      statusFilter,
      departmentFilter,
      roleFilter,
    }),
    queryFn: () => listUsers(listParams),
    enabled,
    placeholderData: keepPreviousData,
  });

  const statusCountsQuery = useQuery({
    queryKey: queryKeys.users.statusCounts(),
    queryFn: fetchUserStatusCounts,
    enabled,
  });

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    departmentFilter,
    setDepartmentFilter,
    roleFilter,
    setRoleFilter,
    page,
    setPage,
    debouncedSearch,
    listFilterParams,
    usersQuery,
    statusCountsQuery,
    exportParams: {
      search: debouncedSearch || undefined,
      departmentReference: departmentFilter !== ALL_VALUE ? departmentFilter : undefined,
      roleReference: roleFilter !== ALL_VALUE ? roleFilter : undefined,
      ...listFilterParams,
    },
  };
}

export function useUserCatalogData(enabled: boolean) {
  const allRolesQuery = useQuery({
    queryKey: queryKeys.roles.catalog(),
    queryFn: () => listRoles({ page: 1, limit: 100 }),
    enabled,
  });

  const departmentsQuery = useQuery({
    queryKey: queryKeys.departments.catalog(),
    queryFn: () => listDepartments({ page: 1, limit: 100 }),
    enabled,
  });

  return {
    allRoles: allRolesQuery.data?.items ?? [],
    departments: departmentsQuery.data?.items ?? [],
    allRolesQuery,
    departmentsQuery,
  };
}
