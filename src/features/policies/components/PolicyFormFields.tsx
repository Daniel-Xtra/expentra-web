import { Controller, type UseFormReturn } from 'react-hook-form';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/shared/components/EmptyState';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppSelect from '@/shared/reusable/AppSelect';
import AppTextarea from '@/shared/reusable/AppTextarea';
import type { PolicyCatalogResponse } from '@/types/api';
import type { EditPolicyFormValues, PolicyFormValues } from '../policy-config';
import { PolicyConditionBuilder } from './PolicyConditionBuilder';

type PolicyFormFieldsProps = {
  form: UseFormReturn<PolicyFormValues | EditPolicyFormValues>;
  catalog: PolicyCatalogResponse;
  showTemplates?: boolean;
  showStatus?: boolean;
};

export function PolicyFormFields({
  form,
  catalog,
  showTemplates = true,
  showStatus = false,
}: PolicyFormFieldsProps) {
  const hasCatalogFields = catalog.fields.length > 0;

  const severityOptions = [
    {
      value: 'WARN',
      label: 'Warning — employee can justify and still submit',
    },
    {
      value: 'BLOCK',
      label: 'Block — employee cannot submit until resolved',
    },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <Form {...form}>
      <div className="space-y-6 font-sans">
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-950">Policy details</h3>
            <p className="text-xs/[16.8px] text-black-400">
              Name the rule and choose how employees experience violations.
            </p>
          </div>

          <div className="space-y-3">
            <AppFormLabel htmlFor="policy-name" className="text-black-400">
              Policy name
            </AppFormLabel>
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <AppFormInput
                    id="policy-name"
                    placeholder="e.g. Receipt required above ₦5,000"
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
            <AppFormLabel className="text-black-400">Severity</AppFormLabel>
            <Controller
              control={form.control}
              name="severity"
              render={({ field, fieldState }) => (
                <>
                  <AppSelect
                    placeholder="Select severity"
                    options={severityOptions}
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

          <div className="space-y-3">
            <AppFormLabel htmlFor="policy-custom-message" className="text-black-400">
              Employee message (optional)
            </AppFormLabel>
            <Controller
              control={form.control}
              name="customMessage"
              render={({ field, fieldState }) => (
                <>
                  <AppTextarea
                    placeholder="Explain what the employee should do when this policy is triggered."
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    showHint={false}
                    className={cn(
                      fieldState.error &&
                        'border-error-500! focus-visible:border-error-500!',
                    )}
                  />
                  {fieldState.error ? (
                    <p className="text-xs text-error-500">{fieldState.error.message}</p>
                  ) : null}
                </>
              )}
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-black-50 pt-6">
          <div>
            <h3 className="text-sm font-semibold text-neutral-950">Rule conditions</h3>
            <p className="text-xs/[16.8px] text-black-400">
              Define when this policy applies. All policies use the same condition engine.
            </p>
          </div>

          {!hasCatalogFields ? (
            <EmptyState
              title="No condition fields configured"
              description="Add condition fields under Rule catalog before creating policy rules."
            />
          ) : (
            <PolicyConditionBuilder
              catalog={catalog}
              form={form}
              showTemplates={showTemplates}
            />
          )}
        </section>

        {showStatus ? (
          <section className="space-y-3 border-t border-black-50 pt-6">
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
          </section>
        ) : null}
      </div>
    </Form>
  );
}
