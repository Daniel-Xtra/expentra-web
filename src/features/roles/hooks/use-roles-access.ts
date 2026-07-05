import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';

export function useRolesAccess() {
  const caps = useActionCapabilities();

  return {
    canManageRoles: caps.role.read,
    canCreateRoles: caps.role.create,
    canUpdateRoles: caps.role.update,
    canDeleteRoles: caps.role.delete,
  };
}
