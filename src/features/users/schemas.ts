import { z } from 'zod';

export const editEmployeeSchema = z.object({
  roleReference: z.string(),
  departmentReference: z.string(),
});

export type EditEmployeeFormValues = z.infer<typeof editEmployeeSchema>;
