import { Controller, type UseFormReturn } from 'react-hook-form';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { PolicyConditionBuilder } from '@/features/policies/components/PolicyConditionBuilder';
import type { TemplateFormValues } from '@/features/policies/policy-config';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppTextarea from '@/shared/reusable/AppTextarea';
import type { PolicyCatalogResponse } from '@/types/api';

type CatalogTemplateFormFieldsProps = {
  form: UseFormReturn<TemplateFormValues>;
  catalog: PolicyCatalogResponse;
};

export function CatalogTemplateFormFields({
  form,
  catalog,
}: CatalogTemplateFormFieldsProps) {
  return (
    <Form {...form}>
      <div className="space-y-6 font-sans">
        <div className="space-y-3">
          <AppFormLabel htmlFor="template-name" className="text-black-400">
            Template name
          </AppFormLabel>
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <AppFormInput
                  id="template-name"
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
          <AppFormLabel htmlFor="template-description" className="text-black-400">
            Description
          </AppFormLabel>
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <>
                <AppTextarea
                  placeholder="Short explanation shown in the template picker."
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

        <PolicyConditionBuilder catalog={catalog} form={form} showTemplates={false} />
      </div>
    </Form>
  );
}
