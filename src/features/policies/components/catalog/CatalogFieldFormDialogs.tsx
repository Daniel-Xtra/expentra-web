import type { UseFormReturn } from 'react-hook-form';
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CatalogFieldFormFields } from '@/features/policies/components/catalog/CatalogFieldFormFields';
import type { CatalogFieldFormState } from '@/features/policies/components/catalog/CatalogFieldFormParts';
import { PolicyConditionBuilder } from '@/features/policies/PolicyConditionBuilder';
import type {
  PolicyConditionFormShape,
  TemplateFormValues,
} from '@/features/policies/policy-config';
import { FormDialog } from '@/shared/components/FormDialog';
import { FormField } from '@/shared/components/FormField';
import type { PolicyCatalogField, PolicyCatalogResponse } from '@/types/api';

type CatalogCreateFieldDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: PolicyCatalogResponse;
  field: CatalogFieldFormState | null;
  definition: PolicyCatalogField | null;
  availableDefinitions: PolicyCatalogField[];
  loading: boolean;
  onChange: (field: CatalogFieldFormState) => void;
  onSelectDefinition: (key: string) => void;
  onSubmit: () => void | Promise<void>;
};

export function CatalogCreateFieldDialog({
  open,
  onOpenChange,
  catalog,
  field,
  definition,
  availableDefinitions,
  loading,
  onChange,
  onSelectDefinition,
  onSubmit,
}: CatalogCreateFieldDialogProps) {
  return (
    <FormDialog
      title="Add condition field"
      description="Choose an engine-supported field and configure how it appears in the policy builder."
      open={open}
      onOpenChange={onOpenChange}
      submitLabel="Create field"
      loading={loading}
      contentClassName="max-h-[70vh] overflow-y-auto"
      onSubmit={onSubmit}
    >
      {field && definition ? (
        <CatalogFieldFormFields
          mode="create"
          catalog={catalog}
          field={field}
          definition={definition}
          availableDefinitions={availableDefinitions}
          onChange={onChange}
          onSelectDefinition={onSelectDefinition}
        />
      ) : null}
    </FormDialog>
  );
}

type CatalogEditFieldDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: PolicyCatalogResponse;
  field: (CatalogFieldFormState & { reference: string }) | null;
  definition: PolicyCatalogField | null;
  loading: boolean;
  onChange: (field: CatalogFieldFormState & { reference: string }) => void;
  onSubmit: () => void | Promise<void>;
};

export function CatalogEditFieldDialog({
  open,
  onOpenChange,
  catalog,
  field,
  definition,
  loading,
  onChange,
  onSubmit,
}: CatalogEditFieldDialogProps) {
  return (
    <FormDialog
      title="Edit condition field"
      open={open}
      onOpenChange={onOpenChange}
      submitLabel="Save field"
      loading={loading}
      contentClassName="max-h-[70vh] overflow-y-auto"
      onSubmit={onSubmit}
    >
      {field && definition ? (
        <CatalogFieldFormFields
          mode="edit"
          catalog={catalog}
          field={field}
          definition={definition}
          onChange={(updated) => onChange({ ...updated, reference: field.reference })}
        />
      ) : null}
    </FormDialog>
  );
}

type CatalogCreateTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: PolicyCatalogResponse;
  templateForm: UseFormReturn<TemplateFormValues>;
  loading: boolean;
  onSubmit: () => void | Promise<void>;
};

export function CatalogCreateTemplateDialog({
  open,
  onOpenChange,
  catalog,
  templateForm,
  loading,
  onSubmit,
}: CatalogCreateTemplateDialogProps) {
  return (
    <FormDialog
      title="Add template"
      description="Templates appear as quick-start options when creating a new policy."
      open={open}
      onOpenChange={onOpenChange}
      submitLabel="Create template"
      loading={loading}
      className="max-w-3xl"
      contentClassName="max-h-[70vh] overflow-y-auto"
      onSubmit={onSubmit}
    >
      <div className="space-y-6">
        <FormField
          label="Template name"
          htmlFor="template-name"
          error={templateForm.formState.errors.name?.message}
        >
          <Input
            id="template-name"
            placeholder="e.g. Receipt required above ₦5,000"
            {...templateForm.register('name')}
          />
        </FormField>
        <FormField
          label="Description"
          htmlFor="template-description"
          error={templateForm.formState.errors.description?.message}
        >
          <Textarea
            id="template-description"
            rows={2}
            placeholder="Short explanation shown in the template picker."
            {...templateForm.register('description')}
          />
        </FormField>
        <PolicyConditionBuilder
          catalog={catalog}
          control={templateForm.control as unknown as Control<PolicyConditionFormShape>}
          errors={templateForm.formState.errors as unknown as FieldErrors<PolicyConditionFormShape>}
          watch={templateForm.watch as unknown as UseFormWatch<PolicyConditionFormShape>}
          setValue={templateForm.setValue as unknown as UseFormSetValue<PolicyConditionFormShape>}
          register={templateForm.register as unknown as UseFormRegister<PolicyConditionFormShape>}
          showTemplates={false}
        />
      </div>
    </FormDialog>
  );
}
