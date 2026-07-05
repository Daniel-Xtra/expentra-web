import { PermissionsEditorDialog } from '@/features/roles/components/PermissionsEditorDialog';
import { CreateRoleDialog, EditRoleDialog } from '@/features/roles/components/RoleFormDialogs';
import { RolesTab } from '@/features/roles/components/RolesTab';
import { useRolesAccess } from '@/features/roles/hooks/use-roles-access';
import type { useRolesManagement } from '@/features/roles/hooks/use-roles-management';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

type RolesManagementPanelProps = {
  roles: ReturnType<typeof useRolesManagement>;
};

export function RolesManagementPanel({ roles: rolesState }: RolesManagementPanelProps) {
  const access = useRolesAccess();
  const {
    rolesList,
    mutations,
    permissions,
    templatesQuery,
    roles,
    meta,
    permissionGroups,
    requestDeleteRole,
  } = rolesState;

  return (
    <>
      <RolesTab
        search={rolesList.search}
        onSearchChange={(value) => {
          rolesList.setSearch(value);
          rolesList.setPage(1);
        }}
        roles={roles}
        rolesQueryError={
          rolesList.rolesQuery.isError ? (rolesList.rolesQuery.error as Error) : null
        }
        onRetryRoles={() => void rolesList.rolesQuery.refetch()}
        rolesRetrying={rolesList.rolesQuery.isFetching}
        meta={meta}
        onPageChange={rolesList.setPage}
        onCreateRole={mutations.openCreateForm}
        onEditRole={mutations.openEditRole}
        onEditPermissions={(reference) => void permissions.openDialog(reference)}
        onDeleteRole={requestDeleteRole}
        canCreateRole={access.canCreateRoles}
        canUpdateRole={access.canUpdateRoles}
        canEditPermissions={access.canUpdateRoles}
        canDeleteRole={access.canDeleteRoles}
      />

      <CreateRoleDialog
        open={mutations.showCreateForm}
        onOpenChange={mutations.setShowCreateForm}
        form={mutations.createRoleForm}
        loading={mutations.createRoleMutation.isPending}
        templates={templatesQuery.data ?? []}
        onSubmit={mutations.createRoleForm.handleSubmit((values) =>
          mutations.createRoleMutation.mutateAsync(values),
        )}
      />

      <EditRoleDialog
        role={mutations.editingRole}
        onOpenChange={(open) => !open && mutations.setEditingRole(null)}
        form={mutations.editRoleForm}
        loading={mutations.updateRoleMutation.isPending}
        onSubmit={mutations.editRoleForm.handleSubmit((values) => {
          if (!mutations.editingRole) return;
          return mutations.updateRoleMutation.mutateAsync({
            reference: mutations.editingRole.reference,
            values,
          });
        })}
      />

      <PermissionsEditorDialog
        open={Boolean(permissions.editingRoleRef)}
        role={permissions.editingRole}
        selectedCount={permissions.selectedPermissions.length}
        loading={permissions.loading}
        saving={permissions.permissionsMutation.isPending}
        applyingTemplate={permissions.applyTemplateMutation.isPending}
        permissionGroups={permissionGroups}
        templates={templatesQuery.data ?? []}
        isSelected={permissions.isSelected}
        onToggle={permissions.togglePermission}
        onApplyTemplate={(templateKey) => {
          if (!permissions.editingRoleRef) return;
          void permissions.applyTemplateMutation.mutateAsync({
            reference: permissions.editingRoleRef,
            templateKey,
          });
        }}
        onCancel={permissions.closeDialog}
        onConfirm={() =>
          void permissions.permissionsMutation.mutateAsync({
            reference: permissions.editingRoleRef!,
            permissions: permissions.selectedPermissions,
          })
        }
      />

      <ConfirmDialog
        open={Boolean(mutations.deleteTarget)}
        onOpenChange={(open) => !open && mutations.setDeleteTarget(null)}
        title="Delete role"
        description={`Delete role ${mutations.deleteTarget?.label}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={mutations.deleteRoleMutation.isPending}
        onConfirm={async () => {
          await mutations.deleteRoleMutation.mutateAsync(mutations.deleteTarget!.reference);
          mutations.setDeleteTarget(null);
        }}
      />
    </>
  );
}
