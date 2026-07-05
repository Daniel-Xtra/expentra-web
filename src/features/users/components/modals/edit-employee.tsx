import { Controller, type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { OrgGrantsCallout } from '@/shared/components/OrgGrantsPanel';
import { NONE_VALUE } from '@/features/users/constants';
import type { EditEmployeeFormValues } from '@/features/users/schemas';
import { AppModal } from '@/shared/reusable/AppModal';
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
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <AppModal
        title="Edit employee"
        description={
          user
            ? `Update role and department for ${formatUserName(user)}.`
            : "Edit the employee's role and department."
        }
        className="sm:max-w-lg"
        primaryFn={() => {}}
        content={
          user ? (
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
                      placeholder="No role"
                      options={roleOptions}
                      value={field.value}
                      onChange={field.onChange}
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
                      placeholder="No department"
                      options={departmentOptions}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          ) : null
        }
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
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
