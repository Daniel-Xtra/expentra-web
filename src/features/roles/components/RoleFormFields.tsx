import type { UseFormReturn } from 'react-hook-form';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/components/ui/input';
import type { CreateRoleFormValues } from '@/features/roles/schemas';
import type { RoleTemplateResponse } from '@/features/roles/api';

type RoleFormFieldsProps = {
  form: UseFormReturn<CreateRoleFormValues>;
  nameId: string;
  descriptionId: string;
  templateId?: string;
  templates?: RoleTemplateResponse[];
  showTemplate?: boolean;
};

export function RoleFormFields({
  form,
  nameId,
  descriptionId,
  templateId = 'role-template',
  templates = [],
  showTemplate = false,
}: RoleFormFieldsProps) {
  const selectedKey = form.watch('templateKey');
  const selectedTemplate = templates.find((template) => template.key === selectedKey);

  return (
    <div className="grid grid-cols-1 gap-4">
      {showTemplate ? (
        <FormField label="Permission template" htmlFor={templateId} className="col-span-1">
          <select
            id={templateId}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register('templateKey')}
          >
            <option value="">Blank role (no permissions)</option>
            {templates.map((template) => (
              <option key={template.key} value={template.key}>
                {template.name} ({template.permissionCount} permissions)
              </option>
            ))}
          </select>
          {selectedTemplate ? (
            <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Start from a template or leave blank and assign permissions after creation.
            </p>
          )}
        </FormField>
      ) : null}
      <FormField
        label="Name"
        htmlFor={nameId}
        error={form.formState.errors.name?.message}
        className="col-span-1"
      >
        <Input
          id={nameId}
          aria-invalid={form.formState.errors.name ? true : undefined}
          {...form.register('name')}
        />
        <p className="text-xs text-muted-foreground">
          Lowercase letters, numbers, and underscores. Spaces become underscores.
        </p>
      </FormField>
      <FormField label="Description" htmlFor={descriptionId} className="col-span-1">
        <Input id={descriptionId} {...form.register('description')} />
      </FormField>
    </div>
  );
}
