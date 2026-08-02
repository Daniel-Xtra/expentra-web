import { useMemo } from 'react';
import { useRoleMutations } from '@/features/roles/hooks/use-role-mutations';
import { useRolePermissions } from '@/features/roles/hooks/use-role-permissions';
import { useRoleTemplates } from '@/features/roles/hooks/use-role-templates';
import { usePermissionsCatalog, useRolesList } from '@/features/roles/hooks/use-roles-list';
import {
  DEFAULT_PAGE_SIZE,
  resolvePaginationMeta,
} from '@/shared/lib/pagination';
import { formatPermissionGroups, formatRoleName } from '@/shared/utils/format';

export function useRolesManagement(enabled: boolean) {
  const rolesList = useRolesList({ enabled });
  const mutations = useRoleMutations();
  const permissions = useRolePermissions();

  const templatesEnabled =
    enabled && (mutations.showCreateForm || Boolean(permissions.editingRoleRef));
  const permissionsEnabled = enabled;

  const templatesQuery = useRoleTemplates(templatesEnabled);
  const permissionsQuery = usePermissionsCatalog(permissionsEnabled);

  const roles = rolesList.rolesQuery.data?.items ?? [];
  const meta = resolvePaginationMeta(
    rolesList.rolesQuery.data?.meta,
    roles.length,
    rolesList.page,
    DEFAULT_PAGE_SIZE,
  );

  const permissionGroups = useMemo(
    () => formatPermissionGroups(permissionsQuery.data ?? {}),
    [permissionsQuery.data],
  );

  const permissionsCatalogLoading =
    permissionsEnabled &&
    !permissionsQuery.isError &&
    !permissionsQuery.data &&
    (permissionsQuery.isLoading || permissionsQuery.isFetching);

  const isLoading = enabled && rolesList.rolesQuery.isLoading && !rolesList.rolesQuery.data;

  const requestDeleteRole = (role: { reference: string; name: string }) => {
    mutations.setDeleteTarget({
      reference: role.reference,
      label: formatRoleName(role.name),
    });
  };

  return {
    rolesList,
    mutations,
    permissions,
    templatesQuery,
    permissionsQuery,
    roles,
    meta,
    permissionGroups,
    permissionsCatalogLoading,
    isLoading,
    requestDeleteRole,
  };
}
