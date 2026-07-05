import { z } from 'zod';
import { isPasswordPolicyMet, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/shared/lib/password-policy';

export const passwordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, 'Password should be at least 8 characters long')
  .max(PASSWORD_MAX_LENGTH, 'Password should not exceed 20 characters')
  .refine(isPasswordPolicyMet, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  });
export const emailField = z.email({ error: 'Enter a valid email' });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordCodeSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
});

export type ResetPasswordCodeFormValues = z.infer<typeof resetPasswordCodeSchema>;

export const setNewPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SetNewPasswordFormValues = z.infer<typeof setNewPasswordSchema>;

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit verification code from your email'),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
