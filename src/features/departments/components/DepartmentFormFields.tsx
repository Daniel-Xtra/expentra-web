import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  NO_MANAGER_VALUE,
  type DepartmentFormValues,
} from '@/features/departments/department-form';
import { listDepartmentUsers } from '@/features/departments/api';
import { queryKeys } from '@/shared/api/query-keys';
import { LoadingState } from '@/shared/components/LoadingState';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppSelect from '@/shared/reusable/AppSelect';
import { formatUserName } from '@/shared/utils/user';
import type { DepartmentResponse } from '@/types/api';
import { useQuery } from '@tanstack/react-query';

type DepartmentFormFieldsProps = {
  form: UseFormReturn<DepartmentFormValues>;
  nameId: string;
  codeId: string;
  departmentReference?: string;
  currentManager?: DepartmentResponse['manager'];
  pendingApprovalCount?: number;
};

export function DepartmentFormFields({
  form,
  nameId,
  codeId,
  departmentReference,
  currentManager,
  pendingApprovalCount = 0,
}: DepartmentFormFieldsProps) {
  const membersQuery = useQuery({
    queryKey: queryKeys.departments.managerOptions(departmentReference ?? ''),
    queryFn: () => listDepartmentUsers(departmentReference!, { page: 1, limit: 100 }),
    enabled: Boolean(departmentReference),
  });

  const memberOptions = (membersQuery.data?.items ?? [])
    .filter((user) => user.isActive)
    .map((user) => ({
      value: user.reference,
      label: `${formatUserName(user)} · ${user.email}`,
    }));

  const currentManagerRef =
    useWatch({ control: form.control, name: 'managerReference' }) ?? NO_MANAGER_VALUE;

  const currentManagerNotInMembers =
    currentManagerRef &&
    currentManagerRef !== NO_MANAGER_VALUE &&
    !memberOptions.some((option) => option.value === currentManagerRef);

  const managerOptions = [
    ...(pendingApprovalCount === 0
      ? [{ value: NO_MANAGER_VALUE, label: 'No manager' }]
      : []),
    ...(currentManagerNotInMembers && currentManager
      ? [
          {
            value: currentManager.reference,
            label: `${formatUserName(currentManager)} · ${currentManager.email} (not a department member)`,
          },
        ]
      : []),
    ...memberOptions,
  ];

  const managerHint = pendingApprovalCount > 0
    ? 'A manager must remain assigned while expenses are awaiting approval. Choose another employee to hand over approval responsibility.'
    : memberOptions.length === 0
      ? 'Add employees to this department first, then choose one as manager.'
      : 'Only employees assigned to this department can be selected as manager.';

  return (
    <Form {...form}>
      <div className="space-y-6 font-sans">
        <div className="space-y-3">
          <AppFormLabel htmlFor={nameId} className="text-black-400">
            Name
          </AppFormLabel>
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <AppFormInput
                  id={nameId}
                  placeholder="e.g. Operations"
                  {...field}
                  aria-invalid={fieldState.invalid ? true : undefined}
                  className={cn(
                    fieldState.error &&
                      'border-error-500! focus-visible:border-error-500!',
                  )}
                />
                <FormMessage className="text-xs text-error-500" />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <AppFormLabel htmlFor={codeId} className="text-black-400">
            Code
          </AppFormLabel>
          <FormField
            control={form.control}
            name="code"
            render={({ field, fieldState }) => (
              <FormItem>
                <AppFormInput
                  id={codeId}
                  placeholder="e.g. OPS"
                  {...field}
                  aria-invalid={fieldState.invalid ? true : undefined}
                  className={cn(
                    fieldState.error &&
                      'border-error-500! focus-visible:border-error-500!',
                  )}
                />
                <FormMessage className="text-xs text-error-500" />
              </FormItem>
            )}
          />
        </div>

        {departmentReference ? (
          membersQuery.isLoading ? (
            <LoadingState message="Loading team members…" />
          ) : (
            <div className="space-y-3">
              <AppFormLabel className="text-black-400">Manager</AppFormLabel>
              <Controller
                control={form.control}
                name="managerReference"
                render={({ field, fieldState }) => (
                  <>
                    <AppSelect
                      placeholder="Select a manager"
                      options={managerOptions}
                      value={field.value || NO_MANAGER_VALUE}
                      onChange={field.onChange}
                      error={Boolean(fieldState.error)}
                    />
                    {fieldState.error ? (
                      <p className="text-xs text-error-500">{fieldState.error.message}</p>
                    ) : null}
                  </>
                )}
              />
              <p className="font-sans text-xs/[16.8px] text-black-400">{managerHint}</p>
            </div>
          )
        ) : (
          <p className="font-sans text-xs/[16.8px] text-black-400">
            After creating the department, assign employees in Users, then choose a manager when
            editing the department.
          </p>
        )}
      </div>
    </Form>
  );
}
