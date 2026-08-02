import { z } from 'zod';
import { nairaToKobo } from '@/shared/utils/money';
import type { ExpenseCategory } from '@/types/api';

export const expenseCategories: ExpenseCategory[] = ['TRAVEL', 'MEALS', 'SUPPLIES', 'OTHERS'];

export function getMinIncurredDate(referenceDate = new Date()): string {
  return `${referenceDate.getFullYear()}-01-01`;
}

export function createExpenseFormSchema(minIncurredDate: string) {
  return z.object({
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
    category: z.enum(['TRAVEL', 'MEALS', 'SUPPLIES', 'OTHERS']),
    incurredAt: z
      .string()
      .optional()
      .refine(
        (value) => !value || value >= minIncurredDate,
        `Incurred date must be on or after ${minIncurredDate}`,
      ),
  });
}

export type ExpenseFormValues = z.infer<ReturnType<typeof createExpenseFormSchema>>;

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
