import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { FormField } from '@/shared/components/FormField';
import { OtpInput } from '@/shared/components/OtpInput';

type RhfOtpFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  error?: string;
  htmlFor?: string;
  length?: number;
  disabled?: boolean;
  className?: string;
};

export function RhfOtpField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  htmlFor,
  length = 6,
  disabled,
  className,
}: RhfOtpFieldProps<T>) {
  const fieldId = htmlFor ?? String(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) =>
        label ? (
          <FormField label={label} htmlFor={fieldId} error={error} className={className}>
            <OtpInput
              id={fieldId}
              value={field.value ?? ''}
              onChange={field.onChange}
              length={length}
              disabled={disabled}
              aria-invalid={error ? true : undefined}
            />
          </FormField>
        ) : (
          <OtpInput
            id={fieldId}
            value={field.value ?? ''}
            onChange={field.onChange}
            length={length}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            className={className}
          />
        )
      }
    />
  );
}
