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
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { PolicyAdminGuide } from './PolicyAdminGuide';
import type { PolicyCatalogField, PolicyCatalogResponse, PolicyCatalogTemplate } from '@/types/api';

type PolicyCatalogPanelProps = {
  catalog: PolicyCatalogResponse;
  policyCount?: number;
  activePolicyCount?: number;
  onUseTemplate?: (template: PolicyCatalogTemplate) => void;
};

export function PolicyCatalogPanel({
  catalog,
  policyCount = 0,
  activePolicyCount,
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
      return 'Engine field definitions are unavailable. Ensure the policy catalog API is reachable.';
    }
    if (allEngineFieldsConfigured) {
      return `${fields.length} of ${fieldDefinitions.length} engine fields configured. Edit a field to customize labels, operators, and parameters.`;
    }
    return `${fields.length} of ${fieldDefinitions.length} engine fields configured. Add fields and tune how they appear in the policy builder.`;
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
      <PolicyAdminGuide
        fieldCount={fields.length}
        fieldDefinitionCount={fieldDefinitions.length}
        templateCount={templates.length}
        policyCount={policyCount}
        activePolicyCount={activePolicyCount}
      />

      <DataCard
        title="Rule condition fields"
        description={fieldsCardDescription}
        actions={
          policy.create ? (
            <Button
              size="sm"
              onClick={openCreateField}
              disabled={fieldDefinitions.length === 0 || allEngineFieldsConfigured}
              title={
                fieldDefinitions.length === 0
                  ? 'Engine field definitions are not loaded'
                  : allEngineFieldsConfigured
                    ? 'All engine-supported fields are already in the catalog'
                    : undefined
              }
            >
              Add field
            </Button>
          ) : undefined
        }
      >
        {fields.length === 0 ? (
          <EmptyState
            title="No condition fields configured"
            description="Add fields from the supported engine list so admins can build policy conditions. Each field controls one type of check (amount, category, receipts, etc.)."
            action={
              availableDefinitions.length > 0 && policy.create ? (
                <Button size="sm" onClick={openCreateField}>
                  Add field
                </Button>
              ) : undefined
            }
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
            All {fieldDefinitions.length} supported field types are in your catalog. Edit a field
            to change labels or operators. Delete one only if you need to re-add it with different
            settings.
          </p>
        )}
      </DataCard>

      <DataCard
        title="Rule templates"
        description="Quick-start presets for the policy builder. Create policies directly from a template."
        actions={
          policy.create ? (
            <Button size="sm" onClick={openCreateTemplate} disabled={catalog.fields.length === 0}>
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
                ? 'Add at least one condition field above, then create templates such as “Receipt required above amount” or “Duplicate within 7 days”.'
                : 'Templates help non-technical admins create policies quickly. Suggested starters: receipt required, weekend travel, monthly category cap, duplicate detection.'
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

      <ConfirmDialog
        open={Boolean(deleteFieldRef)}
        onOpenChange={(open) => !open && setDeleteFieldRef(null)}
        title="Delete condition field"
        description="Remove this field from the policy builder? Existing policies that reference it will still evaluate using the engine key."
        confirmLabel="Delete"
        destructive
        loading={deleteFieldMutation.isPending}
        onConfirm={async () => {
          if (!deleteFieldRef) return;
          await deleteFieldMutation.mutateAsync(deleteFieldRef);
          setDeleteFieldRef(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTemplateRef)}
        onOpenChange={(open) => !open && setDeleteTemplateRef(null)}
        title="Delete template"
        description="Delete this quick template from the policy builder?"
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
