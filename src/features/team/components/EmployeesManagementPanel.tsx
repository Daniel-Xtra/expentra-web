import { CreateUserDialog } from '@/features/users/components/CreateUserDialog';
import { EditEmployeeDialog } from '@/features/users/components/EditEmployeeDialog';
import { EmployeesTab } from '@/features/users/components/EmployeesTab';
import { NONE_VALUE } from '@/features/users/constants';
import type { useEmployeesManagement } from '@/features/team/hooks/use-employees-management';

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
        onStatusFilterChange={(value) => {
          usersList.setStatusFilter(value);
          usersList.setPage(1);
        }}
        departmentFilter={usersList.departmentFilter}
        onDepartmentFilterChange={(value) => {
          usersList.setDepartmentFilter(value);
          usersList.setPage(1);
        }}
        roleFilter={usersList.roleFilter}
        onRoleFilterChange={(value) => {
          usersList.setRoleFilter(value);
          usersList.setPage(1);
        }}
        departments={userCatalog.departments}
        allRoles={userCatalog.allRoles}
        users={users}
        usersQueryError={
          usersList.usersQuery.isError ? (usersList.usersQuery.error as Error) : null
        }
        onRetryUsers={() => void usersList.usersQuery.refetch()}
        usersRetrying={usersList.usersQuery.isFetching}
        statusCounts={usersList.statusCountsQuery.data}
        statusCountsLoading={usersList.statusCountsQuery.isLoading}
        page={meta.page}
        totalPages={meta.totalPages}
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

      <CreateUserDialog
        open={mutations.showCreateUser}
        onOpenChange={mutations.setShowCreateUser}
        form={mutations.createUserForm}
        loading={mutations.createUserMutation.isPending}
        onSubmit={mutations.createUserForm.handleSubmit((values) =>
          mutations.createUserMutation.mutateAsync(values),
        )}
        allRoles={userCatalog.allRoles}
        departments={userCatalog.departments}
      />

      <EditEmployeeDialog
        user={mutations.editingUser}
        onOpenChange={(open) => !open && mutations.setEditingUser(null)}
        form={mutations.editEmployeeForm}
        loading={mutations.updateUserMutation.isPending}
        onSubmit={mutations.editEmployeeForm.handleSubmit((values) => {
          if (!mutations.editingUser) return;
          return mutations.updateUserMutation.mutateAsync({
            reference: mutations.editingUser.reference,
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
