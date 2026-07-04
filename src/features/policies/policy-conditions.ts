import { koboToNairaInput, nairaToKobo } from '@/shared/utils/money';
import { formatLabel } from '@/shared/utils/format';
import { nairaAmountField } from '@/shared/lib/zod';
import type { RefinementCtx } from 'zod';
import type { ExpenseCategory, PolicyCatalogField, PolicyCatalogResponse } from '@/types/api';
export type PolicyConditionOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'not_in';

export type PolicyConditionFormValue = {
  field: string;
  operator: PolicyConditionOperator;
  valueNaira: string;
  valueNumber: string;
  valueCategory: ExpenseCategory;
  valueCategories: ExpenseCategory[];
  valueWeekdays: string[];
  valueBoolean: 'true' | 'false';
  paramCategory: ExpenseCategory;
  paramWindowDays: string;
};

export function getFieldMeta(
  catalog: PolicyCatalogResponse,
  fieldKey: string,
): PolicyCatalogField | undefined {
  return catalog.fields.find((field) => field.key === fieldKey);
}

export function getFieldDefinition(
  catalog: PolicyCatalogResponse,
  fieldKey: string,
): PolicyCatalogField | undefined {
  return catalog.fieldDefinitions.find((field) => field.key === fieldKey);
}

export function resolveFieldMeta(
  catalog: PolicyCatalogResponse,
  fieldKey: string,
): PolicyCatalogField | undefined {
  return getFieldMeta(catalog, fieldKey) ?? getFieldDefinition(catalog, fieldKey);
}
export function getOperatorLabel(
  catalog: PolicyCatalogResponse,
  operator: string,
): string {
  return catalog.operators.find((item) => item.value === operator)?.label ?? operator;
}

export function createEmptyCondition(
  catalog: PolicyCatalogResponse,
  fieldKey?: string,
): PolicyConditionFormValue {
  const field = fieldKey ?? catalog.fields[0]?.key ?? '';
  const meta = resolveFieldMeta(catalog, field);
  const operator = (meta?.operators[0] ?? 'eq') as PolicyConditionOperator;
  return {
    field,
    operator,
    valueNaira: '',
    valueNumber: '0',
    valueCategory: 'TRAVEL',
    valueCategories: ['TRAVEL'],
    valueWeekdays: ['0', '6'],
    valueBoolean: 'true',
    paramCategory: 'MEALS',
    paramWindowDays: '7',
  };
}

export type PolicyApiCondition = {
  field: string;
  operator: string;
  value: unknown;
  params?: Record<string, unknown>;
};

export function serializePolicyConditionsForApi(
  catalog: PolicyCatalogResponse,
  formConditions: PolicyConditionFormValue[],
): PolicyApiCondition[] {
  return formConditions
    .filter((condition) => Boolean(condition.field?.trim()))
    .map((condition) => {
      const meta = resolveFieldMeta(catalog, condition.field);
      const valueType = meta?.valueType ?? 'number';
      const entry: PolicyApiCondition = {
        field: condition.field,
        operator: condition.operator,
        value: resolveConditionValue(condition, valueType),
      };

      const params: Record<string, unknown> = {};
      for (const param of meta?.paramDefinitions ?? []) {
        if (param.type === 'category') {
          params[param.key] = condition.paramCategory;
        }
        if (param.type === 'number') {
          params[param.key] = Number(condition.paramWindowDays);
        }
      }

      if (Object.keys(params).length > 0) {
        entry.params = params;
      }

      return entry;
    });
}

export function buildConditionConfig(
  catalog: PolicyCatalogResponse,
  conditions: PolicyConditionFormValue[],
  match: 'all' | 'any',
  customMessage?: string,
): Record<string, unknown> {
  const config: Record<string, unknown> = {
    match,
    conditions: serializePolicyConditionsForApi(catalog, conditions),
  };

  if (customMessage?.trim()) {
    config.message = customMessage.trim();
  }

  return config;
}

function resolveConditionValue(
  condition: PolicyConditionFormValue,
  valueType: PolicyCatalogField['valueType'],
): string | number | boolean | string[] | number[] {
  switch (valueType) {
    case 'naira':
      return nairaToKobo(condition.valueNaira);
    case 'number':
      return Number(condition.valueNumber);
    case 'category':
      return condition.operator === 'in' || condition.operator === 'not_in'
        ? condition.valueCategories
        : condition.valueCategory;
    case 'weekdays':
      return condition.operator === 'in' || condition.operator === 'not_in'
        ? condition.valueWeekdays.map(Number)
        : Number(condition.valueWeekdays[0] ?? '0');
    case 'boolean':
      return condition.valueBoolean === 'true';
    default:
      return Number(condition.valueNumber);
  }
}

export function parseConditionsFromConfig(
  catalog: PolicyCatalogResponse,
  config: Record<string, unknown>,
): { match: 'all' | 'any'; conditions: PolicyConditionFormValue[] } {
  const match = config.match === 'any' ? 'any' : 'all';
  const rawConditions = Array.isArray(config.conditions) ? config.conditions : [];

  const conditions = rawConditions.map((item) => {
    const record = (item ?? {}) as Record<string, unknown>;
    const fieldKey =
      typeof record.field === 'string' && resolveFieldMeta(catalog, record.field)
        ? record.field
        : catalog.fields[0]?.key ?? '';    const meta = resolveFieldMeta(catalog, fieldKey);
    const operator = meta?.operators.includes(String(record.operator))
      ? (String(record.operator) as PolicyConditionOperator)
      : ((meta?.operators[0] ?? 'eq') as PolicyConditionOperator);
    const condition = createEmptyCondition(catalog, fieldKey);
    condition.operator = operator;

    const params = (record.params ?? {}) as Record<string, unknown>;
    if (typeof params.category === 'string') {
      condition.paramCategory = params.category as ExpenseCategory;
    }
    if (typeof params.windowDays === 'number') {
      condition.paramWindowDays = String(params.windowDays);
    }

    switch (meta?.valueType) {
      case 'naira':
        if (typeof record.value === 'number') {
          condition.valueNaira = koboToNairaInput(record.value);
        }
        break;
      case 'number':
        if (typeof record.value === 'number') {
          condition.valueNumber = String(record.value);
        }
        break;
      case 'category':
        if (Array.isArray(record.value)) {
          condition.valueCategories = record.value.filter(
            (value): value is ExpenseCategory => typeof value === 'string',
          ) as ExpenseCategory[];
        } else if (typeof record.value === 'string') {
          condition.valueCategory = record.value as ExpenseCategory;
        }
        break;
      case 'weekdays':
        if (Array.isArray(record.value)) {
          condition.valueWeekdays = record.value.map(String);
        } else if (typeof record.value === 'number') {
          condition.valueWeekdays = [String(record.value)];
        }
        break;
      case 'boolean':
        condition.valueBoolean = record.value === true ? 'true' : 'false';
        break;
    }

    return condition;
  });

  return {
    match,
    conditions:
      conditions.length > 0 ? conditions : [createEmptyCondition(catalog)],
  };
}

export function templateConditionsToForm(
  catalog: PolicyCatalogResponse,
  template: { match: 'all' | 'any'; conditions: Record<string, unknown>[] },
): { match: 'all' | 'any'; conditions: PolicyConditionFormValue[] } {
  return parseConditionsFromConfig(catalog, {
    match: template.match,
    conditions: template.conditions,
  });
}

export function formatConditionSummary(
  catalog: PolicyCatalogResponse,
  config: Record<string, unknown>,
): string {
  const { match, conditions } = parseConditionsFromConfig(catalog, config);
  if (conditions.length === 0) {
    return 'No conditions configured';
  }

  const parts = conditions.map((condition) => {
    const meta = getFieldMeta(catalog, condition.field);
    const label = meta?.label ?? formatLabel(condition.field);
    const operator = getOperatorLabel(catalog, condition.operator);

    if (meta?.valueType === 'naira') {
      const amount = condition.valueNaira || '0.00';
      const categorySuffix = meta.paramDefinitions?.some((param) => param.type === 'category')
        ? ` for ${formatLabel(condition.paramCategory)}`
        : '';
      return `${label}${categorySuffix} ${operator} ₦${amount}`;
    }

    if (meta?.valueType === 'boolean') {
      const windowParam = meta.paramDefinitions?.find((param) => param.type === 'number');
      const windowLabel = windowParam?.label?.toLowerCase() ?? 'window';
      return `${label} ${windowLabel} ${condition.paramWindowDays} days`;
    }
    if (meta?.valueType === 'weekdays') {
      const days = condition.valueWeekdays
        .map(
          (day) =>
            catalog.weekdays.find((option) => String(option.value) === day)?.label ?? day,
        )
        .join(', ');
      return `${label} ${operator} ${days}`;
    }

    if (meta?.valueType === 'category') {
      const categories =
        condition.operator === 'in' || condition.operator === 'not_in'
          ? condition.valueCategories.map(formatLabel).join(', ')
          : formatLabel(condition.valueCategory);
      return `${label} ${operator} ${categories}`;
    }

    return `${label} ${operator} ${condition.valueNumber}`;
  });

  return match === 'any' ? parts.join(' OR ') : parts.join(' AND ');
}

export function validateConditionValues(
  catalog: PolicyCatalogResponse,
  conditions: PolicyConditionFormValue[],
  ctx: RefinementCtx,
): void {
  conditions.forEach((condition, index) => {
    const meta = resolveFieldMeta(catalog, condition.field);

    if (!meta) {
      ctx.addIssue({
        code: 'custom',
        path: ['conditions', index, 'field'],
        message: 'Select a valid condition field',
      });
      return;
    }

    switch (meta.valueType) {
      case 'naira': {
        const result = nairaAmountField.safeParse(condition.valueNaira ?? '');
        if (!result.success) {
          ctx.addIssue({
            code: 'custom',
            path: ['conditions', index, 'valueNaira'],
            message: result.error.issues[0]?.message ?? 'Amount is required',
          });
        }
        break;
      }
      case 'number': {
        const parsed = Number(condition.valueNumber);
        if (!Number.isInteger(parsed) || parsed < 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['conditions', index, 'valueNumber'],
            message: 'Enter a valid number',
          });
        }
        break;
      }
      case 'weekdays':
        if (!condition.valueWeekdays?.length) {
          ctx.addIssue({
            code: 'custom',
            path: ['conditions', index, 'valueWeekdays'],
            message: 'Select at least one day',
          });
        }
        break;
      case 'category':
        if (
          (condition.operator === 'in' || condition.operator === 'not_in') &&
          !condition.valueCategories?.length
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['conditions', index, 'valueCategories'],
            message: 'Select at least one category',
          });
        }
        break;
      case 'boolean':
        break;
      default:
        break;
    }

    for (const param of meta.paramDefinitions ?? []) {
      if (param.type === 'category' && param.required && !condition.paramCategory) {
        ctx.addIssue({
          code: 'custom',
          path: ['conditions', index, 'paramCategory'],
          message: `${param.label} is required`,
        });
      }

      if (param.type === 'number' && param.required) {
        const parsed = Number(condition.paramWindowDays);
        if (!Number.isInteger(parsed) || parsed <= 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['conditions', index, 'paramWindowDays'],
            message: `Enter a valid ${param.label.toLowerCase()}`,
          });
        }
      }
    }
  });
}