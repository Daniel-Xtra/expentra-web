import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppSelect from '@/shared/reusable/AppSelect';
import AppTextarea from '@/shared/reusable/AppTextarea';
import type { CreateRoleFormValues } from '@/features/roles/schemas';
import type { RoleTemplateResponse } from '@/features/roles/api';

const BLANK_TEMPLATE_VALUE = '__blank__';

type RoleFormFieldsProps = {
  form: UseFormReturn<CreateRoleFormValues>;
  nameId: string;
  descriptionId: string;
  templates?: RoleTemplateResponse[];
  showTemplate?: boolean;
};

export function RoleFormFields({
  form,
  nameId,
  descriptionId,
  templates = [],
  showTemplate = false,
}: RoleFormFieldsProps) {
  const selectedKey =
    useWatch({ control: form.control, name: 'templateKey' }) ?? '';
  const selectedTemplate = templates.find((template) => template.key === selectedKey);

  const templateOptions = [
    { value: BLANK_TEMPLATE_VALUE, label: 'Blank role (no permissions)' },
    ...templates.map((template) => ({
      value: template.key,
      label: `${template.name} (${template.permissionCount} permissions)`,
    })),
  ];

  return (
    <Form {...form}>
      <div className="space-y-6 font-sans">
      {showTemplate ? (
        <div className="space-y-3">
          <AppFormLabel className="text-black-400">Permission template</AppFormLabel>
          <Controller
            control={form.control}
            name="templateKey"
            render={({ field }) => (
              <AppSelect
                placeholder="Select a template"
                options={templateOptions}
                value={field.value || BLANK_TEMPLATE_VALUE}
                onChange={(value) =>
                  field.onChange(value === BLANK_TEMPLATE_VALUE ? '' : value)
                }
              />
            )}
          />
          <p className="font-sans text-xs/[16.8px] text-black-400">
            {selectedTemplate
              ? selectedTemplate.description
              : 'Start from a template or leave blank and assign permissions after creation.'}
          </p>
        </div>
      ) : null}

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
                placeholder="e.g. Finance Manager"
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
              placeholder="Describe what this role is for"
              value={field.value ?? ''}
              onChange={field.onChange}
              showHint={false}
            />
          )}
        />
      </div>
      </div>
    </Form>
  );
}
