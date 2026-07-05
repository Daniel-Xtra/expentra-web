import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { createExpense, deleteReceipt, listReceipts, uploadReceipt } from '../api';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseReceiptsPanel } from '../components/ExpenseReceiptsPanel';
import { queryKeys } from '@/shared/api/query-keys';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';

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

  return (
    <PageShell className="max-w-2xl">
      <PageHeader
        title="New expense"
        backTo="/expenses"
        backLabel="Expenses"
        actions={
          createdReference ? (
            <Button asChild>
              <Link to={`/expenses/${createdReference}`}>Open expense</Link>
            </Button>
          ) : undefined
        }
      />

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
            onUpload={async (file) => {
              await uploadMutation.mutateAsync(file);
            }}
            onRemove={(receiptReference) =>
              deleteReceiptMutation.mutateAsync(receiptReference)
            }
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate(`/expenses/${createdReference}`)}>
              Continue to expense
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreatedReference(null);
              }}
            >
              Create another
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
