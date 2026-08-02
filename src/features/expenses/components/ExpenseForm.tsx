import { Controller } from 'react-hook-form';
import { BriefcaseIcon, ShieldWarningIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { DataCard } from '@/shared/components/DataCard';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppSelect from '@/shared/reusable/AppSelect';
import AppTextarea from '@/shared/reusable/AppTextarea';
import { useExpenseForm } from '@/features/expenses/hooks/use-expense-form';
import { expenseCategories } from '@/features/expenses/schemas';
import type { ExpenseFormSubmitValues, ExpenseFormValues } from '@/features/expenses/schemas';
import { cn } from '@/lib/utils';
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
  const {
    form,
    department,
    activePolicyHint,
    duplicateMessage,
    minIncurredDate,
    buildSubmitHandler,
  } = useExpenseForm({ defaultValues, expenseReference });

  const categoryOptions = expenseCategories.map((item) => ({
    value: item,
    label: formatLabel(item),
  }));

  const inputErrorClass = (hasError: boolean) =>
    cn(hasError && 'border-error-500! focus-visible:border-error-500!');

  return (
    <DataCard title="Expense details" description="Provide the claim information below">
      <div className="space-y-6 p-6 font-sans">
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

        <Form {...form}>
          <form className="space-y-6" onSubmit={buildSubmitHandler(onSubmit)}>
            <div className="space-y-3">
              <AppFormLabel htmlFor="expense-title" className="text-black-400">
                Title
              </AppFormLabel>
              <FormField
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <AppFormInput
                      id="expense-title"
                      placeholder="e.g. Client lunch meeting"
                      {...field}
                      aria-invalid={fieldState.invalid ? true : undefined}
                      className={inputErrorClass(Boolean(fieldState.error))}
                    />
                    <FormMessage className="text-xs text-error-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <AppFormLabel htmlFor="expense-description" className="text-black-400">
                Description
              </AppFormLabel>
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <>
                    <AppTextarea
                      placeholder="Add context for reviewers, such as purpose or attendees."
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      showHint={false}
                      className={inputErrorClass(Boolean(fieldState.error))}
                    />
                    {fieldState.error ? (
                      <p className="text-xs text-error-500">{fieldState.error.message}</p>
                    ) : null}
                  </>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <AppFormLabel htmlFor="expense-amount" className="text-black-400">
                  Amount (₦)
                </AppFormLabel>
                <FormField
                  control={form.control}
                  name="amountNaira"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <AppFormInput
                        id="expense-amount"
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        {...field}
                        aria-invalid={fieldState.invalid ? true : undefined}
                        className={inputErrorClass(Boolean(fieldState.error))}
                      />
                      <FormMessage className="text-xs text-error-500" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <AppFormLabel className="text-black-400">Category</AppFormLabel>
                <Controller
                  control={form.control}
                  name="category"
                  render={({ field, fieldState }) => (
                    <>
                      <AppSelect
                        placeholder="Select category"
                        options={categoryOptions}
                        value={field.value}
                        onChange={field.onChange}
                        error={Boolean(fieldState.error)}
                      />
                      {fieldState.error ? (
                        <p className="text-xs text-error-500">{fieldState.error.message}</p>
                      ) : null}
                    </>
                  )}
                />
              </div>
            </div>

            <div className="space-y-3">
              <AppFormLabel htmlFor="expense-incurred-at" className="text-black-400">
                Incurred date
              </AppFormLabel>
              <FormField
                control={form.control}
                name="incurredAt"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <AppFormInput
                      id="expense-incurred-at"
                      type="date"
                      min={minIncurredDate}
                      placeholder=""
                      {...field}
                      aria-invalid={fieldState.invalid ? true : undefined}
                      className={inputErrorClass(Boolean(fieldState.error))}
                    />
                    <FormMessage className="text-xs text-error-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 bg-primary-500 px-7 text-sm font-normal"
              >
                {isSubmitting ? 'Saving…' : submitLabel}
              </Button>
              {onCancel ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  className="h-11 px-7 text-sm font-normal"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Form>
      </div>
    </DataCard>
  );
}
