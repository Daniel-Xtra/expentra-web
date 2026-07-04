import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  createCatalogField,
  createCatalogTemplate,
  deleteCatalogField,
  deleteCatalogTemplate,
  listCatalogFields,
  listCatalogTemplates,
  updateCatalogField,
  updateCatalogTemplate,
} from '@/features/policies/api';
import {
  buildTemplateConfig,
  type TemplateFormValues,
} from '@/features/policies/policy-config';
import { getFieldDefinition } from '@/features/policies/policy-conditions';
import { invalidatePoliciesCatalog, queryKeys } from '@/shared/api/query-keys';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import type {
  PolicyCatalogField,
  PolicyCatalogResponse,
  PolicyCatalogTemplate,
} from '@/types/api';

export function usePolicyCatalog(catalog: PolicyCatalogResponse) {
  const queryClient = useQueryClient();

  const fieldsQuery = useQuery({
    queryKey: queryKeys.policies.catalogFields(),
    queryFn: listCatalogFields,
    retry: false,
    placeholderData: keepPreviousData,
  });

  const templatesQuery = useQuery({
    queryKey: queryKeys.policies.catalogTemplates(),
    queryFn: listCatalogTemplates,
    retry: false,
    placeholderData: keepPreviousData,
  });

  const refreshCatalog = async () => {
    await invalidatePoliciesCatalog(queryClient);
  };

  const createFieldMutation = useMutation({
    mutationFn: createCatalogField,
    onSuccess: async (createdField) => {
      toastSuccess('Condition field created');
      queryClient.setQueryData<PolicyCatalogField[]>(
        queryKeys.policies.catalogFields(),
        (current) => [...(current ?? []), createdField],
      );
      await refreshCatalog();
    },
    onError: (err) => toastError(err, 'Failed to create condition field'),
  });

  const updateFieldMutation = useMutation({
    mutationFn: ({
      reference,
      label,
      description,
      operators,
      paramDefinitions,
      sortOrder,
      isActive,
    }: {
      reference: string;
      label: string;
      description: string;
      operators: string[];
      paramDefinitions: PolicyCatalogField['paramDefinitions'];
      sortOrder: number;
      isActive: boolean;
    }) =>
      updateCatalogField(reference, {
        label,
        description,
        operators,
        paramDefinitions,
        sortOrder,
        isActive,
      }),
    onSuccess: async (updatedField) => {
      toastSuccess('Condition field updated');
      queryClient.setQueryData<PolicyCatalogField[]>(
        queryKeys.policies.catalogFields(),
        (current) =>
          current?.map((field) =>
            field.reference === updatedField.reference ? updatedField : field,
          ) ?? [updatedField],
      );
      await refreshCatalog();
    },
    onError: (err) => toastError(err, 'Failed to update condition field'),
  });

  const toggleFieldMutation = useMutation({
    mutationFn: ({ reference, isActive }: { reference: string; isActive: boolean }) =>
      updateCatalogField(reference, { isActive }),
    onSuccess: async (updatedField) => {
      toastSuccess('Condition field updated');
      queryClient.setQueryData<PolicyCatalogField[]>(
        queryKeys.policies.catalogFields(),
        (current) =>
          current?.map((field) =>
            field.reference === updatedField.reference ? updatedField : field,
          ) ?? [updatedField],
      );
      await refreshCatalog();
    },
    onError: (err) => toastError(err, 'Failed to update condition field'),
  });

  const deleteFieldMutation = useMutation({
    mutationFn: deleteCatalogField,
    onSuccess: async (_result, reference) => {
      toastSuccess('Condition field deleted');
      queryClient.setQueryData<PolicyCatalogField[]>(
        queryKeys.policies.catalogFields(),
        (current) => current?.filter((field) => field.reference !== reference) ?? [],
      );
      await refreshCatalog();
    },
    onError: (err) => toastError(err, 'Failed to delete condition field'),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (values: TemplateFormValues) => {
      const conditions = buildTemplateConfig(catalog, values);
      if (conditions.length === 0) {
        throw new Error('Add at least one valid condition before creating a template');
      }

      return createCatalogTemplate({
        name: values.name,
        description: values.description,
        match: values.match,
        conditions,
        isActive: true,
      });
    },
    onSuccess: async (createdTemplate) => {
      toastSuccess('Template created');
      queryClient.setQueryData<PolicyCatalogTemplate[]>(
        queryKeys.policies.catalogTemplates(),
        (current) => [...(current ?? []), createdTemplate],
      );
      await refreshCatalog();
    },
    onError: (err) => toastError(err, 'Failed to create template'),
  });

  const toggleTemplateMutation = useMutation({
    mutationFn: ({ reference, isActive }: { reference: string; isActive: boolean }) =>
      updateCatalogTemplate(reference, { isActive }),
    onSuccess: async (updatedTemplate) => {
      toastSuccess('Template updated');
      queryClient.setQueryData<PolicyCatalogTemplate[]>(
        queryKeys.policies.catalogTemplates(),
        (current) =>
          current?.map((template) =>
            template.reference === updatedTemplate.reference ? updatedTemplate : template,
          ) ?? [updatedTemplate],
      );
      await refreshCatalog();
    },
    onError: (err) => toastError(err, 'Failed to update template'),
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: deleteCatalogTemplate,
    onSuccess: async (_result, reference) => {
      toastSuccess('Template deleted');
      queryClient.setQueryData<PolicyCatalogTemplate[]>(
        queryKeys.policies.catalogTemplates(),
        (current) => current?.filter((template) => template.reference !== reference) ?? [],
      );
      await refreshCatalog();
    },
    onError: (err) => toastError(err, 'Failed to delete template'),
  });

  const fields = useMemo(() => fieldsQuery.data ?? [], [fieldsQuery.data]);
  const templates = useMemo(() => templatesQuery.data ?? [], [templatesQuery.data]);
  const fieldDefinitions = catalog.fieldDefinitions;

  const availableDefinitions = useMemo(
    () =>
      fieldDefinitions.filter(
        (definition) => !fields.some((field) => field.key === definition.key),
      ),
    [fieldDefinitions, fields],
  );

  const getDefinitionForKey = (key: string): PolicyCatalogField | undefined =>
    getFieldDefinition(catalog, key) ?? fields.find((field) => field.key === key);

  const isInitialLoading =
    (fieldsQuery.isLoading && !fieldsQuery.data) ||
    (templatesQuery.isLoading && !templatesQuery.data);

  return {
    fieldsQuery,
    templatesQuery,
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
  };
}
