import { DotsThreeVerticalIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExpenseDetailAlerts } from '@/features/expenses/components/ExpenseDetailAlerts';
import { useExpenseDetail } from '@/features/expenses/hooks/use-expense-detail';
import { ExpenseActivityTimeline } from '@/features/expenses/components/ExpenseActivityTimeline';
import { ExpenseApprovalChain } from '@/features/expenses/components/ExpenseApprovalChain';
import { ExpenseCommentsPanel } from '@/features/expenses/components/ExpenseCommentsPanel';
import { ExpenseForm } from '@/features/expenses/components/ExpenseForm';
import { ExpenseReceiptsPanel } from '@/features/expenses/components/ExpenseReceiptsPanel';
import { ExpenseSummaryCard } from '@/features/expenses/components/ExpenseSummaryCard';
import { PolicyBlockingDialog } from '@/features/expenses/components/PolicyBlockingDialog';
import { PolicyJustificationDialog } from '@/features/expenses/components/PolicyJustificationDialog';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { RejectExpenseDialog } from '@/shared/components/RejectExpenseDialog';
import { getApiErrorMessage } from '@/shared/api/client';
import { useRejectExpenseForm } from '@/shared/hooks/use-reject-expense-form';
import { usePageMetadata } from '@/shared/hooks/use-page-metadata';
import { formatNgn } from '@/shared/utils/money';

export function ExpenseDetailPage() {
  const { reference = '' } = useParams();
  const navigate = useNavigate();
  const detail = useExpenseDetail(reference);
  const rejectForm = useRejectExpenseForm(detail.showReject);

  usePageMetadata(
    detail.expense
      ? {
          title: `Expense ${detail.expense.reference}`,
          description: `${formatNgn(detail.expense.amount)} expense claim`,
        }
      : null,
  );

  if (detail.expenseQuery.isLoading) {
    return <LoadingState layout="detail" message="Loading expense…" />;
  }

  if (detail.expenseQuery.isError || !detail.expense) {
    return (
      <PageShell>
        <ErrorState
          message={getApiErrorMessage(detail.expenseQuery.error, 'Expense not found.')}
          onRetry={() => void detail.expenseQuery.refetch()}
          retrying={detail.expenseQuery.isFetching}
        />
        <Button variant="outline" onClick={() => navigate('/expenses')}>
          Back to list
        </Button>
      </PageShell>
    );
  }

  const expense = detail.expense;

  return (
    <PageShell wide>
      <PageHeader
        title={expense.title}
        meta={<ReferenceCell value={expense.reference} variant="compact" />}
        backTo="/expenses"
        backLabel="Expenses"
        actions={
          <>
            {detail.canSubmit && (
              <Button
                disabled={detail.submitMutation.isPending || detail.isCheckingPolicies}
                onClick={() => void detail.handleSubmitForApproval()}
              >
                {detail.submitMutation.isPending
                  ? 'Submitting…'
                  : detail.isCheckingPolicies
                    ? 'Checking policies…'
                    : 'Submit for approval'}
              </Button>
            )}
            {detail.canApprove && (
              <Button
                disabled={detail.approveMutation.isPending}
                onClick={() => void detail.approveMutation.mutateAsync()}
              >
                Approve
              </Button>
            )}
            {detail.canReject && (
              <Button variant="outline" onClick={() => detail.setShowReject(true)}>
                Reject
              </Button>
            )}
            {detail.canReimburse ? (
              <Button
                disabled={detail.reimburseMutation.isPending}
                onClick={() => void detail.reimburseMutation.mutateAsync()}
              >
                {detail.reimburseMutation.isPending ? 'Marking…' : 'Mark reimbursed'}
              </Button>
            ) : null}
            {detail.hasSecondaryActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="More actions">
                    <DotsThreeVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {detail.canEdit && !detail.isEditing && (
                    <DropdownMenuItem onClick={() => detail.setIsEditing(true)}>
                      <PencilSimpleIcon className="size-4" />
                      Edit expense
                    </DropdownMenuItem>
                  )}
                  {detail.canReopen && (
                    <DropdownMenuItem
                      disabled={detail.reopenMutation.isPending}
                      onClick={() => void detail.reopenMutation.mutateAsync()}
                    >
                      Reopen draft
                    </DropdownMenuItem>
                  )}
                  {detail.canDelete && (
                    <>
                      {(detail.canEdit && !detail.isEditing) || detail.isRejected ? (
                        <DropdownMenuSeparator />
                      ) : null}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => detail.setShowDeleteConfirm(true)}
                      >
                        <TrashIcon className="size-4" />
                        Delete draft
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        }
      />

      <ExpenseDetailAlerts
        expense={expense}
        onReopen={
          detail.canReopen ? () => void detail.reopenMutation.mutateAsync() : undefined
        }
        reopenPending={detail.reopenMutation.isPending}
      />

      {detail.isEditing ? (
        <ExpenseForm
          submitLabel="Save changes"
          isSubmitting={detail.updateMutation.isPending}
          expenseReference={reference}
          defaultValues={{
            title: expense.title,
            description: expense.description ?? '',
            amountNaira: (expense.amount / 100).toFixed(2),
            category: expense.category,
            incurredAt: expense.incurredAt?.slice(0, 10) ?? '',
          }}
          onSubmit={async (values) => {
            await detail.updateMutation.mutateAsync(values);
          }}
          onCancel={() => detail.setIsEditing(false)}
        />
      ) : (
        <div className="space-y-6">
          <ExpenseSummaryCard expense={expense} />

          {expense.approvalChain && expense.approvalChain.length > 0 ? (
            <ExpenseApprovalChain steps={expense.approvalChain} />
          ) : null}

          <ExpenseReceiptsPanel
            expenseReference={reference}
            receipts={detail.receiptsQuery.data ?? []}
            canUpload={detail.canUploadReceipt}
            canRemove={detail.canDeleteReceipt}
            isUploading={detail.uploadMutation.isPending}
            onUpload={async (file) => {
              await detail.uploadMutation.mutateAsync(file);
            }}
            onRemove={(receiptReference) =>
              detail.deleteReceiptMutation.mutateAsync(receiptReference)
            }
          />

          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <ExpenseActivityTimeline items={detail.activityQuery.data ?? []} />
            <ExpenseCommentsPanel
              comments={detail.commentsQuery.data ?? []}
              policyExceptions={detail.policyExceptionsQuery.data ?? []}
              form={detail.commentForm}
              isPosting={detail.commentMutation.isPending}
              canComment={detail.canComment}
              onSubmit={async (body) => {
                await detail.commentMutation.mutateAsync(body);
              }}
            />
          </div>
        </div>
      )}

      <RejectExpenseDialog
        open={detail.showReject}
        onOpenChange={(open) => {
          detail.setShowReject(open);
          if (!open) rejectForm.reset({ comment: '' });
        }}
        form={rejectForm}
        loading={detail.rejectMutation.isPending}
        commentId="detail-reject-comment"
        onConfirm={(comment) => void detail.rejectMutation.mutateAsync(comment)}
      />

      <PolicyBlockingDialog
        open={Boolean(detail.blockingViolations?.length)}
        violations={detail.blockingViolations ?? []}
        onOpenChange={(open) => !open && detail.setBlockingViolations(null)}
      />

      <PolicyJustificationDialog
        open={Boolean(detail.policyViolations?.length)}
        violations={detail.policyViolations ?? []}
        loading={detail.submitMutation.isPending}
        onOpenChange={(open) => !open && detail.setPolicyViolations(null)}
        onConfirm={async (justifications) => {
          await detail.submitMutation.mutateAsync(justifications);
        }}
      />

      <ConfirmDialog
        open={detail.showDeleteConfirm}
        onOpenChange={(open) => !open && detail.setShowDeleteConfirm(false)}
        title="Delete expense"
        description="Delete this draft expense? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={detail.deleteMutation.isPending}
        onConfirm={async () => {
          await detail.deleteMutation.mutateAsync();
          detail.setShowDeleteConfirm(false);
        }}
      />
    </PageShell>
  );
}
