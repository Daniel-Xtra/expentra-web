import { useState } from "react";
import {
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExpenseDetailAlerts } from "@/features/expenses/components/ExpenseDetailAlerts";
import { useExpenseDetail } from "@/features/expenses/hooks/use-expense-detail";
import { ExpenseActivityTimeline } from "@/features/expenses/components/ExpenseActivityTimeline";
import { ExpenseApprovalChain } from "@/features/expenses/components/ExpenseApprovalChain";
import { ExpenseCommentsPanel } from "@/features/expenses/components/ExpenseCommentsPanel";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import { ExpenseReceiptsPanel } from "@/features/expenses/components/ExpenseReceiptsPanel";
import { ExpenseSummaryCard } from "@/features/expenses/components/ExpenseSummaryCard";
import { BudgetOverspendBlockDialog } from "@/features/expenses/components/BudgetOverspendBlockDialog";
import { BudgetOverspendDialog } from "@/features/expenses/components/BudgetOverspendDialog";
import { PolicyBlockingDialog } from "@/features/expenses/components/PolicyBlockingDialog";
import { PolicyJustificationDialog } from "@/features/expenses/components/PolicyJustificationDialog";
import {
  MarkPaidConfirmDialog,
  type MarkPaidConfirmTarget,
} from "@/features/payouts/components/MarkPaidConfirmDialog";
import { ApproveExpenseDialog } from "@/features/expenses/components/ApproveExpenseDialog";
import { RejectExpenseDialog } from "@/features/expenses/components/RejectExpenseDialog";
import { AppConfirmModal } from "@/shared/reusable/AppConfirmModal";
import { ErrorState } from "@/shared/components/ErrorState";
import { LoadingState } from "@/shared/components/LoadingState";
import { PageHeader } from "@/shared/components/PageHeader";
import { PageShell } from "@/shared/components/PageShell";
import { ReferenceCell } from "@/shared/components/ReferenceCell";
import { getApiErrorMessage } from "@/shared/api/client";
import { useRejectExpenseForm } from "@/shared/hooks/use-reject-expense-form";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { formatNgn } from "@/shared/utils/money";

export function ExpenseDetailPage() {
  const { reference = "" } = useParams();
  const navigate = useNavigate();
  const detail = useExpenseDetail(reference);
  const rejectForm = useRejectExpenseForm(detail.showReject);
  const [markPaidTarget, setMarkPaidTarget] =
    useState<MarkPaidConfirmTarget | null>(null);

  usePageMetadata(
    detail.expense
      ? {
          title: `Expense ${detail.expense.reference}`,
          description: `${formatNgn(detail.expense.amount)} expense claim`,
        }
      : null,
  );

  const isInitialLoading = detail.expenseQuery.isLoading && !detail.expense;
  const isHardError =
    detail.expenseQuery.isError ||
    (!detail.expense && !detail.expenseQuery.isLoading);

  if (isInitialLoading || isHardError) {
    return (
      <PageShell wide>
        <PageHeader title="Expense" backTo="/expenses" backLabel="Expenses" />
        {isInitialLoading ? (
          <LoadingState layout="detail" message="Loading expense…" />
        ) : (
          <>
            <ErrorState
              message={getApiErrorMessage(
                detail.expenseQuery.error,
                "Expense not found.",
              )}
              onRetry={() => void detail.expenseQuery.refetch()}
              retrying={detail.expenseQuery.isFetching}
            />
            <Button variant="outline" onClick={() => navigate("/expenses")}>
              Back to list
            </Button>
          </>
        )}
      </PageShell>
    );
  }

  const expense = detail.expense!;

  return (
    <PageShell wide>
      <PageHeader
        title={expense.title}
        meta={
          <span className="inline-flex flex-wrap items-center gap-2">
            <ReferenceCell value={expense.reference} variant="compact" />
          </span>
        }
        backTo="/expenses"
        backLabel="Expenses"
        actions={
          <>
            {detail.canEdit && !detail.isEditing && (
              <Button
                variant="outline"
                className="h-11 font-normal text-sm px-7 bg-transparent"
                onClick={() => detail.setIsEditing(true)}
              >
                <PencilSimpleIcon className="size-4" />
                Edit
              </Button>
            )}
            {detail.canSubmit && (
              <Button
                disabled={
                  detail.submitMutation.isPending || detail.isCheckingPolicies
                }
                onClick={() => void detail.handleSubmitForApproval()}
                className="h-11 font-normal text-sm px-7 bg-primary-500"
              >
                {detail.submitMutation.isPending
                  ? "Submitting…"
                  : detail.isCheckingPolicies
                    ? "Checking policies…"
                    : "Submit for approval"}
              </Button>
            )}
            {detail.canApprove && (
              <Button
                className="h-11 font-normal text-sm px-7 bg-primary-500"
                variant={detail.canSubmit ? "outline" : "default"}
                disabled={detail.approveMutation.isPending}
                onClick={() => detail.setShowApprove(true)}
              >
                Approve
              </Button>
            )}
            {detail.canReject && (
              <Button
                className="h-11 font-normal text-sm px-7 bg-transparent"
                variant="outline"
                onClick={() => detail.setShowReject(true)}
              >
                Reject
              </Button>
            )}
            {detail.canReimburse ? (
              <Button
                className="h-11 font-normal text-sm px-7 bg-primary-500"
                variant={
                  detail.canSubmit || detail.canApprove ? "outline" : "default"
                }
                disabled={detail.reimburseMutation.isPending}
                onClick={() =>
                  setMarkPaidTarget({
                    kind: "single",
                    reference: expense.reference,
                    title: expense.title,
                    amount: expense.amount,
                  })
                }
              >
                Mark paid
              </Button>
            ) : null}
            {detail.hasSecondaryActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="More actions"
                    className="h-11 px-5"
                  >
                    <DotsThreeVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
                      {detail.canReopen ? <DropdownMenuSeparator /> : null}
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
          detail.canReopen
            ? () => void detail.reopenMutation.mutateAsync()
            : undefined
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
            description: expense.description ?? "",
            amountNaira: (expense.amount / 100).toFixed(2),
            category: expense.category,
            incurredAt: expense.incurredAt?.slice(0, 10) ?? "",
          }}
          onSubmit={async (values) => {
            await detail.updateMutation.mutateAsync(values);
          }}
          onCancel={() => detail.setIsEditing(false)}
        />
      ) : (
        <div className="space-y-6">
          <ExpenseSummaryCard expense={expense} />

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

          {expense.approvalChain && expense.approvalChain.length > 0 ? (
            <ExpenseApprovalChain steps={expense.approvalChain} />
          ) : null}

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

      <ApproveExpenseDialog
        open={detail.showApprove}
        budgetWouldExceed={Boolean(expense.budgetWouldExceed)}
        requiresAcknowledgment={Boolean(
          expense.requiresOverBudgetAcknowledgment,
        )}
        loading={detail.approveMutation.isPending}
        onOpenChange={detail.setShowApprove}
        onConfirm={(payload) =>
          void detail.approveMutation.mutateAsync(payload)
        }
      />

      <RejectExpenseDialog
        open={detail.showReject}
        onOpenChange={(open) => {
          detail.setShowReject(open);
          if (!open) rejectForm.reset({ comment: "" });
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
          if (detail.pendingSubmitCheck) {
            await detail.proceedToSubmit(
              detail.pendingSubmitCheck,
              justifications,
            );
            return;
          }
          try {
            await detail.submitMutation.mutateAsync(justifications);
          } catch {
            // submitMutation.onError already surfaced the toast
          }
        }}
      />

      <BudgetOverspendDialog
        open={Boolean(detail.budgetWarning)}
        budget={detail.budgetWarning}
        loading={detail.submitMutation.isPending}
        onOpenChange={(open) => !open && detail.setBudgetWarning(null)}
        onConfirm={() => void detail.handleBudgetWarningConfirm()}
      />

      <BudgetOverspendBlockDialog
        open={Boolean(detail.budgetBlock)}
        budget={detail.budgetBlock}
        onOpenChange={(open) => !open && detail.setBudgetBlock(null)}
      />

      <AppConfirmModal
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

      <MarkPaidConfirmDialog
        target={markPaidTarget}
        loading={detail.reimburseMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !detail.reimburseMutation.isPending) {
            setMarkPaidTarget(null);
          }
        }}
        onConfirm={async () => {
          await detail.reimburseMutation.mutateAsync();
          setMarkPaidTarget(null);
        }}
      />
    </PageShell>
  );
}
