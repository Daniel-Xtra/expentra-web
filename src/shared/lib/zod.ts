import { z } from 'zod';
import { nairaToKobo } from '@/shared/utils/money';

export function requiredField(label: string) {
  return z.string().trim().min(1, `${label} is required`);
}

export const nairaAmountField = z
  .string()
  .min(1, 'Amount is required')
  .refine((value) => {
    try {
      return nairaToKobo(value) >= 1;
    } catch {
      return false;
    }
  }, 'Enter a valid amount');

export const positiveNumberField = (label: string) =>
  z
    .number({ message: `${label} must be a positive number` })
    .int(`${label} must be a positive number`)
    .min(1, `${label} must be a positive number`);
