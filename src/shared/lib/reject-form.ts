import { z } from 'zod';
import { requiredField } from '@/shared/lib/zod';
export const rejectCommentSchema = z.object({
  comment: requiredField('Comment'),
});
export type RejectCommentFormValues = z.infer<typeof rejectCommentSchema>;

