import { z } from 'zod';
import { normalizeRoleName } from '@/shared/utils/role-name';

export const roleNameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be longer than or equal to 2 characters')
  .max(32, 'Name must be at most 32 characters')
  .refine((value) => /^[A-Z]/.test(value), {
    message: 'Name should start with a capital letter',
  })
  .transform(normalizeRoleName)
  .refine((value) => value.length >= 2, {
    message: 'Name must be longer than or equal to 2 characters',
  })
  .refine((value) => /^[a-z][a-z0-9_]*$/.test(value), {
    message:
      'Name must start with a letter and use only lowercase letters, numbers, and underscores',
  });

export const createRoleSchema = z.object({
  name: roleNameSchema,
  description: z.string().optional(),
  templateKey: z.string().optional(),
});

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;
