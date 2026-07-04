import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeesManagementPanel } from '@/features/team/components/EmployeesManagementPanel';
import { RolesManagementPanel } from '@/features/team/components/RolesManagementPanel';
import { TeamManagementHeader } from '@/features/team/components/TeamManagementHeader';
import { useEmployeesManagement } from '@/features/team/hooks/use-employees-management';
import { useRolesManagement } from '@/features/team/hooks/use-roles-management';
import { useTeamAccess } from '@/features/team/hooks/use-team-access';
import { useTeamTabs } from '@/features/team/hooks/use-team-tabs';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageShell } from '@/shared/components/PageShell';

export function TeamManagementView() {
  const access = useTeamAccess();
  const employees = useEmployeesManagement(access.canManageUsers);
  const roles = useRolesManagement(access.canManageRoles);
  const tabs = useTeamTabs(access);

  if (tabs.isTabLoading(employees.isLoading, roles.isLoading)) {
    return <LoadingState message="Loading team…" />;
  }

  return (
    <PageShell wide>
      <TeamManagementHeader
        activeTab={tabs.activeTab}
        canManageUsers={access.canManageUsers}
        canCreateUsers={access.canCreateUsers}
        canExportUsers={access.canExportUsers}
        canCreateRoles={access.canCreateRoles}
        employeeTotal={employees.meta.total}
        exporting={employees.mutations.exporting}
        onAddEmployee={employees.mutations.openCreateUserForm}
        onExportEmployees={() =>
          void employees.mutations.handleExportUsers(employees.usersList.exportParams)
        }
        onCreateRole={roles.mutations.openCreateForm}
      />

      <Tabs value={tabs.activeTab} onValueChange={tabs.handleTabChange}>
        <TabsList>
          {access.canManageUsers && <TabsTrigger value="employees">Employees</TabsTrigger>}
          {access.canManageRoles && <TabsTrigger value="roles">Roles</TabsTrigger>}
        </TabsList>

        {access.canManageUsers && (
          <TabsContent value="employees">
            <EmployeesManagementPanel
              canUpdateUsers={access.canUpdateUsers}
              employees={employees}
            />
          </TabsContent>
        )}

        {access.canManageRoles && (
          <TabsContent value="roles">
            <RolesManagementPanel roles={roles} />
          </TabsContent>
        )}
      </Tabs>
    </PageShell>
  );
}
