import { LockSimpleIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import { AuthPasswordCriteria } from './AuthPasswordCriteria';

type AuthPasswordFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  autoComplete?: string;
  id?: string;
  showCriteria?: boolean;
  criteriaValue?: string;
};

export function AuthPasswordField<T extends FieldValues>({
  control,
  name,
  label,
  autoComplete,
  id,
  showCriteria = false,
  criteriaValue = '',
}: AuthPasswordFieldProps<T>) {
  const [visible, setVisible] = useState(false);
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
              leftIcon={<LockSimpleIcon className="size-4" weight="fill" />}
              rightIcon={<span>{visible ? 'Hide' : 'Show'}</span>}
              placeholder="•  •  •  •  •  •  •  •  •"
              type={visible ? 'text' : 'password'}
              autoComplete={autoComplete}
              className={cn(
                'w-full ps-8! pe-12!',
                fieldState.error && 'border-error-500! focus-visible:border-error-500!',
              )}
              showLeftIcon
              showRightIcon
              togglePassword={() => setVisible((current) => !current)}
              {...field}
              aria-invalid={fieldState.invalid ? true : undefined}
            />
            <FormMessage className="text-xs text-error-500" />
          </FormItem>
        )}
      />
      {showCriteria ? <AuthPasswordCriteria value={criteriaValue} /> : null}
    </div>
  );
}
