import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listRoles } from '@/features/roles/api';
import {
  fetchApprovalLevelImpact,
  fetchApprovalLevelWorkflowHealth,
  listApprovalLevels,
  type ListApprovalLevelsParams,
} from '@/features/approval-levels/api';
import { ALL_VALUE } from '@/features/approval-levels/schemas';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { queryKeys } from '@/shared/api/query-keys';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';

function resolveListFilters(statusFilter: string): Pick<ListApprovalLevelsParams, 'isActive'> {
  if (statusFilter === 'active') return { isActive: true };
  if (statusFilter === 'inactive') return { isActive: false };
  return {};
}

export function useApprovalLevelsList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState(ALL_VALUE);
  const [page, setPage] = useState(1);

  const listFilterParams = resolveListFilters(statusFilter);
  const listParams: ListApprovalLevelsParams = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    ...listFilterParams,
  };

  const levelsQuery = useQuery({
    queryKey: queryKeys.approvalLevels.list({
      debouncedSearch,
      page,
      statusFilter,
    }),
    queryFn: () => listApprovalLevels(listParams),
    placeholderData: keepPreviousData,
  });

  const workflowHealthQuery = useQuery({
    queryKey: queryKeys.approvalLevels.workflowHealth(),
    queryFn: fetchApprovalLevelWorkflowHealth,
  });

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    listParams,
    levelsQuery,
    workflowHealthQuery,
  };
}

export function useApprovalLevelCatalogData(catalogEnabled: boolean) {
  const rolesQuery = useQuery({
    queryKey: queryKeys.roles.catalog(),
    queryFn: () => listRoles({ page: 1, limit: 100 }),
    enabled: catalogEnabled,
  });

  return {
    roles: rolesQuery.data?.items ?? [],
    isLoading: rolesQuery.isLoading,
    rolesQuery,
  };
}

export function useApprovalLevelImpact(reference: string | undefined) {
  return useQuery({
    queryKey: queryKeys.approvalLevels.impact(reference ?? ''),
    queryFn: () => fetchApprovalLevelImpact(reference!),
    enabled: Boolean(reference),
  });
}
