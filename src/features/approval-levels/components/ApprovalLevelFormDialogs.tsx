import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormDialog } from '@/shared/components/FormDialog';
import { FormField } from '@/shared/components/FormField';
import { RhfSelectField } from '@/shared/components/RhfSelectField';
import {
  APPROVER_TYPE_OPTIONS,
  type ApprovalLevelFormValues,
  type EditApprovalLevelFormValues,
} from '@/features/approval-levels/schemas';
import { formatRoleName } from '@/shared/utils/format';
import type { RoleResponse } from '@/types/api';

type CreateApprovalLevelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ApprovalLevelFormValues>;
  approverType: string;
  roles: RoleResponse[];
  loading: boolean;
  onSubmit: () => void;
};

export function CreateApprovalLevelDialog({
  open,
  onOpenChange,
  form,
  approverType,
  roles,
  loading,
  onSubmit,
}: CreateApprovalLevelDialogProps) {
  const { register, control, formState: { errors } } = form;

  return (
    <FormDialog
      title="Add approval level"
      open={open}
      onOpenChange={onOpenChange}
      submitLabel="Create level"
      loading={loading}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Name" htmlFor="level-name" error={errors.name?.message} className="col-span-2">
          <Input
            id="level-name"
            aria-invalid={errors.name ? true : undefined}
            {...register('name')}
          />
        </FormField>
        <FormField
          label="Description"
          htmlFor="level-description"
          error={errors.description?.message}
          className="col-span-2"
        >
          <Textarea
            id="level-description"
            rows={3}
            placeholder="Optional guidance for admins and approvers"
            {...register('description')}
          />
        </FormField>
        <RhfSelectField
          control={control}
          name="approverType"
          label="Approver"
          error={errors.approverType?.message}
          className="col-span-2"
          options={APPROVER_TYPE_OPTIONS}
        />
        {approverType === 'finance_manager' ? (
          <RhfSelectField
            control={control}
            name="roleReference"
            label="Finance role"
            placeholder="Select role"
            error={errors.roleReference?.message}
            className="col-span-2"
            options={roles.map((role) => ({
              value: role.reference,
              label: formatRoleName(role.name),
            }))}
          />
        ) : null}
        <FormField label="Level order" htmlFor="level-order" error={errors.level?.message} className="col-span-2">
          <Input
            id="level-order"
            type="number"
            min={1}
            aria-invalid={errors.level ? true : undefined}
            {...register('level', { valueAsNumber: true })}
          />
        </FormField>
      </div>
    </FormDialog>
  );
}

type EditApprovalLevelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<EditApprovalLevelFormValues>;
  approverType: string;
  roles: RoleResponse[];
  loading: boolean;
  onSubmit: () => void;
};

export function EditApprovalLevelDialog({
  open,
  onOpenChange,
  form,
  approverType,
  roles,
  loading,
  onSubmit,
}: EditApprovalLevelDialogProps) {
  const { register, control, formState: { errors } } = form;

  return (
    <FormDialog
      title="Edit approval level"
      open={open}
      onOpenChange={onOpenChange}
      submitLabel="Save changes"
      loading={loading}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Name"
          htmlFor="edit-level-name"
          error={errors.name?.message}
          className="col-span-2"
        >
          <Input id="edit-level-name" {...register('name')} />
        </FormField>
        <FormField
          label="Description"
          htmlFor="edit-level-description"
          error={errors.description?.message}
          className="col-span-2"
        >
          <Textarea id="edit-level-description" rows={3} {...register('description')} />
        </FormField>
        <RhfSelectField
          control={control}
          name="approverType"
          label="Approver"
          error={errors.approverType?.message}
          className="col-span-2"
          options={APPROVER_TYPE_OPTIONS}
        />
        {approverType === 'finance_manager' ? (
          <RhfSelectField
            control={control}
            name="roleReference"
            label="Finance role"
            placeholder="Select role"
            error={errors.roleReference?.message}
            className="col-span-2"
            options={roles.map((role) => ({
              value: role.reference,
              label: formatRoleName(role.name),
            }))}
          />
        ) : null}
        <FormField
          label="Level order"
          htmlFor="edit-level-order"
          error={errors.level?.message}
          className="col-span-2"
        >
          <Input
            id="edit-level-order"
            type="number"
            min={1}
            {...register('level', { valueAsNumber: true })}
          />
        </FormField>
        <RhfSelectField
          control={control}
          name="isActive"
          label="Status"
          error={errors.isActive?.message}
          className="col-span-2"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </div>
    </FormDialog>
  );
}
