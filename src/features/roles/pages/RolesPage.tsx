import { PlusIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { RolesManagementPanel } from '@/features/roles/components/RolesManagementPanel';
import { useRolesAccess } from '@/features/roles/hooks/use-roles-access';
import { useRolesManagement } from '@/features/roles/hooks/use-roles-management';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { formatTotalLabel } from '@/shared/lib/pagination';

export function RolesPage() {
  const access = useRolesAccess();
  const roles = useRolesManagement(access.canManageRoles);

  if (roles.isLoading) {
    return <LoadingState message="Loading roles…" />;
  }

  return (
    <PageShell wide>
      <PageHeader
        title="Roles"
        description={
          roles.meta.total > 0
            ? `${formatTotalLabel(roles.meta.total, 'role')} · configure permissions and access`
            : 'Configure roles and permission assignments.'
        }
        actions={
          access.canCreateRoles ? (
            <Button className="h-11 font-normal text-sm px-7 bg-primary-500" onClick={roles.mutations.openCreateForm}>
              <PlusIcon className="size-4" />
              Create role
            </Button>
          ) : undefined
        }
      />

      <RolesManagementPanel roles={roles} />
    </PageShell>
  );
}
