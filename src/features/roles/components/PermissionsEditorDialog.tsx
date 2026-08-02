import type { ReactNode } from 'react';
import { OrgGrantsCallout } from '@/shared/components/OrgGrantsPanel';
import AppCheckbox from '@/shared/reusable/AppCheckbox';
import { AppFormDialog } from '@/shared/reusable/AppFormDialog';
import {
  formatPermissionLabel,
  formatRoleName,
} from '@/shared/utils/format';
import type { PermissionGroup } from '@/shared/utils/format';
import type { RoleTemplateResponse } from '@/features/roles/api';
import type { RoleResponse } from '@/types/api';

type PermissionsEditorDialogProps = {
  open: boolean;
  role: RoleResponse | null;
  roleLoading: boolean;
  catalogLoading: boolean;
  catalogError?: Error | null;
  saving: boolean;
  applyingTemplate?: boolean;
  permissionGroups: PermissionGroup[];
  selectedCount: number;
  templates?: RoleTemplateResponse[];
  isSelected: (reference: string) => boolean;
  onToggle: (reference: string, checked: boolean) => void;
  onApplyTemplate?: (templateKey: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

function PermissionsLoadingState({ message }: { message: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center">
      <p className="text-sm text-black-400">{message}</p>
    </div>
  );
}

export function PermissionsEditorDialog({
  open,
  role,
  roleLoading,
  catalogLoading,
  catalogError = null,
  saving,
  applyingTemplate = false,
  permissionGroups,
  selectedCount,
  isSelected,
  onToggle,
  onCancel,
  onConfirm,
}: PermissionsEditorDialogProps) {
  const showCatalogLoading = catalogLoading && permissionGroups.length === 0;

  const description = role
    ? `${selectedCount} permission${selectedCount === 1 ? '' : 's'} selected for ${formatRoleName(role.name)}. Checked items are currently assigned to this role.`
    : roleLoading
      ? 'Loading role permissions…'
      : `${selectedCount} permission${selectedCount === 1 ? '' : 's'} selected. Checked items are currently assigned to this role.`;

  let permissionList: ReactNode;

  if (showCatalogLoading || (roleLoading && permissionGroups.length === 0)) {
    permissionList = (
      <PermissionsLoadingState
        message={
          showCatalogLoading ? 'Loading permission catalog…' : 'Loading role permissions…'
        }
      />
    );
  } else if (catalogError) {
    permissionList = (
      <p className="text-sm text-destructive">
        {catalogError.message || 'Failed to load permissions.'}
      </p>
    );
  } else if (permissionGroups.length === 0) {
    permissionList = (
      <p className="text-sm text-black-400">No permissions are available to assign.</p>
    );
  } else {
    permissionList = permissionGroups.map((group) => (
      <div key={group.key} className="space-y-3">
        <h3 className="text-xs font-medium tracking-wide text-black-400 uppercase">
          {group.label}
        </h3>
        <ul className="space-y-3">
          {group.permissions.map((permission) => {
            const checkboxId = `permission-${permission.reference}`;

            return (
              <li key={permission.reference}>
                <label
                  htmlFor={checkboxId}
                  className="flex cursor-pointer items-center gap-3 font-sans text-xs/[19.6px] font-normal text-black-500"
                  onClick={(event) => event.stopPropagation()}
                >
                  <AppCheckbox
                    id={checkboxId}
                    checked={isSelected(permission.reference)}
                    onCheckedChange={(checked) => {
                      if (typeof checked !== 'boolean') {
                        return;
                      }
                      onToggle(permission.reference, checked);
                    }}
                  />
                  {formatPermissionLabel(permission)}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    ));
  }

  return (
    <AppFormDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onCancel();
        }
      }}
      title="Edit permissions"
      description={description}
      submitLabel="Save permissions"
      loading={saving}
      actionsDisabled={roleLoading || applyingTemplate}
      submitDisabled={showCatalogLoading}
      onSubmit={onConfirm}
    >
      <div className="space-y-6 font-sans">
        <OrgGrantsCallout />
        {permissionList}
      </div>
    </AppFormDialog>
  );
}
