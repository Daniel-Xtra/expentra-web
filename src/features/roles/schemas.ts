import { z } from 'zod';
import { normalizeRoleName } from '@/shared/utils/role-name';

export const roleNameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(32, 'Name must be at most 32 characters')
  .transform(normalizeRoleName)
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
