import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { RoleFormFields } from '@/features/roles/components/RoleFormFields';
import type { CreateRoleFormValues } from '@/features/roles/schemas';
import { AppModal } from '@/shared/reusable/AppModal';
import { formatRoleName } from '@/shared/utils/format';
import type { RoleResponse } from '@/types/api';
import type { RoleTemplateResponse } from '@/features/roles/api';

type RoleDialogShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  loading: boolean;
  onSubmit: () => void;
  children: ReactNode;
};

function RoleDialogShell({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  loading,
  onSubmit,
  children,
}: RoleDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AppModal
        title={title}
        description={description}
        className="sm:max-w-lg"
        primaryFn={() => {}}
        content={children}
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold text-neutral-950 hover:bg-transparent"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold"
              disabled={loading}
              onClick={onSubmit}
            >
              {loading ? 'Saving…' : submitLabel}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

type CreateRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreateRoleFormValues>;
  loading: boolean;
  templates?: RoleTemplateResponse[];
  onSubmit: () => void;
};

export function CreateRoleDialog({
  open,
  onOpenChange,
  form,
  loading,
  templates = [],
  onSubmit,
}: CreateRoleDialogProps) {
  return (
    <RoleDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Create role"
      description="Add a new role and optionally start from a permission template."
      submitLabel="Create role"
      loading={loading}
      onSubmit={onSubmit}
    >
      <RoleFormFields
        form={form}
        nameId="role-name"
        descriptionId="role-description"
        templates={templates}
        showTemplate
      />
    </RoleDialogShell>
  );
}

type EditRoleDialogProps = {
  role: RoleResponse | null;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreateRoleFormValues>;
  loading: boolean;
  onSubmit: () => void;
};

export function EditRoleDialog({
  role,
  onOpenChange,
  form,
  loading,
  onSubmit,
}: EditRoleDialogProps) {
  return (
    <RoleDialogShell
      open={Boolean(role)}
      onOpenChange={onOpenChange}
      title="Edit role"
      description={
        role
          ? `Update the name and description for ${formatRoleName(role.name)}.`
          : 'Update the role name and description.'
      }
      submitLabel="Save changes"
      loading={loading}
      onSubmit={onSubmit}
    >
      {role ? (
        <RoleFormFields
          form={form}
          nameId="edit-role-name"
          descriptionId="edit-role-description"
        />
      ) : null}
    </RoleDialogShell>
  );
}
