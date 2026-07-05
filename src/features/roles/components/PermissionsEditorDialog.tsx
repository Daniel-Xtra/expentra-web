import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { OrgGrantsCallout } from '@/shared/components/OrgGrantsPanel';
import { LoadingState } from '@/shared/components/LoadingState';
import { AppModal } from '@/shared/reusable/AppModal';
import AppCheckbox from '@/shared/reusable/AppCheckbox';
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
  selectedCount: number;
  loading: boolean;
  saving: boolean;
  applyingTemplate?: boolean;
  permissionGroups: PermissionGroup[];
  templates?: RoleTemplateResponse[];
  isSelected: (reference: string) => boolean;
  onToggle: (reference: string, checked: boolean) => void;
  onApplyTemplate?: (templateKey: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PermissionsEditorDialog({
  open,
  role,
  selectedCount,
  loading,
  saving,
  applyingTemplate = false,
  permissionGroups,
  isSelected,
  onToggle,
  onCancel,
  onConfirm,
}: PermissionsEditorDialogProps) {
  const actionsDisabled = saving || loading || applyingTemplate;


  const description = role
    ? `${selectedCount} permission${selectedCount === 1 ? '' : 's'} selected for ${formatRoleName(role.name)}. Checked items are currently assigned to this role.`
    : `${selectedCount} permission${selectedCount === 1 ? '' : 's'} selected. Checked items are currently assigned to this role.`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AppModal
        title="Edit permissions"
        description={description}
        className="sm:max-w-lg"
        primaryFn={() => {}}
        content={
          <div className="space-y-6 -m-6! font-sans">
            {/* {effectiveAreas.length > 0 ? (
              <div className="rounded-lg border border-black-50 bg-neutral-100 px-4 py-3">
                <p className="text-xs font-semibold text-neutral-950">
                  Effective access areas
                </p>
                <p className="mt-1 text-xs/[16.8px] text-black-400">
                  Can manage: {effectiveAreas.join(', ')}
                </p>
              </div>
            ) : null} */}

            <OrgGrantsCallout />
{/* 
            {templates.length > 0 && onApplyTemplate ? (
              <div className="space-y-3 rounded-lg border border-black-50 bg-neutral-100 p-4">
                <AppFormLabel className="text-black-400">Replace with template</AppFormLabel>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <AppSelect
                      placeholder="Select template…"
                      options={templateOptions}
                      value={templateKey || BLANK_TEMPLATE_VALUE}
                      onChange={(value) =>
                        setTemplateKey(value === BLANK_TEMPLATE_VALUE ? '' : value)
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-[52px] shrink-0 rounded-sm px-5 font-sans text-sm font-semibold"
                    disabled={!templateKey || actionsDisabled}
                    onClick={() => templateKey && onApplyTemplate(templateKey)}
                  >
                    {applyingTemplate ? 'Applying…' : 'Apply template'}
                  </Button>
                </div>
              </div>
            ) : null} */}

            {loading ? (
              <LoadingState message="Loading permissions…" />
            ) : (
              permissionGroups.map((group) => (
                <div key={group.key} className="space-y-3">
                  <h3 className="text-xs font-medium tracking-wide text-black-400 uppercase">
                    {group.label}
                  </h3>
                  <ul className="space-y-3">
                    {group.permissions.map((permission) => (
                      <li key={permission.reference}>
                        <Label className="flex cursor-pointer items-center gap-3 font-sans text-xs/[19.6px] font-normal text-black-500">
                          <AppCheckbox
                            checked={isSelected(permission.reference)}
                            onCheckedChange={(checked) =>
                              onToggle(permission.reference, checked)
                            }
                          />
                          {formatPermissionLabel(permission)}
                        </Label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        }
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold text-neutral-950 hover:bg-transparent"
              disabled={actionsDisabled}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold"
              disabled={actionsDisabled}
              onClick={onConfirm}
            >
              {saving ? 'Saving…' : 'Save permissions'}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
