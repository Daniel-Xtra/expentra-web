import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { checkExpenseDuplicate, fetchExpensePolicyHints } from '@/features/expenses/api';
import {
  createExpenseFormSchema,
  getMinIncurredDate,
  toExpenseSubmitPayload,
  type ExpenseFormSubmitValues,
  type ExpenseFormValues,
} from '@/features/expenses/schemas';
import { queryKeys } from '@/shared/api/query-keys';
import { nairaToKobo } from '@/shared/utils/money';

type UseExpenseFormOptions = {
  defaultValues?: Partial<ExpenseFormValues>;
  expenseReference?: string;
};

export function useExpenseForm({ defaultValues, expenseReference }: UseExpenseFormOptions = {}) {
  const { authorization } = useAuth();
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const minIncurredDate = getMinIncurredDate();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(createExpenseFormSchema(minIncurredDate)),
    defaultValues: {
      title: '',
      description: '',
      amountNaira: '',
      category: 'OTHERS',
      incurredAt: new Date().toISOString().slice(0, 10),
      ...defaultValues,
    },
  });

  const category = useWatch({ control: form.control, name: 'category' });
  const amountNaira = useWatch({ control: form.control, name: 'amountNaira' });

  const policyHintsQuery = useQuery({
    queryKey: queryKeys.expenses.policyHints(category),
    queryFn: () => fetchExpensePolicyHints(category),
    enabled: Boolean(category),
  });

  const activePolicyHint = useMemo(
    () => policyHintsQuery.data?.find((hint) => hint.category === category),
    [category, policyHintsQuery.data],
  );

  useEffect(() => {
    let cancelled = false;

    async function runDuplicateCheck() {
      if (!amountNaira || !category) {
        setDuplicateMessage(null);
        return;
      }

      try {
        const amount = nairaToKobo(amountNaira);
        const result = await checkExpenseDuplicate({
          amount,
          category,
          excludeReference: expenseReference,
        });
        if (!cancelled) {
          setDuplicateMessage(result.isDuplicate ? result.message ?? null : null);
        }
      } catch {
        if (!cancelled) {
          setDuplicateMessage(null);
        }
      }
    }

    const timeout = window.setTimeout(() => {
      void runDuplicateCheck();
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [amountNaira, category, expenseReference]);

  const buildSubmitHandler = (onSubmit: (values: ExpenseFormSubmitValues) => Promise<void>) =>
    form.handleSubmit(async (values) => {
      await onSubmit(toExpenseSubmitPayload(values));
    });

  return {
    form,
    department: authorization?.department ?? null,
    activePolicyHint,
    duplicateMessage,
    minIncurredDate,
    buildSubmitHandler,
  };
}
