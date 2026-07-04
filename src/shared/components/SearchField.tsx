import type { ComponentProps } from 'react';
import { FormField } from '@/shared/components/FormField';
import { SearchInput } from '@/shared/components/SearchInput';
import { cn } from '@/lib/utils';

type SearchFieldProps = Omit<ComponentProps<typeof SearchInput>, 'id'> & {
  label?: string;
  htmlFor?: string;
  fieldClassName?: string;
  id?: string;
};

export function SearchField({
  label,
  htmlFor,
  fieldClassName,
  id,
  className,
  ...searchProps
}: SearchFieldProps) {
  const inputId = id ?? htmlFor;

  return (
    <FormField label={label} htmlFor={inputId} className={cn('min-w-[220px] flex-1', fieldClassName)}>
      <SearchInput id={inputId} className={className} {...searchProps} />
    </FormField>
  );
}
