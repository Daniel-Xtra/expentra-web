import { useWatch, type UseFormReturn } from 'react-hook-form';
import { FormDialog } from '@/shared/components/FormDialog';
import { PasswordInputField } from '@/shared/components/PasswordInputField';
import { RhfInputField } from '@/shared/components/RhfInputField';
import { RhfSelectField } from '@/shared/components/RhfSelectField';
import { NONE_VALUE } from '@/features/users/constants';
import type { CreateUserFormValues } from '@/features/users/schemas';
import { formatLabel, formatRoleName } from '@/shared/utils/format';
import type { DepartmentResponse, RoleResponse } from '@/types/api';

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreateUserFormValues>;
  loading: boolean;
  onSubmit: () => void;
  allRoles: RoleResponse[];
  departments: DepartmentResponse[];
};

export function CreateUserDialog({
  open,
  onOpenChange,
  form,
  loading,
  onSubmit,
  allRoles,
  departments,
}: CreateUserDialogProps) {
  const password = useWatch({ control: form.control, name: 'password' }) ?? '';

  return (
    <FormDialog
      title="Add employee"
      className="sm:max-w-lg"
      open={open}
      onOpenChange={onOpenChange}
      submitLabel="Create employee"
      loading={loading}
      onSubmit={onSubmit}
    >
      <div className="space-y-4">
        <RhfInputField
          register={form.register}
          name="firstName"
          label="First name"
          error={form.formState.errors.firstName?.message}
        />
        <RhfInputField
          register={form.register}
          name="lastName"
          label="Last name"
          error={form.formState.errors.lastName?.message}
        />
        <RhfInputField
          register={form.register}
          name="email"
          label="Email"
          type="email"
          error={form.formState.errors.email?.message}
        />
        <PasswordInputField
          register={form.register}
          name="password"
          label="Temporary password"
          autoComplete="new-password"
          error={form.formState.errors.password?.message}
          criteriaValue={password}
          showCriteria
        />
        <PasswordInputField
          register={form.register}
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          error={form.formState.errors.confirmPassword?.message}
        />
        <RhfSelectField
          control={form.control}
          name="roleReference"
          label="Role"
          placeholder="No role"
          options={[
            { value: NONE_VALUE, label: 'No role' },
            ...allRoles.map((role) => ({
              value: role.reference,
              label: formatRoleName(role.name),
            })),
          ]}
        />
        <RhfSelectField
          control={form.control}
          name="departmentReference"
          label="Department"
          placeholder="No department"
          options={[
            { value: NONE_VALUE, label: 'No department' },
            ...departments.map((dept) => ({
              value: dept.reference,
              label: formatLabel(dept.name),
            })),
          ]}
        />
      </div>
    </FormDialog>
  );
}
