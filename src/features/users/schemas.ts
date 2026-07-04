import { z } from 'zod';
import { passwordField } from '@/features/auth/schemas';
import { requiredField } from '@/shared/lib/zod';

export const createUserSchema = z
  .object({
    email: z.string().email('Enter a valid email'),
    firstName: requiredField('First name'),
    lastName: requiredField('Last name'),
    password: passwordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    roleReference: z.string(),
    departmentReference: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const editEmployeeSchema = z.object({
  roleReference: z.string(),
  departmentReference: z.string(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type EditEmployeeFormValues = z.infer<typeof editEmployeeSchema>;

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
