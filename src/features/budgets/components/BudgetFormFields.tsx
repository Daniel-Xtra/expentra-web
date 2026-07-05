import { Controller, type UseFormReturn } from 'react-hook-form';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type {
  BudgetFormValues,
  EditBudgetFormValues,
} from '@/features/budgets/schemas';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppSelect from '@/shared/reusable/AppSelect';
import { formatLabel } from '@/shared/utils/format';
import type { DepartmentResponse } from '@/types/api';

type CreateBudgetFormFieldsProps = {
  form: UseFormReturn<BudgetFormValues>;
  departments: DepartmentResponse[];
};

export function CreateBudgetFormFields({
  form,
  departments,
}: CreateBudgetFormFieldsProps) {
  const departmentOptions = departments.map((dept) => ({
    value: dept.reference,
    label: formatLabel(dept.name),
  }));

  return (
    <Form {...form}>
      <div className="space-y-6 font-sans">
        <div className="space-y-3">
          <AppFormLabel className="text-black-400">Department</AppFormLabel>
          <Controller
            control={form.control}
            name="departmentReference"
            render={({ field, fieldState }) => (
              <>
                <AppSelect
                  placeholder="Select department"
                  options={departmentOptions}
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <AppFormLabel htmlFor="budget-year" className="text-black-400">
              Year
            </AppFormLabel>
            <FormField
              control={form.control}
              name="year"
              render={({ field, fieldState }) => (
                <FormItem>
                  <AppFormInput
                    id="budget-year"
                    type="number"
                    placeholder="e.g. 2026"
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

          <div className="space-y-3">
            <AppFormLabel htmlFor="budget-amount" className="text-black-400">
              Limit (₦)
            </AppFormLabel>
            <FormField
              control={form.control}
              name="amountNaira"
              render={({ field, fieldState }) => (
                <FormItem>
                  <AppFormInput
                    id="budget-amount"
                    inputMode="decimal"
                    placeholder="e.g. 5000000"
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
        </div>
      </div>
    </Form>
  );
}

type EditBudgetFormFieldsProps = {
  form: UseFormReturn<EditBudgetFormValues>;
};

export function EditBudgetFormFields({ form }: EditBudgetFormFieldsProps) {
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <Form {...form}>
      <div className="space-y-6 font-sans">
        <div className="space-y-3">
          <AppFormLabel htmlFor="edit-budget-amount" className="text-black-400">
            Limit (₦)
          </AppFormLabel>
          <FormField
            control={form.control}
            name="amountNaira"
            render={({ field, fieldState }) => (
              <FormItem>
                <AppFormInput
                  id="edit-budget-amount"
                  inputMode="decimal"
                  placeholder="e.g. 5000000"
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
      </div>
    </Form>
  );
}
