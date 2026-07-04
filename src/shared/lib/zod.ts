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

export const jsonObjectField = z
  .string()
  .min(1, 'Config is required')
  .refine((value) => {
    try {
      const parsed = JSON.parse(value) as unknown;
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
    } catch {
      return false;
    }
  }, 'Config must be valid JSON');
