import { z } from 'zod';
import { passwordField } from '@/features/auth/schemas';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordField,
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
