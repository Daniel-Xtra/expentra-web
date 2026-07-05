import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  APPROVER_TYPE_OPTIONS,
  type ApprovalLevelFormValues,
  type EditApprovalLevelFormValues,
} from '@/features/approval-levels/schemas';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppSelect from '@/shared/reusable/AppSelect';
import AppTextarea from '@/shared/reusable/AppTextarea';
import { formatRoleName } from '@/shared/utils/format';
import type { RoleResponse } from '@/types/api';

type ApprovalLevelFormFieldsProps = {
  form: UseFormReturn<ApprovalLevelFormValues | EditApprovalLevelFormValues>;
  mode: 'create' | 'edit';
  roles: RoleResponse[];
  nameId: string;
  descriptionId: string;
  levelId: string;
};

export function ApprovalLevelFormFields({
  form,
  mode,
  roles,
  nameId,
  descriptionId,
  levelId,
}: ApprovalLevelFormFieldsProps) {
  const approverType =
    useWatch({ control: form.control, name: 'approverType' }) ?? 'department_manager';

  const roleOptions = roles.map((role) => ({
    value: role.reference,
    label: formatRoleName(role.name),
  }));

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

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
                  placeholder="e.g. Department manager review"
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
          <AppFormLabel htmlFor={descriptionId} className="text-black-400">
            Description
          </AppFormLabel>
          <Controller
            control={form.control}
            name="description"
            render={({ field }) => (
              <AppTextarea
                placeholder="Optional guidance for admins and approvers"
                value={field.value ?? ''}
                onChange={field.onChange}
                showHint={false}
              />
            )}
          />
        </div>

        <div className="space-y-3">
          <AppFormLabel className="text-black-400">Approver</AppFormLabel>
          <Controller
            control={form.control}
            name="approverType"
            render={({ field, fieldState }) => (
              <>
                <AppSelect
                  placeholder="Select approver type"
                  options={APPROVER_TYPE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={Boolean(fieldState.error)}
                />
                {fieldState.error ? (
                  <p className="text-xs text-error-500">{fieldState.error.message}</p>
                ) : null}
              </>
            )}
          />
        </div>

        {approverType === 'finance_manager' ? (
          <div className="space-y-3">
            <AppFormLabel className="text-black-400">Finance role</AppFormLabel>
            <Controller
              control={form.control}
              name="roleReference"
              render={({ field, fieldState }) => (
                <>
                  <AppSelect
                    placeholder="Select role"
                    options={roleOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={Boolean(fieldState.error)}
                  />
                  {fieldState.error ? (
                    <p className="text-xs text-error-500">{fieldState.error.message}</p>
                  ) : null}
                </>
              )}
            />
          </div>
        ) : null}

        <div className="space-y-3">
          <AppFormLabel htmlFor={levelId} className="text-black-400">
            Level order
          </AppFormLabel>
          <FormField
            control={form.control}
            name="level"
            render={({ field, fieldState }) => (
              <FormItem>
                <AppFormInput
                  id={levelId}
                  type="number"
                  min={1}
                  placeholder="e.g. 1"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === '' ? undefined : Number(event.target.value),
                    )
                  }
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

        {mode === 'edit' ? (
          <div className="space-y-3">
            <AppFormLabel className="text-black-400">Status</AppFormLabel>
            <Controller
              control={form.control}
              name="isActive"
              render={({ field, fieldState }) => (
                <>
                  <AppSelect
                    placeholder="Select status"
                    options={statusOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={Boolean(fieldState.error)}
                  />
                  {fieldState.error ? (
                    <p className="text-xs text-error-500">{fieldState.error.message}</p>
                  ) : null}
                </>
              )}
            />
          </div>
        ) : null}
      </div>
    </Form>
  );
}
