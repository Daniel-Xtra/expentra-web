import type { ComponentProps } from 'react';
import {
  type FieldPath,
  type FieldValues,
  type UseFormRegister,
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField } from '@/shared/components/FormField';

type RhfInputFieldProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  htmlFor?: string;
  className?: string;
} & Omit<ComponentProps<typeof Input>, 'id' | 'name'>;

export function RhfInputField<T extends FieldValues>({
  register,
  name,
  label,
  error,
  htmlFor,
  className,
  ...inputProps
}: RhfInputFieldProps<T>) {
  const fieldId = htmlFor ?? String(name);

  return (
    <FormField label={label} htmlFor={fieldId} error={error} className={className}>
      <Input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        {...inputProps}
        {...register(name)}
      />
    </FormField>
  );
}
