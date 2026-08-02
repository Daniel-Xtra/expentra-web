import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { approveExpense, rejectExpense } from '@/features/approvals/api';
import {
  addExpenseComment,
  checkExpenseSubmitPolicies,
  deleteExpense,
  deleteReceipt,
  getExpense,
  listExpenseActivity,
  listExpenseComments,
  listExpensePolicyExceptions,
  listReceipts,
  reopenExpense,
  reimburseExpense,
  submitExpense,
  updateExpense,
  uploadReceipt,
} from '@/features/expenses/api';
import {
  invalidateExpenses,
  queryKeys,
} from '@/shared/api/query-keys';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { requiredField } from '@/shared/lib/zod';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import type { BudgetSubmitCheckResult, ExpenseSubmitCheckResult, PolicyViolation } from '@/types/api';

const commentSchema = z.object({
  body: requiredField('Comment'),
});

export type ExpenseCommentFormValues = z.infer<typeof commentSchema>;

export function useExpenseDetail(reference: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const caps = useActionCapabilities();

  const [isEditing, setIsEditing] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [policyViolations, setPolicyViolations] = useState<PolicyViolation[] | null>(null);
  const [blockingViolations, setBlockingViolations] = useState<PolicyViolation[] | null>(null);
  const [budgetWarning, setBudgetWarning] = useState<BudgetSubmitCheckResult | null>(null);
  const [budgetBlock, setBudgetBlock] = useState<BudgetSubmitCheckResult | null>(null);
  const [pendingSubmitCheck, setPendingSubmitCheck] = useState<ExpenseSubmitCheckResult | null>(
    null,
  );
  const [isCheckingPolicies, setIsCheckingPolicies] = useState(false);

  const commentForm = useForm<ExpenseCommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: '' },
  });

  const expenseQuery = useQuery({
    queryKey: queryKeys.expenses.detail(reference),
    queryFn: () => getExpense(reference),
    enabled: Boolean(reference),
  });

  const receiptsQuery = useQuery({
    queryKey: queryKeys.expenses.receipts(reference),
    queryFn: () => listReceipts(reference),
    enabled: Boolean(reference),
  });

  const commentsQuery = useQuery({
    queryKey: queryKeys.expenses.comments(reference),
    queryFn: () => listExpenseComments(reference),
    enabled: Boolean(reference),
  });

  const policyExceptionsQuery = useQuery({
    queryKey: queryKeys.expenses.policyExceptions(reference),
    queryFn: () => listExpensePolicyExceptions(reference),
    enabled: Boolean(reference),
  });

  const activityQuery = useQuery({
    queryKey: queryKeys.expenses.activity(reference),
    queryFn: () => listExpenseActivity(reference),
    enabled: Boolean(reference),
  });

  const refresh = () => invalidateExpenses(queryClient, reference);

  const updateMutation = useMutation({
    mutationFn: (values: Parameters<typeof updateExpense>[1]) =>
      updateExpense(reference, values),
    onSuccess: async () => {
      toastSuccess('Expense updated');
      await refresh();
      setIsEditing(false);
    },
    onError: (err) => toastError(err, 'Failed to update expense'),
  });

  const submitMutation = useMutation({
    mutationFn: (policyJustifications?: Record<string, string>) =>
      submitExpense(reference, policyJustifications ? { policyJustifications } : undefined),
    onSuccess: async () => {
      toastSuccess('Expense submitted for approval');
      setPolicyViolations(null);
      await refresh();
    },
    onError: (err) => toastError(err, 'Failed to submit expense'),
  });

  const reopenMutation = useMutation({
    mutationFn: () => reopenExpense(reference),
    onSuccess: async () => {
      toastSuccess('Expense reopened as draft');
      setIsEditing(true);
      await refresh();
    },
    onError: (err) => toastError(err, 'Failed to reopen expense'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteExpense(reference),
    onSuccess: async () => {
      toastSuccess('Expense deleted');
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      navigate('/expenses');
    },
    onError: (err) => toastError(err, 'Failed to delete expense'),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadReceipt(reference, file),
    onSuccess: async () => {
      toastSuccess('Receipt uploaded');
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.receipts(reference) });
    },
    onError: (err) => toastError(err, 'Failed to upload receipt'),
  });

  const deleteReceiptMutation = useMutation({
    mutationFn: (receiptReference: string) => deleteReceipt(reference, receiptReference),
    onSuccess: async () => {
      toastSuccess('Receipt removed');
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.receipts(reference) });
    },
    onError: (err) => toastError(err, 'Failed to remove receipt'),
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => addExpenseComment(reference, body),
    onSuccess: async () => {
      toastSuccess('Comment posted');
      commentForm.reset({ body: '' });
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.comments(reference) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.activity(reference) });
    },
    onError: (err) => toastError(err, 'Failed to post comment'),
  });

  const approveMutation = useMutation({
    mutationFn: (payload?: { comment?: string; overBudgetAcknowledged?: boolean }) =>
      approveExpense(reference, payload),
    onSuccess: async () => {
      toastSuccess('Expense approved');
      setShowApprove(false);
      await refresh();
    },
    onError: (err) => toastError(err, 'Failed to approve expense'),
  });

  const rejectMutation = useMutation({
    mutationFn: (comment: string) => rejectExpense(reference, comment),
    onSuccess: async () => {
      toastSuccess('Expense rejected');
      setShowReject(false);
      await refresh();
    },
    onError: (err) => toastError(err, 'Failed to reject expense'),
  });

  const reimburseMutation = useMutation({
    mutationFn: () => reimburseExpense(reference),
    onSuccess: async () => {
      toastSuccess('Marked as paid');
      await refresh();
    },
    onError: (err) => toastError(err, 'Failed to mark claim as paid'),
  });

  const proceedToSubmit = async (
    checkResult: ExpenseSubmitCheckResult,
    justifications?: Record<string, string>,
  ) => {
    if (checkResult.warningViolations.length > 0 && !justifications) {
      setPolicyViolations(checkResult.warningViolations);
      return;
    }

    try {
      await submitMutation.mutateAsync(justifications);
      setPendingSubmitCheck(null);
      setBudgetWarning(null);
      setPolicyViolations(null);
    } catch {
      // submitMutation.onError already surfaced the toast
    }
  };

  const handleSubmitForApproval = async () => {
    setIsCheckingPolicies(true);
    try {
      const result = await checkExpenseSubmitPolicies(reference);

      if (!result.budget.allowed && result.budget.wouldExceed) {
        setBudgetBlock(result.budget);
        return;
      }

      if (result.blockingViolations.length > 0) {
        setBlockingViolations(result.blockingViolations);
        return;
      }

      setPendingSubmitCheck(result);

      if (result.budget.wouldExceed) {
        setBudgetWarning(result.budget);
        return;
      }

      await proceedToSubmit(result);
    } catch (err) {
      toastError(err, 'Failed to check expense policies');
    } finally {
      setIsCheckingPolicies(false);
    }
  };

  const handleBudgetWarningConfirm = async () => {
    if (!pendingSubmitCheck) {
      return;
    }

    setBudgetWarning(null);
    await proceedToSubmit(pendingSubmitCheck);
  };

  const expense = expenseQuery.data;
  const isDraft = expense?.status === 'DRAFT';
  const isRejected = expense?.status === 'REJECTED';
  const canEdit = isDraft && caps.expense.update;
  const canSubmit = isDraft && caps.expense.submit;
  const canActionApproval =
    Boolean(expense?.canActOnApproval) && (caps.approval.approve || caps.approval.reject);
  const canApprove = canActionApproval && caps.approval.approve;
  const canReject = canActionApproval && caps.approval.reject;
  const canDelete = isDraft && caps.expense.delete;
  const canReopen = isRejected && caps.expense.update;
  const canReimburse = expense?.status === 'APPROVED' && caps.expense.reimburse;
  const canComment =
    expense?.status !== 'APPROVED' && expense?.status !== 'REIMBURSED';
  const canUploadReceipt = isDraft && caps.receipt.upload;
  const canDeleteReceipt = isDraft && caps.receipt.delete;
  const hasSecondaryActions = canDelete || canReopen;

  return {
    expenseQuery,
    receiptsQuery,
    commentsQuery,
    policyExceptionsQuery,
    activityQuery,
    commentForm,
    isEditing,
    setIsEditing,
    showReject,
    setShowReject,
    showApprove,
    setShowApprove,
    showDeleteConfirm,
    setShowDeleteConfirm,
    policyViolations,
    setPolicyViolations,
    blockingViolations,
    setBlockingViolations,
    budgetWarning,
    setBudgetWarning,
    budgetBlock,
    setBudgetBlock,
    pendingSubmitCheck,
    handleBudgetWarningConfirm,
    isCheckingPolicies,
    updateMutation,
    submitMutation,
    reopenMutation,
    deleteMutation,
    uploadMutation,
    deleteReceiptMutation,
    commentMutation,
    approveMutation,
    rejectMutation,
    reimburseMutation,
    handleSubmitForApproval,
    proceedToSubmit,
    expense,
    isDraft,
    isRejected,
    canEdit,
    canSubmit,
    canActionApproval,
    canApprove,
    canReject,
    canDelete,
    canReopen,
    canReimburse,
    canComment,
    canUploadReceipt,
    canDeleteReceipt,
    hasSecondaryActions,
  };
}
