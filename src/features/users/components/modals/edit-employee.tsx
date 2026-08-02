import { Controller, type UseFormReturn } from 'react-hook-form';
import { OrgGrantsCallout } from '@/shared/components/OrgGrantsPanel';
import { NONE_VALUE } from '@/features/users/constants';
import type { EditEmployeeFormValues } from '@/features/users/schemas';
import { AppFormDialog } from '@/shared/reusable/AppFormDialog';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppSelect from '@/shared/reusable/AppSelect';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { formatLabel, formatRoleName } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';
import type { DepartmentResponse, RoleResponse, UserResponse } from '@/types/api';

type EditEmployeeDialogProps = {
  user: UserResponse | null;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<EditEmployeeFormValues>;
  loading: boolean;
  catalogLoading?: boolean;
  onSubmit: () => void;
  allRoles: RoleResponse[];
  departments: DepartmentResponse[];
};

export function EditEmployeeDialog({
  user,
  onOpenChange,
  form,
  loading,
  catalogLoading = false,
  onSubmit,
  allRoles,
  departments,
}: EditEmployeeDialogProps) {
  const roleOptions = [
    { value: NONE_VALUE, label: 'No role' },
    ...allRoles.map((role) => ({
      value: role.reference,
      label: formatRoleName(role.name),
    })),
  ];

  const departmentOptions = [
    { value: NONE_VALUE, label: 'No department' },
    ...departments.map((dept) => ({
      value: dept.reference,
      label: formatLabel(dept.name),
    })),
  ];

  return (
    <AppFormDialog
      open={Boolean(user)}
      onOpenChange={onOpenChange}
      title="Edit employee"
      description={
        user
          ? `Update role and department for ${formatUserName(user)}.`
          : "Edit the employee's role and department."
      }
      submitLabel="Save changes"
      loading={loading}
      onSubmit={onSubmit}
    >
      {user ? (
        <div className="space-y-6 font-sans">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-sans text-sm font-semibold text-neutral-950">
                {formatUserName(user)}
              </p>
              <p className="truncate font-sans text-xs/[16.8px] text-black-400">
                {user.email}
              </p>
            </div>
          </div>
          <OrgGrantsCallout />
          <div className="space-y-3">
            <AppFormLabel className="text-black-400">Role</AppFormLabel>
            <Controller
              control={form.control}
              name="roleReference"
              render={({ field }) => (
                <AppSelect
                  placeholder={catalogLoading ? 'Loading roles…' : 'No role'}
                  options={roleOptions}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={catalogLoading}
                />
              )}
            />
          </div>
          <div className="space-y-3">
            <AppFormLabel className="text-black-400">Department</AppFormLabel>
            <Controller
              control={form.control}
              name="departmentReference"
              render={({ field }) => (
                <AppSelect
                  placeholder={catalogLoading ? 'Loading departments…' : 'No department'}
                  options={departmentOptions}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={catalogLoading}
                />
              )}
            />
          </div>
        </div>
      ) : null}
    </AppFormDialog>
  );
}
