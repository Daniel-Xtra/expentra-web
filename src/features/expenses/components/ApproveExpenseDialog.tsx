import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppCheckbox from '@/shared/reusable/AppCheckbox';
import { AppModal } from '@/shared/reusable/AppModal';

export type ApproveExpensePayload = {
  comment?: string;
  overBudgetAcknowledged?: boolean;
};

type ApproveExpenseDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  budgetWouldExceed?: boolean;
  requiresAcknowledgment?: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: ApproveExpensePayload) => void | Promise<void>;
};

export function ApproveExpenseDialog({
  open,
  title = 'Approve expense',
  description = 'Optionally add a comment for the audit trail.',
  budgetWouldExceed = false,
  requiresAcknowledgment = false,
  loading = false,
  onOpenChange,
  onConfirm,
}: ApproveExpenseDialogProps) {
  const [comment, setComment] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const commentRequired = budgetWouldExceed;
  const trimmed = comment.trim();
  const canConfirm =
    (!commentRequired || trimmed.length > 0) &&
    (!requiresAcknowledgment || acknowledged);

  const resolvedDescription = budgetWouldExceed
    ? requiresAcknowledgment
      ? 'This expense exceeds the department budget. Provide a justification and acknowledge authorization to proceed.'
      : 'This expense exceeds the department budget. A justification comment is required.'
    : description;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setComment('');
      setAcknowledged(false);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AppModal
        title={title}
        description={resolvedDescription}
        className="sm:max-w-lg"
        content={
          <div className="space-y-4">
            {budgetWouldExceed && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Approving will keep this claim in an over-budget department.
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="approve-comment">
                Comment{commentRequired ? ' (required)' : ' (optional)'}
              </Label>
              <Textarea
                id="approve-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={
                  commentRequired
                    ? 'Explain why this over-budget expense should be approved'
                    : 'Add an optional approval note'
                }
                rows={4}
                maxLength={2000}
              />
            </div>
            {requiresAcknowledgment && (
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <AppCheckbox
                  checked={acknowledged}
                  onCheckedChange={setAcknowledged}
                  aria-label="Acknowledge over-budget authorization"
                />
                <span>I authorize processing this over-budget expense.</span>
              </label>
            )}
          </div>
        }
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold text-neutral-950 hover:bg-transparent"
              disabled={loading}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold"
              disabled={loading || !canConfirm}
              onClick={() =>
                void onConfirm({
                  comment: trimmed || undefined,
                  overBudgetAcknowledged: requiresAcknowledgment
                    ? acknowledged
                    : undefined,
                })
              }
            >
              {loading ? 'Please wait…' : 'Approve'}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
