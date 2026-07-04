import { z } from 'zod';
import { requiredField } from '@/shared/lib/zod';

export const NO_MANAGER_VALUE = '__none__';

export const departmentFormSchema = z.object({
  name: requiredField('Name'),
  code: requiredField('Code'),
  managerReference: z.string(),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export function toManagerReference(value: string): string | null {
  return value === NO_MANAGER_VALUE ? null : value;
}

export function toCreateDepartmentPayload(values: DepartmentFormValues) {
  return {
    name: values.name,
    code: values.code,
  };
}

export function toUpdateDepartmentPayload(values: DepartmentFormValues) {
  return {
    name: values.name,
    code: values.code,
    managerReference: toManagerReference(values.managerReference),
  };
}
