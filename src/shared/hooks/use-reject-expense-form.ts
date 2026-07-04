import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  rejectCommentSchema,
  type RejectCommentFormValues,
} from '@/shared/lib/reject-form';

export function useRejectExpenseForm(open: boolean) {
  const form = useForm<RejectCommentFormValues>({
    resolver: zodResolver(rejectCommentSchema),
    defaultValues: { comment: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ comment: '' });
    }
  }, [open, form]);

  return form;
}
