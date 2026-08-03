import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listDepartments } from '@/features/departments/api';
import { listRoles } from '@/features/roles/api';
import { fetchUserStatusCounts, listUsers } from '@/features/users/api';
import { ALL_VALUE } from '@/features/users/constants';
import { resolveUserListFilter } from '@/features/users/list-filters';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { queryKeys } from '@/shared/api/query-keys';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';

type UseUsersListOptions = {
  enabled: boolean;
};

export function useUsersList({ enabled }: UseUsersListOptions) {
  const [searchParams] = useSearchParams();
  const departmentFromUrl = searchParams.get('department');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleReference, setRoleReference] = useState(ALL_VALUE);
  const [departmentReference, setDepartmentReference] = useState(
    departmentFromUrl && departmentFromUrl !== ALL_VALUE ? departmentFromUrl : ALL_VALUE,
  );

  const debouncedSearch = useDebouncedValue(search);
  const statusParams = resolveUserListFilter(statusFilter);

  const listParams = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    departmentReference:
      departmentReference !== ALL_VALUE ? departmentReference : undefined,
    roleReference: roleReference !== ALL_VALUE ? roleReference : undefined,
    ...statusParams,
  };

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list({
      debouncedSearch,
      page,
      departmentReference: listParams.departmentReference,
      roleReference: listParams.roleReference,
      statusFilter,
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
    page,
    setPage,
    statusFilter,
    setStatusFilter: (value: string) => {
      setStatusFilter(value);
      setPage(1);
    },
    roleReference,
    setRoleReference: (value: string) => {
      setRoleReference(value);
      setPage(1);
    },
    departmentReference,
    setDepartmentReference: (value: string) => {
      setDepartmentReference(value);
      setPage(1);
    },
    debouncedSearch,
    usersQuery,
    statusCountsQuery,
    exportParams: {
      search: debouncedSearch || undefined,
      departmentReference: listParams.departmentReference,
      roleReference: listParams.roleReference,
      ...statusParams,
    },
  };
}

export function useUserCatalogData(catalogEnabled: boolean) {
  const allRolesQuery = useQuery({
    queryKey: queryKeys.roles.catalog(),
    queryFn: () => listRoles({ page: 1, limit: 100 }),
    enabled: catalogEnabled,
  });

  const departmentsQuery = useQuery({
    queryKey: queryKeys.departments.catalog(),
    queryFn: () => listDepartments({ page: 1, limit: 100 }),
    enabled: catalogEnabled,
  });

  return {
    allRoles: allRolesQuery.data?.items ?? [],
    departments: departmentsQuery.data?.items ?? [],
    isLoading: allRolesQuery.isLoading || departmentsQuery.isLoading,
    allRolesQuery,
    departmentsQuery,
  };
}