import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  CatalogCreateFieldDialog,
  CatalogCreateTemplateDialog,
  CatalogEditFieldDialog,
} from '@/features/policies/components/catalog/CatalogFieldFormDialogs';
import {
  cloneParamDefinitions,
  type CatalogFieldFormState,
} from '@/features/policies/components/catalog/CatalogFieldFormParts';
import { CatalogFieldsTable } from '@/features/policies/components/catalog/CatalogFieldsTable';
import { CatalogTemplatesTable } from '@/features/policies/components/catalog/CatalogTemplatesTable';
import { usePolicyCatalog } from '@/features/policies/hooks/use-policy-catalog';
import {
  createTemplateFormSchema,
  getDefaultTemplateFormValues,
  type TemplateFormValues,
} from '@/features/policies/policy-config';
import { useCatalogFormResolver } from '@/features/policies/hooks/useCatalogFormResolver';
import { AppConfirmModal } from '@/shared/reusable/AppConfirmModal';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import type { PolicyCatalogField, PolicyCatalogResponse, PolicyCatalogTemplate } from '@/types/api';

type PolicyCatalogPanelProps = {
  catalog: PolicyCatalogResponse;
  policyCount?: number;
  activePolicyCount?: number;
  onUseTemplate?: (template: PolicyCatalogTemplate) => void;
};

export function PolicyCatalogPanel({
  catalog,
  onUseTemplate,
}: PolicyCatalogPanelProps) {
  const { policy } = useActionCapabilities();
  const templateFormResolver = useCatalogFormResolver(catalog, createTemplateFormSchema);
  const catalogState = usePolicyCatalog(catalog);

  const [creatingField, setCreatingField] = useState<CatalogFieldFormState | null>(null);
  const [editingField, setEditingField] = useState<
    (CatalogFieldFormState & { reference: string }) | null
  >(null);
  const [deleteFieldRef, setDeleteFieldRef] = useState<string | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [deleteTemplateRef, setDeleteTemplateRef] = useState<string | null>(null);

  const templateForm = useForm<TemplateFormValues>({
    resolver: templateFormResolver,
    defaultValues: getDefaultTemplateFormValues(catalog),
  });

  const {
    fields,
    templates,
    fieldDefinitions,
    availableDefinitions,
    isInitialLoading,
    getDefinitionForKey,
    createFieldMutation,
    updateFieldMutation,
    toggleFieldMutation,
    deleteFieldMutation,
    createTemplateMutation,
    toggleTemplateMutation,
    deleteTemplateMutation,
  } = catalogState;

  const openCreateField = () => {
    if (availableDefinitions.length === 0) return;

    const definition = availableDefinitions[0];
    setCreatingField({
      key: definition.key,
      label: definition.label,
      description: definition.description,
      operators: [...(definition.operators ?? [])],
      paramDefinitions: cloneParamDefinitions(definition.paramDefinitions),
      sortOrder: String((fields.length + 1) * 10),
      isActive: true,
    });
  };

  const openEditField = (field: PolicyCatalogField) => {
    const definition = getDefinitionForKey(field.key);
    setEditingField({
      reference: field.reference,
      key: field.key,
      label: field.label,
      description: field.description,
      operators: [...field.operators],
      paramDefinitions: cloneParamDefinitions(
        field.paramDefinitions?.length ? field.paramDefinitions : definition?.paramDefinitions,
      ),
      sortOrder: String(field.sortOrder),
      isActive: field.isActive,
    });
  };

  const openCreateTemplate = () => {
    templateForm.reset(getDefaultTemplateFormValues(catalog));
    setShowTemplateForm(true);
  };

  const applyDefinitionToCreateForm = (key: string) => {
    const definition = getDefinitionForKey(key);
    if (!definition || !creatingField) return;

    setCreatingField({
      ...creatingField,
      key,
      label: definition.label,
      description: definition.description,
      operators: [...definition.operators],
      paramDefinitions: cloneParamDefinitions(definition.paramDefinitions),
    });
  };

  const allEngineFieldsConfigured =
    fieldDefinitions.length > 0 && availableDefinitions.length === 0;
  const fieldsCardDescription = useMemo(() => {
    if (fieldDefinitions.length === 0) {
      return 'Field definitions unavailable. Check that the catalog API is reachable.';
    }
    if (allEngineFieldsConfigured) {
      return `${fields.length} of ${fieldDefinitions.length} fields configured · Labels and operators used in the policy builder`;
    }
    return `${fields.length} of ${fieldDefinitions.length} fields configured · Labels and operators used in the policy builder`;
  }, [allEngineFieldsConfigured, fieldDefinitions.length, fields.length]);

  if (isInitialLoading) {
    return <LoadingState message="Loading rule catalog…" />;
  }

  const creatingDefinition = creatingField
    ? (getDefinitionForKey(creatingField.key) ??
      availableDefinitions.find((definition) => definition.key === creatingField.key))
    : null;
  const editingDefinition = editingField ? getDefinitionForKey(editingField.key) : null;

  return (
    <div className="space-y-6">
      <DataCard
        title="Condition fields"
        description={fieldsCardDescription}
        actions={
          policy.create &&
          fieldDefinitions.length > 0 &&
          !allEngineFieldsConfigured ? (
            <Button
              className="h-11 font-normal text-sm px-7 bg-primary-500"
              onClick={openCreateField}
            >
              Add field
            </Button>
          ) : undefined
        }
      >
        {fields.length === 0 ? (
          <EmptyState
            title="Add your first condition field"
            description="Fields define what policies can check—amount, category, receipts, and similar."
          />
        ) : (
          <CatalogFieldsTable
            fields={fields}
            togglePending={toggleFieldMutation.isPending}
            canUpdate={policy.update}
            canDelete={policy.delete}
            onEdit={openEditField}
            onToggle={(field) =>
              void toggleFieldMutation.mutateAsync({
                reference: field.reference,
                isActive: !field.isActive,
              })
            }
            onDelete={setDeleteFieldRef}
          />
        )}
        {allEngineFieldsConfigured && fields.length > 0 && (
          <p className="mt-3 ml-3 text-xs text-muted-foreground">
            All supported field types are configured. Edit to change labels or
            operators.
          </p>
        )}
      </DataCard>

      <DataCard
        title="Templates"
        description="Reusable presets for creating policies."
        actions={
          policy.create ? (
            <Button
              className="h-11 font-normal text-sm px-7 bg-primary-500"
              onClick={openCreateTemplate}
              disabled={catalog.fields.length === 0}
            >
              Add template
            </Button>
          ) : undefined
        }
      >
        {templates.length === 0 ? (
          <EmptyState
            title="No templates yet"
            description={
              catalog.fields.length === 0
                ? 'Add a condition field first, then create templates.'
                : 'Optional. Templates speed up creating common policies later.'
            }
          />
        ) : (
          <CatalogTemplatesTable
            templates={templates}
            togglePending={toggleTemplateMutation.isPending}
            canUpdate={policy.update}
            canDelete={policy.delete}
            canUseTemplate={policy.create}
            onUseTemplate={onUseTemplate}
            onToggle={(template) =>
              void toggleTemplateMutation.mutateAsync({
                reference: template.reference,
                isActive: !template.isActive,
              })
            }
            onDelete={setDeleteTemplateRef}
          />
        )}
      </DataCard>

      <CatalogCreateFieldDialog
        open={Boolean(creatingField)}
        onOpenChange={(open) => !open && setCreatingField(null)}
        catalog={catalog}
        field={creatingField}
        definition={creatingDefinition ?? null}
        availableDefinitions={availableDefinitions}
        loading={createFieldMutation.isPending}
        onChange={setCreatingField}
        onSelectDefinition={applyDefinitionToCreateForm}
        onSubmit={() => {
          if (!creatingField || creatingField.operators.length === 0) return;
          return createFieldMutation
            .mutateAsync({
              key: creatingField.key,
              label: creatingField.label,
              description: creatingField.description,
              operators: creatingField.operators,
              paramDefinitions: creatingField.paramDefinitions,
              sortOrder: Number(creatingField.sortOrder),
              isActive: creatingField.isActive,
            })
            .then(() => setCreatingField(null));
        }}
      />

      <CatalogEditFieldDialog
        open={Boolean(editingField)}
        onOpenChange={(open) => !open && setEditingField(null)}
        catalog={catalog}
        field={editingField}
        definition={editingDefinition ?? null}
        loading={updateFieldMutation.isPending}
        onChange={setEditingField}
        onSubmit={() => {
          if (!editingField || editingField.operators.length === 0) return;
          return updateFieldMutation
            .mutateAsync({
              reference: editingField.reference,
              label: editingField.label,
              description: editingField.description,
              operators: editingField.operators,
              paramDefinitions: editingField.paramDefinitions,
              sortOrder: Number(editingField.sortOrder),
              isActive: editingField.isActive,
            })
            .then(() => setEditingField(null));
        }}
      />

      <CatalogCreateTemplateDialog
        open={showTemplateForm}
        onOpenChange={setShowTemplateForm}
        catalog={catalog}
        templateForm={templateForm}
        loading={createTemplateMutation.isPending}
        onSubmit={templateForm.handleSubmit((values) =>
          createTemplateMutation.mutateAsync(values).then(() => {
            setShowTemplateForm(false);
            templateForm.reset(getDefaultTemplateFormValues(catalog));
          }),
        )}
      />

      <AppConfirmModal
        open={Boolean(deleteFieldRef)}
        onOpenChange={(open) => !open && setDeleteFieldRef(null)}
        title="Delete condition field"
        description="Remove this field from the policy builder? Existing policies that use this field continue to evaluate."
        confirmLabel="Delete"
        destructive
        loading={deleteFieldMutation.isPending}
        onConfirm={async () => {
          if (!deleteFieldRef) return;
          await deleteFieldMutation.mutateAsync(deleteFieldRef);
          setDeleteFieldRef(null);
        }}
      />

      <AppConfirmModal
        open={Boolean(deleteTemplateRef)}
        onOpenChange={(open) => !open && setDeleteTemplateRef(null)}
        title="Delete template"
        description="Remove this template from the catalog?"
        confirmLabel="Delete"
        destructive
        loading={deleteTemplateMutation.isPending}
        onConfirm={async () => {
          if (!deleteTemplateRef) return;
          await deleteTemplateMutation.mutateAsync(deleteTemplateRef);
          setDeleteTemplateRef(null);
        }}
      />
    </div>
  );
}
