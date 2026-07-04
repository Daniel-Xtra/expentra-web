import type { UseFormReturn } from 'react-hook-form';
import { FormDialog } from '@/shared/components/FormDialog';
import { OrgGrantsCallout } from '@/shared/components/OrgGrantsPanel';
import { RhfSelectField } from '@/shared/components/RhfSelectField';
import { NONE_VALUE } from '@/features/users/constants';
import type { EditEmployeeFormValues } from '@/features/users/schemas';
import { formatLabel, formatRoleName } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';
import type { DepartmentResponse, RoleResponse, UserResponse } from '@/types/api';

type EditEmployeeDialogProps = {
  user: UserResponse | null;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<EditEmployeeFormValues>;
  loading: boolean;
  onSubmit: () => void;
  allRoles: RoleResponse[];
  departments: DepartmentResponse[];
};

export function EditEmployeeDialog({
  user,
  onOpenChange,
  form,
  loading,
  onSubmit,
  allRoles,
  departments,
}: EditEmployeeDialogProps) {
  return (
    <FormDialog
      title="Edit employee"
      className="sm:max-w-lg"
      open={Boolean(user)}
      onOpenChange={onOpenChange}
      submitLabel="Save changes"
      loading={loading}
      onSubmit={onSubmit}
    >
      {user && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {formatUserName(user)} · {user.email}
          </p>
          <OrgGrantsCallout />
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
      )}
    </FormDialog>
  );
}
