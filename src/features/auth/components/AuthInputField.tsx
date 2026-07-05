import type { ComponentProps } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';

type AuthInputFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  id?: string;
  type?: ComponentProps<'input'>['type'];
  autoComplete?: string;
};

export function AuthInputField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  id,
  type = 'text',
  autoComplete,
}: AuthInputFieldProps<T>) {
  const fieldId = id ?? String(name);

  return (
    <div className="space-y-3">
      <AppFormLabel htmlFor={fieldId} className="text-black-400">
        {label}
      </AppFormLabel>
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem>
            <AppFormInput
              id={fieldId}
              placeholder={placeholder}
              type={type}
              autoComplete={autoComplete}
              {...field}
              aria-invalid={fieldState.invalid ? true : undefined}
              className={cn(
                fieldState.error && 'border-error-500! focus-visible:border-error-500!',
              )}
            />
            <FormMessage className="text-xs text-error-500" />
          </FormItem>
        )}
      />
    </div>
  );
}
