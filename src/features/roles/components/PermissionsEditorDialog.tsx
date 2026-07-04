import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DialogActions } from '@/shared/components/DialogActions';
import { OrgGrantsCallout } from '@/shared/components/OrgGrantsPanel';
import { LoadingState } from '@/shared/components/LoadingState';
import {
  formatPermissionLabel,
  formatRoleName,
  summarizePermissionResources,
} from '@/shared/utils/format';
import type { PermissionGroup } from '@/shared/utils/format';
import type { RoleTemplateResponse } from '@/features/roles/api';
import type { RoleResponse } from '@/types/api';
import { useMemo, useState } from 'react';

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
  templates = [],
  isSelected,
  onToggle,
  onApplyTemplate,
  onCancel,
  onConfirm,
}: PermissionsEditorDialogProps) {
  const [templateKey, setTemplateKey] = useState('');

  const effectiveAreas = useMemo(() => {
    const allPermissions = permissionGroups.flatMap((group) => group.permissions);
    return summarizePermissionResources(
      allPermissions.filter((permission) => isSelected(permission.reference)),
    );
  }, [permissionGroups, selectedCount, isSelected]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Edit permissions
            {role ? ` — ${formatRoleName(role.name)}` : ''}
          </DialogTitle>
          <DialogDescription>
            {selectedCount} permission
            {selectedCount === 1 ? '' : 's'} selected. Checked items are currently assigned to
            this role.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {effectiveAreas.length > 0 ? (
            <div className="mb-4 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">Effective access areas</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Can manage: {effectiveAreas.join(', ')}
              </p>
            </div>
          ) : null}
          <OrgGrantsCallout />
          {templates.length > 0 && onApplyTemplate ? (
            <div className="mb-4 flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <Label htmlFor="apply-role-template" className="text-xs font-medium">
                  Replace with template
                </Label>
                <select
                  id="apply-role-template"
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={templateKey}
                  onChange={(e) => setTemplateKey(e.target.value)}
                >
                  <option value="">Select template…</option>
                  {templates.map((template) => (
                    <option key={template.key} value={template.key}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={!templateKey || applyingTemplate || saving}
                onClick={() => templateKey && onApplyTemplate(templateKey)}
              >
                {applyingTemplate ? 'Applying…' : 'Apply template'}
              </Button>
            </div>
          ) : null}
          {loading ? (
            <LoadingState message="Loading permissions…" />
          ) : (
            permissionGroups.map((group) => (
              <div key={group.key} className="mb-5 last:mb-0">
                <h3 className="mb-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </h3>
                <ul className="space-y-2">
                  {group.permissions.map((permission) => (
                    <li key={permission.reference}>
                      <Label className="flex cursor-pointer items-center gap-2.5 text-sm font-normal">
                        <input
                          type="checkbox"
                          checked={isSelected(permission.reference)}
                          onChange={(e) => onToggle(permission.reference, e.target.checked)}
                        />
                        {formatPermissionLabel(permission)}
                      </Label>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </DialogBody>
        <DialogActions
          loading={saving || loading || applyingTemplate}
          confirmLabel="Save permissions"
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
