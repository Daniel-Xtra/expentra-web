import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import {
  createExpense,
  deleteReceipt,
  listReceipts,
  submitExpense,
  uploadReceipt,
} from '../api';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseReceiptsPanel } from '../components/ExpenseReceiptsPanel';
import { queryKeys } from '@/shared/api/query-keys';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { cn } from '@/lib/utils';

const CREATE_STEPS = [
  { id: 1, label: '1 · Details' },
  { id: 2, label: '2 · Receipt' },
  { id: 3, label: '3 · Submit' },
] as const;

export function CreateExpensePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const caps = useActionCapabilities();
  const [createdReference, setCreatedReference] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: async (expense) => {
      toastSuccess('Expense draft created');
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      setCreatedReference(expense.reference);
    },
    onError: (err) => toastError(err, 'Failed to create expense'),
  });

  const receiptsQuery = useQuery({
    queryKey: queryKeys.expenses.receipts(createdReference ?? ''),
    queryFn: () => listReceipts(createdReference!),
    enabled: Boolean(createdReference),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadReceipt(createdReference!, file),
    onSuccess: async () => {
      toastSuccess('Receipt uploaded');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.receipts(createdReference!),
      });
    },
    onError: (err) => toastError(err, 'Failed to upload receipt'),
  });

  const deleteReceiptMutation = useMutation({
    mutationFn: (receiptReference: string) =>
      deleteReceipt(createdReference!, receiptReference),
    onSuccess: async () => {
      toastSuccess('Receipt removed');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.receipts(createdReference!),
      });
    },
    onError: (err) => toastError(err, 'Failed to remove receipt'),
  });

  const submitMutation = useMutation({
    mutationFn: () => submitExpense(createdReference!),
    onSuccess: async () => {
      toastSuccess('Expense submitted for approval');
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      navigate(`/expenses/${createdReference}`);
    },
    onError: (err) => {
      toastError(err, 'Could not submit yet — open the expense to finish');
      navigate(`/expenses/${createdReference}`);
    },
  });

  const receiptCount = receiptsQuery.data?.length ?? 0;
  const activeStep = !createdReference ? 1 : receiptCount > 0 ? 3 : 2;

  return (
    <PageShell className="max-w-2xl">
      <PageHeader
        title="New expense"
        description={
          createdReference
            ? 'Draft saved. Attach a receipt, then submit for approval.'
            : 'Enter claim details to create a draft.'
        }
        backTo="/expenses"
        backLabel="Expenses"
      />

      <nav aria-label="Create expense progress" className="flex flex-wrap gap-2 text-sm">
        {CREATE_STEPS.map((step) => (
          <span
            key={step.id}
            className={cn(
              'rounded-md px-2.5 py-1',
              step.id === activeStep
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground',
            )}
            {...(step.id === activeStep ? { 'aria-current': 'step' as const } : {})}
          >
            {step.label}
          </span>
        ))}
      </nav>

      {!createdReference ? (
        <ExpenseForm
          submitLabel="Create draft"
          isSubmitting={createMutation.isPending}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
          }}
        />
      ) : (
        <div className="space-y-4">
          <ExpenseReceiptsPanel
            expenseReference={createdReference}
            receipts={receiptsQuery.data ?? []}
            canUpload={caps.receipt.upload}
            canRemove={caps.receipt.delete}
            isUploading={uploadMutation.isPending}
            emphasizeEmptyUpload
            title="Receipt"
            onUpload={async (file) => {
              await uploadMutation.mutateAsync(file);
            }}
            onRemove={(receiptReference) =>
              deleteReceiptMutation.mutateAsync(receiptReference)
            }
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {caps.expense.submit ? (
              <Button
                className="w-full sm:w-auto h-11 font-normal text-sm px-7 bg-primary-500"
                disabled={submitMutation.isPending || receiptCount === 0}
                onClick={() => void submitMutation.mutateAsync()}
              >
                {submitMutation.isPending ? 'Submitting…' : 'Submit for approval'}
              </Button>
            ) : null}
            <Button
              className="w-full sm:w-auto h-11 font-normal text-sm px-7 bg-transparent"
              variant="outline"
              onClick={() => navigate(`/expenses/${createdReference}`)}
            >
              Save and finish later
            </Button>
          </div>
          {caps.expense.submit && receiptCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              Upload a receipt to enable submit.
            </p>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}
