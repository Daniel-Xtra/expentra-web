import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listPermissions, listRoles } from '@/features/roles/api';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { queryKeys } from '@/shared/api/query-keys';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';

type UseRolesListOptions = {
  enabled: boolean;
};

export function useRolesList({ enabled }: UseRolesListOptions) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const rolesQuery = useQuery({
    queryKey: queryKeys.roles.list({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: debouncedSearch || undefined,
    }),
    queryFn: () =>
      listRoles({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    enabled,
    placeholderData: keepPreviousData,
  });

  return {
    search,
    setSearch,
    page,
    setPage,
    debouncedSearch,
    rolesQuery,
  };
}

export function usePermissionsCatalog(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.roles.permissions(),
    queryFn: listPermissions,
    enabled,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
