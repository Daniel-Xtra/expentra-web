import type { UseFormReturn } from 'react-hook-form';
import { ApprovalLevelFormFields } from '@/features/approval-levels/components/ApprovalLevelFormFields';
import type {
  ApprovalLevelFormValues,
  EditApprovalLevelFormValues,
} from '@/features/approval-levels/schemas';
import { AppFormDialog } from '@/shared/reusable/AppFormDialog';
import type { ApprovalLevelResponse, RoleResponse } from '@/types/api';

type CreateApprovalLevelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ApprovalLevelFormValues>;
  roles: RoleResponse[];
  catalogLoading?: boolean;
  loading: boolean;
  onSubmit: () => void;
};

export function CreateApprovalLevelDialog({
  open,
  onOpenChange,
  form,
  roles,
  catalogLoading = false,
  loading,
  onSubmit,
}: CreateApprovalLevelDialogProps) {
  return (
    <AppFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add approval level"
      description="Define a step in the expense approval chain."
      submitLabel="Create level"
      loading={loading}
      onSubmit={onSubmit}
    >
      <ApprovalLevelFormFields
        form={form as UseFormReturn<ApprovalLevelFormValues | EditApprovalLevelFormValues>}
        mode="create"
        roles={roles}
        catalogLoading={catalogLoading}
        nameId="level-name"
        descriptionId="level-description"
        levelId="level-order"
      />
    </AppFormDialog>
  );
}

type EditApprovalLevelDialogProps = {
  level: ApprovalLevelResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<EditApprovalLevelFormValues>;
  roles: RoleResponse[];
  catalogLoading?: boolean;
  loading: boolean;
  onSubmit: () => void;
};

export function EditApprovalLevelDialog({
  level,
  open,
  onOpenChange,
  form,
  roles,
  catalogLoading = false,
  loading,
  onSubmit,
}: EditApprovalLevelDialogProps) {
  return (
    <AppFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit approval level"
      description={
        level
          ? `Update ${level.name} (level ${level.level}).`
          : 'Update the approval level details.'
      }
      submitLabel="Save changes"
      loading={loading}
      onSubmit={onSubmit}
    >
      {level ? (
        <ApprovalLevelFormFields
          form={
            form as UseFormReturn<
              ApprovalLevelFormValues | EditApprovalLevelFormValues
            >
          }
          mode="edit"
          roles={roles}
          catalogLoading={catalogLoading}
          nameId="edit-level-name"
          descriptionId="edit-level-description"
          levelId="edit-level-order"
        />
      ) : null}
    </AppFormDialog>
  );
}
