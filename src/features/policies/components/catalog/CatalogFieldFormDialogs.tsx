import type { UseFormReturn } from 'react-hook-form';
import { CatalogFieldFormFields } from '@/features/policies/components/catalog/CatalogFieldFormFields';
import { CatalogTemplateFormFields } from '@/features/policies/components/catalog/CatalogTemplateFormFields';
import type { CatalogFieldFormState } from '@/features/policies/components/catalog/CatalogFieldFormParts';
import type { TemplateFormValues } from '@/features/policies/policy-config';
import { AppFormDialog } from '@/shared/reusable/AppFormDialog';
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
    <AppFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add condition field"
      description="Choose an engine-supported field and configure how it appears in the policy builder."
      submitLabel="Create field"
      loading={loading}
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
    </AppFormDialog>
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
    <AppFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit condition field"
      submitLabel="Save field"
      loading={loading}
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
    </AppFormDialog>
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
    <AppFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add template"
      description="Templates appear as quick-start options when creating a new policy."
      submitLabel="Create template"
      loading={loading}
      className="sm:max-w-3xl"
      onSubmit={onSubmit}
    >
      <CatalogTemplateFormFields form={templateForm} catalog={catalog} />
    </AppFormDialog>
  );
}
