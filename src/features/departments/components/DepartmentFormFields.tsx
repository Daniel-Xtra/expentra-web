import { useQuery } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  NO_MANAGER_VALUE,
  type DepartmentFormValues,
} from '@/features/departments/department-form';
import { listDepartmentUsers } from '@/features/departments/api';
import { queryKeys } from '@/shared/api/query-keys';
import { FormField } from '@/shared/components/FormField';
import { LoadingState } from '@/shared/components/LoadingState';
import { RhfSelectField } from '@/shared/components/RhfSelectField';
import { formatUserName } from '@/shared/utils/user';
import type { DepartmentResponse } from '@/types/api';

type DepartmentFormFieldsProps = {
  form: UseFormReturn<DepartmentFormValues>;
  idPrefix: string;
  departmentReference?: string;
  currentManager?: DepartmentResponse['manager'];
  pendingApprovalCount?: number;
};

export function DepartmentFormFields({
  form,
  idPrefix,
  departmentReference,
  currentManager,
  pendingApprovalCount = 0,
}: DepartmentFormFieldsProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

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

  const currentManagerRef = form.watch('managerReference');
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

  return (
    <div className="grid grid-cols-1 gap-4">
      <FormField label="Name" htmlFor={`${idPrefix}-name`} error={errors.name?.message}>
        <Input
          id={`${idPrefix}-name`}
          aria-invalid={errors.name ? true : undefined}
          {...register('name')}
        />
      </FormField>

      <FormField label="Code" htmlFor={`${idPrefix}-code`} error={errors.code?.message}>
        <Input
          id={`${idPrefix}-code`}
          aria-invalid={errors.code ? true : undefined}
          {...register('code')}
        />
      </FormField>

      {departmentReference ? (
        membersQuery.isLoading ? (
          <LoadingState message="Loading team members…" />
        ) : (
          <>
            <RhfSelectField
              control={control}
              name="managerReference"
              label="Manager"
              placeholder="Select a manager"
              error={errors.managerReference?.message}
              options={managerOptions}
            />
            <p className="text-xs text-muted-foreground">
              {pendingApprovalCount > 0
                ? 'A manager must remain assigned while expenses are awaiting approval. Choose another employee to hand over approval responsibility.'
                : memberOptions.length === 0
                  ? 'Add employees to this department first, then choose one as manager.'
                  : 'Only employees assigned to this department can be selected as manager.'}
            </p>
          </>
        )
      ) : (
        <p className="text-xs text-muted-foreground">
          After creating the department, assign employees in Team Management, then choose a
          manager when editing the department.
        </p>
      )}
    </div>
  );
}
