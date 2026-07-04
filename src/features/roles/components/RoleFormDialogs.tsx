import type { UseFormReturn } from 'react-hook-form';
import { FormDialog } from '@/shared/components/FormDialog';
import { RoleFormFields } from '@/features/roles/components/RoleFormFields';
import type { CreateRoleFormValues } from '@/features/roles/schemas';
import type { RoleResponse } from '@/types/api';

import type { RoleTemplateResponse } from '@/features/roles/api';

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
    <FormDialog
      title="Create role"
      open={open}
      onOpenChange={onOpenChange}
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
    </FormDialog>
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
    <FormDialog
      title="Edit role"
      open={Boolean(role)}
      onOpenChange={onOpenChange}
      submitLabel="Save changes"
      loading={loading}
      onSubmit={onSubmit}
    >
      <RoleFormFields form={form} nameId="edit-role-name" descriptionId="edit-role-description" />
    </FormDialog>
  );
}
