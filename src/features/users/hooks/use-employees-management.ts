import { useState } from 'react';
import { useUserMutations } from '@/features/users/hooks/use-user-mutations';
import { useUserCatalogData, useUsersList } from '@/features/users/hooks/use-users-list';
import {
  DEFAULT_PAGE_SIZE,
  resolvePaginationMeta,
} from '@/shared/lib/pagination';
import type { ViewMode } from '@/shared/components/ViewModeToggle';

export function useEmployeesManagement(enabled: boolean) {
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const mutations = useUserMutations();
  const usersList = useUsersList({ enabled });
  const userCatalog = useUserCatalogData(enabled);

  const users = usersList.usersQuery.data?.items ?? [];
  const meta = resolvePaginationMeta(
    usersList.usersQuery.data?.meta,
    users.length,
    usersList.page,
    DEFAULT_PAGE_SIZE,
  );

  const isLoading = enabled && usersList.usersQuery.isLoading && !usersList.usersQuery.data;

  return {
    viewMode,
    setViewMode,
    usersList,
    userCatalog,
    mutations,
    users,
    meta,
    isLoading,
  };
}
