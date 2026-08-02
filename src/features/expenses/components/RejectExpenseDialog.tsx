import type { UseFormReturn } from 'react-hook-form';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppTextarea from '@/shared/reusable/AppTextarea';
import { AppModal } from '@/shared/reusable/AppModal';
import type { RejectCommentFormValues } from '@/shared/lib/reject-form';

type RejectExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<RejectCommentFormValues>;
  loading: boolean;
  onConfirm: (comment: string) => void;
  commentId?: string;
  title?: string;
  description?: string;
};

export function RejectExpenseDialog({
  open,
  onOpenChange,
  form,
  loading,
  onConfirm,
  commentId = 'reject-comment',
  title = 'Reject expense',
  description = 'Provide a reason for rejecting this claim.',
}: RejectExpenseDialogProps) {
  const formId = `${commentId}-form`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && loading) {
          return;
        }
        onOpenChange(next);
      }}
    >
      <AppModal
        title={title}
        description={description}
        className="sm:max-w-lg"
        content={
          <Form {...form}>
            <form
              id={formId}
              className="space-y-5 font-sans"
              onSubmit={form.handleSubmit((values) => onConfirm(values.comment))}
              noValidate
            >
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <AppFormLabel>Comment (required)</AppFormLabel>
                    <AppTextarea
                      {...field}
                      id={commentId}
                      showHint={false}
                      disabled={loading}
                      placeholder="Explain why this claim is being rejected"
                      maxLength={2000}
                      aria-invalid={form.formState.errors.comment ? true : undefined}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        }
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold text-neutral-950 hover:bg-transparent"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              variant="destructive"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold"
              disabled={loading}
            >
              {loading ? 'Please wait…' : 'Confirm reject'}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
