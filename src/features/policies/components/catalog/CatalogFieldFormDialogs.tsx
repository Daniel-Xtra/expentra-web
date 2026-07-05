import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { CatalogFieldFormFields } from '@/features/policies/components/catalog/CatalogFieldFormFields';
import { CatalogTemplateFormFields } from '@/features/policies/components/catalog/CatalogTemplateFormFields';
import type { CatalogFieldFormState } from '@/features/policies/components/catalog/CatalogFieldFormParts';
import type { TemplateFormValues } from '@/features/policies/policy-config';
import { AppModal } from '@/shared/reusable/AppModal';
import type { PolicyCatalogField, PolicyCatalogResponse } from '@/types/api';

type CatalogDialogShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  loading: boolean;
  onSubmit: () => void | Promise<void>;
  className?: string;
  children: ReactNode;
};

function CatalogDialogShell({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  loading,
  onSubmit,
  className = 'sm:max-w-lg',
  children,
}: CatalogDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AppModal
        title={title}
        description={description}
        className={className}
        primaryFn={() => {}}
        content={children}
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold text-neutral-950 hover:bg-transparent"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold"
              disabled={loading}
              onClick={onSubmit}
            >
              {loading ? 'Saving…' : submitLabel}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

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
    <CatalogDialogShell
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
    </CatalogDialogShell>
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
    <CatalogDialogShell
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
    </CatalogDialogShell>
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
    <CatalogDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Add template"
      description="Templates appear as quick-start options when creating a new policy."
      submitLabel="Create template"
      loading={loading}
      onSubmit={onSubmit}
      className="sm:max-w-3xl"
    >
      <CatalogTemplateFormFields form={templateForm} catalog={catalog} />
    </CatalogDialogShell>
  );
}
