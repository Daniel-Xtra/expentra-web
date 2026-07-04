import type { UseFormReturn } from 'react-hook-form';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { DialogActions } from '@/shared/components/DialogActions';
import { FormField } from '@/shared/components/FormField';
import type { RejectCommentFormValues } from '@/shared/lib/reject-form';

type RejectExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<RejectCommentFormValues>;
  loading: boolean;
  onConfirm: (comment: string) => void;
  commentId?: string;
};

export function RejectExpenseDialog({
  open,
  onOpenChange,
  form,
  loading,
  onConfirm,
  commentId = 'reject-comment',
}: RejectExpenseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={form.handleSubmit((values) => onConfirm(values.comment))}
          noValidate
        >
          <DialogHeader>
            <DialogTitle>Reject expense</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this claim.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <FormField
              label="Comment (required)"
              htmlFor={commentId}
              error={form.formState.errors.comment?.message}
            >
              <Textarea
                id={commentId}
                rows={4}
                aria-invalid={form.formState.errors.comment ? true : undefined}
                {...form.register('comment')}
              />
            </FormField>
          </DialogBody>
          <DialogActions
            confirmLabel="Confirm reject"
            confirmType="submit"
            loading={loading}
            destructive
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
