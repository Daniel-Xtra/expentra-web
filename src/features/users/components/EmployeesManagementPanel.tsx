import { EditEmployeeDialog } from '@/features/users/components/modals/edit-employee';
import { EmployeesTab } from '@/features/users/components/EmployeesTab';
import { NONE_VALUE } from '@/features/users/constants';
import type { useEmployeesManagement } from '@/features/users/hooks/use-employees-management';
import { formatUserName } from '@/shared/utils/user';

type EmployeesManagementPanelProps = {
  canUpdateUsers: boolean;
  employees: ReturnType<typeof useEmployeesManagement>;
};

export function EmployeesManagementPanel({
  canUpdateUsers,
  employees,
}: EmployeesManagementPanelProps) {
  const { viewMode, setViewMode, usersList, userCatalog, mutations, users, meta } = employees;

  return (
    <>
      <EmployeesTab
        canUpdateUsers={canUpdateUsers}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        search={usersList.search}
        onSearchChange={(value) => {
          usersList.setSearch(value);
          usersList.setPage(1);
        }}
        statusFilter={usersList.statusFilter}
        onStatusFilterChange={usersList.setStatusFilter}
        statusCounts={usersList.statusCountsQuery.data}
        statusCountsLoading={usersList.statusCountsQuery.isLoading}
        roleReference={usersList.roleReference}
        onRoleReferenceChange={usersList.setRoleReference}
        departmentReference={usersList.departmentReference}
        onDepartmentReferenceChange={usersList.setDepartmentReference}
        roles={userCatalog.allRoles}
        departments={userCatalog.departments}
        users={users}
        usersQueryError={
          usersList.usersQuery.isError ? (usersList.usersQuery.error as Error) : null
        }
        onRetryUsers={() => void usersList.usersQuery.refetch()}
        usersRetrying={usersList.usersQuery.isFetching}
        meta={meta}
        onPageChange={usersList.setPage}
        selectedUsers={mutations.selectedUsers}
        onToggleUser={mutations.toggleUserSelection}
        onToggleAll={(checked) =>
          mutations.toggleAllUsers(
            users.map((user) => user.reference),
            checked,
          )
        }
        onEditUser={mutations.openEditUser}
        updateUserMutation={mutations.updateUserMutation}
        bulkDeactivateMutation={mutations.bulkDeactivateMutation}
      />

      <EditEmployeeDialog
        user={mutations.editingUser}
        onOpenChange={(open) => !open && mutations.setEditingUser(null)}
        form={mutations.editEmployeeForm}
        loading={mutations.updateUserMutation.isPending}
        catalogLoading={userCatalog.isLoading}
        onSubmit={mutations.editEmployeeForm.handleSubmit((values) => {
          if (!mutations.editingUser) return;
          return mutations.updateUserMutation.mutateAsync({
            reference: mutations.editingUser.reference,
            displayName: formatUserName(mutations.editingUser),
            roleReference: values.roleReference === NONE_VALUE ? null : values.roleReference,
            departmentReference:
              values.departmentReference === NONE_VALUE ? null : values.departmentReference,
          });
        })}
        allRoles={userCatalog.allRoles}
        departments={userCatalog.departments}
      />
    </>
  );
}
