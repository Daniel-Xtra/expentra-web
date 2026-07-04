import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/shared/components/FormField';

type SelectOption = {
  value: string;
  label: string;
};

type RhfSelectFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  error?: string;
  className?: string;
  options: SelectOption[];
};

export function RhfSelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  error,
  className,
  options,
}: RhfSelectFieldProps<T>) {
  return (
    <FormField label={label} error={error} className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger aria-invalid={error ? true : undefined}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}
