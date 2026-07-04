import { z } from 'zod';
import { nairaAmountField, requiredField } from '@/shared/lib/zod';

export const budgetSchema = z.object({
  departmentReference: requiredField('Department'),
  year: z.number({ message: 'Year is required' }).int().min(2000, 'Year is required'),
  amountNaira: nairaAmountField,
});

export const editBudgetSchema = z.object({
  amountNaira: nairaAmountField,
  isActive: z.enum(['active', 'inactive']),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;
export type EditBudgetFormValues = z.infer<typeof editBudgetSchema>;
