import { z } from 'zod';
import { requiredField } from '@/shared/lib/zod';

export const delegationSchema = z
  .object({
    delegateReference: requiredField('Delegate'),
    startsAt: requiredField('Start date'),
    endsAt: requiredField('End date'),
  })
  .refine((values) => new Date(values.endsAt) > new Date(values.startsAt), {
    message: 'End date must be after start date',
    path: ['endsAt'],
  });

export type DelegationFormValues = z.infer<typeof delegationSchema>;
