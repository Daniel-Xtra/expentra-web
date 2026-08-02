import type { UseFormReturn } from 'react-hook-form';
import { RoleFormFields } from '@/features/roles/components/RoleFormFields';
import type { CreateRoleFormValues } from '@/features/roles/schemas';
import { AppFormDialog } from '@/shared/reusable/AppFormDialog';
import { formatRoleName } from '@/shared/utils/format';
import type { RoleResponse } from '@/types/api';
import type { RoleTemplateResponse } from '@/features/roles/api';

type CreateRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreateRoleFormValues>;
  loading: boolean;
  templates?: RoleTemplateResponse[];
  templatesLoading?: boolean;
  onSubmit: () => void;
};

export function CreateRoleDialog({
  open,
  onOpenChange,
  form,
  loading,
  templates = [],
  templatesLoading = false,
  onSubmit,
}: CreateRoleDialogProps) {
  return (
    <AppFormDialog
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
        templatesLoading={templatesLoading}
        showTemplate
      />
    </AppFormDialog>
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
    <AppFormDialog
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
    </AppFormDialog>
  );
}
