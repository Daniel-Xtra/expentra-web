import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';

export function useTeamAccess() {
  const caps = useActionCapabilities();

  return {
    canManageUsers: caps.user.read,
    canCreateUsers: caps.user.create,
    canUpdateUsers: caps.user.update,
    canManageRoles: caps.role.read,
    canCreateRoles: caps.role.create,
    canUpdateRoles: caps.role.update,
    canDeleteRoles: caps.role.delete,
    canExportUsers: caps.user.export,
  };
}
