import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
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
      render={({ field }) => (
        <div className={className}>
          {label ? (
            <div className="space-y-3">
              <AppFormLabel htmlFor={fieldId} className="text-black-400">
                {label}
              </AppFormLabel>
              <OtpInput
                id={fieldId}
                value={field.value ?? ''}
                onChange={field.onChange}
                length={length}
                disabled={disabled}
                aria-invalid={error ? true : undefined}
              />
            </div>
          ) : (
            <OtpInput
              id={fieldId}
              value={field.value ?? ''}
              onChange={field.onChange}
              length={length}
              disabled={disabled}
              aria-invalid={error ? true : undefined}
            />
          )}
          {error ? <p className="mt-2 text-xs text-error-500">{error}</p> : null}
        </div>
      )}
    />
  );
}
