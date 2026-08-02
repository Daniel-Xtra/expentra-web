import { api } from '@/shared/api/client';
import type {
  ApiResponse,
  ExpensePolicyResponse,
  PolicyCatalogField,
  PolicyCatalogResponse,
  PolicyCatalogTemplate,
} from '@/types/api';
import { normalizePolicyCatalog } from './policy-config';

export type CreatePolicyInput = {
  name: string;
  ruleType: string;
  severity: string;
  config: Record<string, unknown>;
  isActive?: boolean;
};

export type UpdatePolicyInput = Partial<CreatePolicyInput>;

export type UpdateCatalogFieldInput = {
  label?: string;
  description?: string;
  operators?: string[];
  paramDefinitions?: PolicyCatalogField['paramDefinitions'];
  isActive?: boolean;
  sortOrder?: number;
};

export type CreateCatalogFieldInput = {
  key: string;
  label: string;
  description: string;
  operators?: string[];
  paramDefinitions?: PolicyCatalogField['paramDefinitions'];
  isActive?: boolean;
  sortOrder?: number;
};

export type CreateCatalogTemplateInput = {
  name: string;
  description: string;
  match: 'all' | 'any';
  conditions: Record<string, unknown>[];
  isActive?: boolean;
  sortOrder?: number;
};

export type UpdateCatalogTemplateInput = Partial<CreateCatalogTemplateInput>;

export async function listPolicies(): Promise<ExpensePolicyResponse[]> {
  const { data } = await api.get<ApiResponse<ExpensePolicyResponse[]>>('/policies');
  return data.data ?? [];
}

export async function createPolicy(input: CreatePolicyInput): Promise<ExpensePolicyResponse> {
  const { data } = await api.post<ApiResponse<ExpensePolicyResponse>>('/policies', input);
  if (!data.data) {
    throw new Error(data.message || 'Failed to create policy');
  }
  return data.data;
}

export async function updatePolicy(
  reference: string,
  input: UpdatePolicyInput,
): Promise<ExpensePolicyResponse> {
  const { data } = await api.patch<ApiResponse<ExpensePolicyResponse>>(
    `/policies/${reference}`,
    input,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to update policy');
  }
  return data.data;
}

export async function deletePolicy(reference: string): Promise<void> {
  await api.delete(`/policies/${reference}`);
}

export async function getPolicyCatalog(): Promise<PolicyCatalogResponse> {
  const { data } = await api.get<ApiResponse<PolicyCatalogResponse>>('/policies/catalog');
  if (!data.data) {
    throw new Error(data.message || 'Failed to load policy catalog');
  }
  return normalizePolicyCatalog(data.data);
}

export async function listCatalogFields(): Promise<PolicyCatalogField[]> {
  const { data } = await api.get<ApiResponse<PolicyCatalogField[]>>(
    '/policies/catalog/fields/all',
  );
  return data.data ?? [];
}

export async function createCatalogField(
  input: CreateCatalogFieldInput,
): Promise<PolicyCatalogField> {
  const { data } = await api.post<ApiResponse<PolicyCatalogField>>(
    '/policies/catalog/fields',
    input,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to create policy field');
  }
  return data.data;
}

export async function updateCatalogField(
  reference: string,
  input: UpdateCatalogFieldInput,
): Promise<PolicyCatalogField> {
  const { data } = await api.patch<ApiResponse<PolicyCatalogField>>(
    `/policies/catalog/fields/${reference}`,
    input,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to update policy field');
  }
  return data.data;
}

export async function deleteCatalogField(reference: string): Promise<void> {
  await api.delete(`/policies/catalog/fields/${reference}`);
}

export async function listCatalogTemplates(): Promise<PolicyCatalogTemplate[]> {
  const { data } = await api.get<ApiResponse<PolicyCatalogTemplate[]>>(
    '/policies/catalog/templates/all',
  );
  return data.data ?? [];
}

function normalizeTemplateConditions(
  conditions: CreateCatalogTemplateInput['conditions'],
): Record<string, unknown>[] {
  if (!Array.isArray(conditions)) {
    throw new Error('Template conditions must be an array');
  }

  return conditions.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(
        `Template condition ${index + 1} must be an object with field, operator, and value`,
      );
    }

    const raw = item as Record<string, unknown>;
    if ('valueNaira' in raw || 'valueNumber' in raw || 'valueCategories' in raw) {
      throw new Error(
        'Template conditions must use API shape ({ field, operator, value }), not form fields',
      );
    }

    if (typeof raw.field !== 'string' || !raw.field.trim()) {
      throw new Error(`Template condition ${index + 1} requires a field`);
    }

    if (typeof raw.operator !== 'string' || !raw.operator.trim()) {
      throw new Error(`Template condition ${index + 1} requires an operator`);
    }

    if (raw.value === undefined) {
      throw new Error(`Template condition ${index + 1} requires a value`);
    }

    const normalized: Record<string, unknown> = {
      field: raw.field,
      operator: raw.operator,
      value: raw.value,
    };

    if (raw.params !== undefined) {
      if (!raw.params || typeof raw.params !== 'object' || Array.isArray(raw.params)) {
        throw new Error(`Template condition ${index + 1} params must be an object`);
      }
      normalized.params = raw.params;
    }

    return normalized;
  });
}

export async function createCatalogTemplate(
  input: CreateCatalogTemplateInput,
): Promise<PolicyCatalogTemplate> {
  const { data } = await api.post<ApiResponse<PolicyCatalogTemplate>>(
    '/policies/catalog/templates',
    {
      ...input,
      conditions: normalizeTemplateConditions(input.conditions),
    },
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to create template');
  }
  return data.data;
}

export async function updateCatalogTemplate(
  reference: string,
  input: UpdateCatalogTemplateInput,
): Promise<PolicyCatalogTemplate> {
  const { data } = await api.patch<ApiResponse<PolicyCatalogTemplate>>(
    `/policies/catalog/templates/${reference}`,
    input,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to update template');
  }
  return data.data;
}

export async function deleteCatalogTemplate(reference: string): Promise<void> {
  await api.delete(`/policies/catalog/templates/${reference}`);
}
