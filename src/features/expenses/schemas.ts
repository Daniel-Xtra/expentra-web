import { z } from 'zod';
import { nairaToKobo } from '@/shared/utils/money';
import type { ExpenseCategory } from '@/types/api';

export const expenseCategories: ExpenseCategory[] = ['TRAVEL', 'MEALS', 'SUPPLIES', 'OTHER'];

export const expenseFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  amountNaira: z
    .string()
    .min(1, 'Amount is required')
    .refine((value) => {
      try {
        return nairaToKobo(value) >= 1;
      } catch {
        return false;
      }
    }, 'Enter a valid amount'),
  category: z.enum(['TRAVEL', 'MEALS', 'SUPPLIES', 'OTHER']),
  incurredAt: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export type ExpenseFormSubmitValues = {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  incurredAt?: string;
};

export function toExpenseSubmitPayload(values: ExpenseFormValues): ExpenseFormSubmitValues {
  return {
    title: values.title,
    description: values.description || undefined,
    amount: nairaToKobo(values.amountNaira),
    category: values.category,
    incurredAt: values.incurredAt || undefined,
  };
}
