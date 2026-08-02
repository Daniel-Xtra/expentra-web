import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { getMinDelegationDate } from '@/features/delegations/schemas';
import type { DelegationFormValues } from '@/features/delegations/schemas';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppSelect from '@/shared/reusable/AppSelect';
import { formatUserName } from '@/shared/utils/user';
import type { UserResponse } from '@/types/api';

type DelegationFormFieldsProps = {
  form: UseFormReturn<DelegationFormValues>;
  users: UserResponse[];
  catalogLoading?: boolean;
};

export function DelegationFormFields({
  form,
  users,
  catalogLoading = false,
}: DelegationFormFieldsProps) {
  const minDate = getMinDelegationDate();
  const startsAt = useWatch({ control: form.control, name: 'startsAt' });
  const endsMinDate = startsAt && startsAt > minDate ? startsAt : minDate;

  const delegateOptions = users.map((user) => ({
    value: user.reference,
    label: `${formatUserName(user)} · ${user.email}`,
  }));

  return (
    <Form {...form}>
      <div className="space-y-6 font-sans">
        <div className="space-y-3">
          <AppFormLabel className="text-black-400">Delegate</AppFormLabel>
          <Controller
            control={form.control}
            name="delegateReference"
            render={({ field, fieldState }) => (
              <>
                <AppSelect
                  placeholder={catalogLoading ? 'Loading colleagues…' : 'Select colleague'}
                  options={delegateOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={Boolean(fieldState.error)}
                  disabled={catalogLoading}
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
            <AppFormLabel htmlFor="delegation-starts" className="text-black-400">
              Starts
            </AppFormLabel>
            <FormField
              control={form.control}
              name="startsAt"
              render={({ field, fieldState }) => (
                <FormItem>
                  <AppFormInput
                    id="delegation-starts"
                    type="date"
                    min={minDate}
                    placeholder=""
                    {...field}
                    aria-invalid={fieldState.invalid ? true : undefined}
                    className={cn(
                      fieldState.error &&
                        'border-error-500! focus-visible:border-error-500!',
                    )}
                  />
                  <FormMessage className="text-xs text-error-500" />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <AppFormLabel htmlFor="delegation-ends" className="text-black-400">
              Ends
            </AppFormLabel>
            <FormField
              control={form.control}
              name="endsAt"
              render={({ field, fieldState }) => (
                <FormItem>
                  <AppFormInput
                    id="delegation-ends"
                    type="date"
                    min={endsMinDate}
                    placeholder=""
                    {...field}
                    aria-invalid={fieldState.invalid ? true : undefined}
                    className={cn(
                      fieldState.error &&
                        'border-error-500! focus-visible:border-error-500!',
                    )}
                  />
                  <FormMessage className="text-xs text-error-500" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </Form>
  );
}
