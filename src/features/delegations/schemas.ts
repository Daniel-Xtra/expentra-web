import { z } from 'zod';
import { requiredField } from '@/shared/lib/zod';

export function getMinDelegationDate(referenceDate = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, '0');
  const day = String(referenceDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDelegationSchema(minDate: string) {
  const minYear = minDate.slice(0, 4);

  return z
    .object({
      delegateReference: requiredField('Delegate'),
      startsAt: requiredField('Start date').refine(
        (value) => value >= minDate && value.slice(0, 4) >= minYear,
        `Start date must be on or after ${minDate}`,
      ),
      endsAt: requiredField('End date').refine(
        (value) => value >= minDate && value.slice(0, 4) >= minYear,
        `End date must be on or after ${minDate}`,
      ),
    })
    .refine((values) => new Date(values.endsAt) > new Date(values.startsAt), {
      message: 'End date must be after start date',
      path: ['endsAt'],
    });
}

export type DelegationFormValues = z.infer<ReturnType<typeof createDelegationSchema>>;
