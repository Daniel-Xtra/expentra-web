import type { ExpenseCategory } from '@/features/expenses/types';

export type ExpensePolicyResponse = {
  reference: string;
  name: string;
  ruleType: string;
  severity: string;
  isActive: boolean;
  config: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type PolicyCatalogField = {
  reference: string;
  key: string;
  label: string;
  description: string;
  valueType: 'naira' | 'number' | 'category' | 'weekdays' | 'boolean';
  operators: string[];
  paramDefinitions: Array<{
    key: string;
    label: string;
    type: 'category' | 'number';
    required?: boolean;
  }>;
  isActive: boolean;
  sortOrder: number;
};

export type PolicyCatalogTemplate = {
  reference: string;
  name: string;
  description: string;
  match: 'all' | 'any';
  conditions: Record<string, unknown>[];
  isActive: boolean;
  sortOrder: number;
};

export type PolicyCatalogResponse = {
  fields: PolicyCatalogField[];
  templates: PolicyCatalogTemplate[];
  fieldDefinitions: PolicyCatalogField[];
  operators: Array<{ value: string; label: string }>;
  categories: string[];
  weekdays: Array<{ value: number; label: string }>;
  supportedFieldKeys: string[];
};

export type DashboardPolicyWarning = {
  policyReference: string;
  policyName: string;
  category: ExpenseCategory;
  capAmount: number;
  currentSpend: number;
  utilizationPercent: number;
  message: string;
};
