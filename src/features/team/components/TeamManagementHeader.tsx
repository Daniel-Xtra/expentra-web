import { DownloadSimpleIcon, PlusIcon, UserPlusIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { TeamTab } from '@/features/team/constants';
import { PageHeader } from '@/shared/components/PageHeader';
import { formatTotalLabel } from '@/shared/lib/pagination';

type TeamManagementHeaderProps = {
  activeTab: TeamTab;
  canManageUsers: boolean;
  canCreateUsers: boolean;
  canExportUsers: boolean;
  canCreateRoles: boolean;
  employeeTotal: number;
  exporting: boolean;
  onAddEmployee: () => void;
  onExportEmployees: () => void;
  onCreateRole: () => void;
};

export function TeamManagementHeader({
  activeTab,
  canManageUsers,
  canCreateUsers,
  canExportUsers,
  canCreateRoles,
  employeeTotal,
  exporting,
  onAddEmployee,
  onExportEmployees,
  onCreateRole,
}: TeamManagementHeaderProps) {
  const showEmployeeActions = activeTab === 'employees';
  const showRoleActions = activeTab === 'roles';

  return (
    <PageHeader
      title="Team Management"
      description={
        showEmployeeActions && canManageUsers && employeeTotal > 0
          ? formatTotalLabel(employeeTotal, 'employee')
          : undefined
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {showEmployeeActions && canCreateUsers && (
            <Button onClick={onAddEmployee}>
              <UserPlusIcon className="size-4" />
              Add employee
            </Button>
          )}
          {showEmployeeActions && canExportUsers && (
            <Button variant="outline" disabled={exporting} onClick={onExportEmployees}>
              <DownloadSimpleIcon className="size-4" />
              {exporting ? 'Exporting…' : 'Export'}
            </Button>
          )}
          {showRoleActions && canCreateRoles && (
            <Button variant="outline" onClick={onCreateRole}>
              <PlusIcon className="size-4" />
              Create Roles
            </Button>
          )}
        </div>
      }
    />
  );
}
