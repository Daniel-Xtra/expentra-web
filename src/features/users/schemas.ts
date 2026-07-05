import { z } from 'zod';
import { emailField, passwordField } from '@/features/auth/schemas';
import { requiredField } from '@/shared/lib/zod';

export const createUserSchema = z
  .object({
    email: emailField,
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
