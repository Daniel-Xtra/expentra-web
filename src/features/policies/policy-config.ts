import { z } from 'zod';
import type { UseFormReturn } from 'react-hook-form';
import { requiredField } from '@/shared/lib/zod';
import type { ExpensePolicyResponse, PolicyCatalogResponse } from '@/types/api';
import {
  buildConditionConfig,
  createEmptyCondition,
  formatConditionSummary,
  parseConditionsFromConfig,
  serializePolicyConditionsForApi,
  validateConditionValues,
  type PolicyConditionFormValue,
} from './policy-conditions';

export const EMPTY_POLICY_CATALOG: PolicyCatalogResponse = {
  fields: [],
  templates: [],
  fieldDefinitions: [],
  operators: [],
  categories: [],
  weekdays: [],
  supportedFieldKeys: [],
};

export function normalizePolicyCatalog(
  catalog: Partial<PolicyCatalogResponse> | null | undefined,
): PolicyCatalogResponse {
  const fieldDefinitions = catalog?.fieldDefinitions ?? [];
  const supportedFieldKeys =
    catalog?.supportedFieldKeys && catalog.supportedFieldKeys.length > 0
      ? catalog.supportedFieldKeys
      : fieldDefinitions.map((field) => field.key);

  return {
    fields: catalog?.fields ?? [],
    templates: catalog?.templates ?? [],
    fieldDefinitions,
    operators: catalog?.operators ?? [],
    categories: catalog?.categories ?? [],
    weekdays: catalog?.weekdays ?? [],
    supportedFieldKeys,
  };
}

export const POLICY_SEVERITIES = ['BLOCK', 'WARN'] as const;
export type PolicySeverity = (typeof POLICY_SEVERITIES)[number];

const conditionSchema = z.object({
  field: z.string(),
  operator: z.string(),
  valueNaira: z.string().optional(),
  valueNumber: z.string().optional(),
  valueCategory: z.enum(['TRAVEL', 'MEALS', 'SUPPLIES', 'OTHERS']).optional(),
  valueCategories: z.array(z.enum(['TRAVEL', 'MEALS', 'SUPPLIES', 'OTHERS'])).optional(),
  valueWeekdays: z.array(z.string()).optional(),
  valueBoolean: z.enum(['true', 'false']).optional(),
  paramCategory: z.enum(['TRAVEL', 'MEALS', 'SUPPLIES', 'OTHERS']).optional(),
  paramWindowDays: z.string().optional(),
});

const policyFormBaseSchema = z.object({
  name: requiredField('Name'),
  severity: z.enum(POLICY_SEVERITIES, { message: 'Severity is required' }),
  customMessage: z.string().optional(),
  match: z.enum(['all', 'any']),
  conditions: z.array(conditionSchema).min(1, 'Add at least one condition'),
});

const templateFormBaseSchema = z.object({
  name: requiredField('Name'),
  description: requiredField('Description'),
  match: z.enum(['all', 'any']),
  conditions: z.array(conditionSchema).min(1, 'Add at least one condition'),
});

export type PolicyFormValues = z.infer<typeof policyFormBaseSchema>;
export type EditPolicyFormValues = PolicyFormValues & { isActive: 'active' | 'inactive' };
export type TemplateFormValues = z.infer<typeof templateFormBaseSchema>;

export type CatalogSource = { current: PolicyCatalogResponse };

export function createCatalogSource(catalog: PolicyCatalogResponse): CatalogSource {
  return { current: catalog };
}

export function createPolicyFormSchema(catalogSource: CatalogSource) {
  return policyFormBaseSchema.superRefine((values, ctx) => {
    validateConditionValues(
      catalogSource.current,
      values.conditions as PolicyConditionFormValue[],
      ctx,
    );
  });
}

export function createEditPolicyFormSchema(catalogSource: CatalogSource) {
  return createPolicyFormSchema(catalogSource).and(
    z.object({
      isActive: z.enum(['active', 'inactive']),
    }),
  );
}

export function createTemplateFormSchema(catalogSource: CatalogSource) {
  return templateFormBaseSchema.superRefine((values, ctx) => {
    validateConditionValues(
      catalogSource.current,
      values.conditions as PolicyConditionFormValue[],
      ctx,
    );
  });
}

/** Shared shape for forms that include the condition builder. */
export type PolicyConditionFormShape = Pick<PolicyFormValues, 'match' | 'conditions'>;

/** Narrow a policy/template form to the condition-builder subset (RHF paths are invariant). */
export function asConditionForm(
  form:
    | UseFormReturn<PolicyFormValues>
    | UseFormReturn<EditPolicyFormValues>
    | UseFormReturn<TemplateFormValues>
    | UseFormReturn<PolicyFormValues | EditPolicyFormValues>,
): UseFormReturn<PolicyConditionFormShape> {
  return form as unknown as UseFormReturn<PolicyConditionFormShape>;
}

export function getDefaultPolicyFormValues(catalog: PolicyCatalogResponse): PolicyFormValues {
  return {
    name: '',
    severity: 'WARN',
    customMessage: '',
    match: 'all',
    conditions: [createEmptyCondition(catalog)],
  };
}

export function getDefaultTemplateFormValues(catalog: PolicyCatalogResponse): TemplateFormValues {
  return {
    name: '',
    description: '',
    match: 'all',
    conditions: [createEmptyCondition(catalog)],
  };
}

export function buildPolicyConfig(
  catalog: PolicyCatalogResponse,
  values: PolicyFormValues,
): Record<string, unknown> {
  return buildConditionConfig(
    catalog,
    values.conditions as PolicyConditionFormValue[],
    values.match,
    values.customMessage,
  );
}

export function buildTemplateConfig(
  catalog: PolicyCatalogResponse,
  values: TemplateFormValues,
): Record<string, unknown>[] {
  return serializePolicyConditionsForApi(
    catalog,
    values.conditions as PolicyConditionFormValue[],
  );
}

export function policyToFormValues(
  catalog: PolicyCatalogResponse,
  policy: ExpensePolicyResponse,
): EditPolicyFormValues {
  const config = policy.config ?? {};
  const parsed = parseConditionsFromConfig(catalog, config);

  return {
    name: policy.name,
    severity: policy.severity === 'BLOCK' ? 'BLOCK' : 'WARN',
    customMessage: typeof config.message === 'string' ? config.message : '',
    isActive: policy.isActive ? 'active' : 'inactive',
    match: parsed.match,
    conditions: parsed.conditions,
  };
}

export function formatPolicyConfigSummary(
  catalog: PolicyCatalogResponse,
  policy: ExpensePolicyResponse,
): string {
  return formatConditionSummary(catalog, policy.config ?? {});
}
