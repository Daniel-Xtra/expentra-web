import { z } from 'zod';
import { nairaAmountField, requiredField } from '@/shared/lib/zod';

export function createBudgetSchema(minYear: number) {
  return z.object({
    departmentReference: requiredField('Department'),
    year: z
      .number({ message: 'Year is required' })
      .int()
      .min(minYear, `Year must be ${minYear} or later`),
    amountNaira: nairaAmountField,
  });
}

export const editBudgetSchema = z.object({
  amountNaira: nairaAmountField,
  isActive: z.enum(['active', 'inactive']),
});

export type BudgetFormValues = z.infer<ReturnType<typeof createBudgetSchema>>;
export type EditBudgetFormValues = z.infer<typeof editBudgetSchema>;
