import { Controller } from 'react-hook-form';
import { BriefcaseIcon, ShieldWarningIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DataCard } from '@/shared/components/DataCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/shared/components/FormField';
import { useExpenseForm } from '@/features/expenses/hooks/use-expense-form';
import { expenseCategories } from '@/features/expenses/schemas';
import type { ExpenseFormSubmitValues, ExpenseFormValues } from '@/features/expenses/schemas';
import { formatLabel } from '@/shared/utils/format';
import { formatNgn } from '@/shared/utils/money';

export type { ExpenseFormValues, ExpenseFormSubmitValues };

type ExpenseFormProps = {
  defaultValues?: Partial<ExpenseFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  expenseReference?: string;
  onCancel?: () => void;
  onSubmit: (values: ExpenseFormSubmitValues) => Promise<void>;
};

export function ExpenseForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  expenseReference,
  onCancel,
  onSubmit,
}: ExpenseFormProps) {
  const { form, department, activePolicyHint, duplicateMessage, buildSubmitHandler } =
    useExpenseForm({ defaultValues, expenseReference });

  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <DataCard title="Expense details" description="Provide the claim information below">
      <div className="space-y-4 p-6">
        {department ? (
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            <BriefcaseIcon className="size-4 shrink-0" />
            <span>
              Department:{' '}
              <span className="font-medium text-foreground">{department.name}</span>
            </span>
          </div>
        ) : null}

        {activePolicyHint ? (
          <Alert className="border-amber-500/20 bg-amber-500/5">
            <ShieldWarningIcon className="text-amber-700" />
            <AlertDescription className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{activePolicyHint.policyName}</span>
              {' · '}
              {formatNgn(activePolicyHint.currentSpend)} of{' '}
              {formatNgn(activePolicyHint.capAmount)} used this month (
              {activePolicyHint.utilizationPercent}%).
              {activePolicyHint.remainingAmount > 0
                ? ` ${formatNgn(activePolicyHint.remainingAmount)} remaining.`
                : ' Cap reached.'}
            </AlertDescription>
          </Alert>
        ) : null}

        {duplicateMessage ? (
          <Alert className="border-amber-500/20 bg-amber-500/5">
            <WarningCircleIcon className="text-amber-700" />
            <AlertDescription className="text-sm text-muted-foreground">
              {duplicateMessage}
            </AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-4" onSubmit={buildSubmitHandler(onSubmit)}>
          <FormField label="Title" htmlFor="title" error={errors.title?.message}>
            <Input
              id="title"
              type="text"
              aria-invalid={errors.title ? true : undefined}
              {...register('title')}
            />
          </FormField>

          <FormField label="Description" htmlFor="description" error={errors.description?.message}>
            <Textarea
              id="description"
              rows={4}
              aria-invalid={errors.description ? true : undefined}
              {...register('description')}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Amount (₦)" htmlFor="amount" error={errors.amountNaira?.message}>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                aria-invalid={errors.amountNaira ? true : undefined}
                {...register('amountNaira')}
              />
            </FormField>

            <FormField label="Category" error={errors.category?.message}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={errors.category ? true : undefined}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((item) => (
                        <SelectItem key={item} value={item}>
                          {formatLabel(item)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <FormField label="Incurred date" htmlFor="incurredAt" error={errors.incurredAt?.message}>
            <Input id="incurredAt" type="date" {...register('incurredAt')} />
          </FormField>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : submitLabel}
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </DataCard>
  );
}
