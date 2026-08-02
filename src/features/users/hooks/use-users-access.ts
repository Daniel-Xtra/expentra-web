import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';

export function useUsersAccess() {
  const caps = useActionCapabilities();

  return {
    canManageUsers: caps.user.read,
    canUpdateUsers: caps.user.update,
    canExportUsers: caps.user.export,
  };
}
