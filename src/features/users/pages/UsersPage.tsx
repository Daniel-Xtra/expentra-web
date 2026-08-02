import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { EmployeesManagementPanel } from '@/features/users/components/EmployeesManagementPanel';
import { useEmployeesManagement } from '@/features/users/hooks/use-employees-management';
import { useUsersAccess } from '@/features/users/hooks/use-users-access';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';

export function UsersPage() {
  const access = useUsersAccess();
  const employees = useEmployeesManagement(access.canManageUsers);

  if (employees.isLoading) {
    return <LoadingState message="Loading users…" />;
  }

  return (
    <PageShell wide>
      <PageHeader
        title="Users"
        description="Manage employees, assignments, and access."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {access.canExportUsers && (
              <Button
           
                className="h-11 font-normal text-sm px-7 bg-primary-500"
                disabled={employees.mutations.exporting}
                onClick={() =>
                  void employees.mutations.handleExportUsers(
                    employees.usersList.exportParams,
                  )
                }
              >
                <DownloadSimpleIcon className="size-4" />
                {employees.mutations.exporting ? "Exporting…" : "Export Users"}
              </Button>
            )}
          </div>
        }
      />

      <EmployeesManagementPanel
        canUpdateUsers={access.canUpdateUsers}
        employees={employees}
      />
    </PageShell>
  );
}
