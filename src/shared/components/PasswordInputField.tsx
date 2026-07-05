import { useState, type ComponentProps } from 'react';
import {
  type FieldPath,
  type FieldValues,
  type UseFormRegister,
} from 'react-hook-form';
import shieldCheckIconUrl from '@/assets/icons/shield-check.png';
import shieldCheckErrorIconUrl from '@/assets/icons/shield-check-error.png';
import { cn } from '@/lib/utils';
import { AssetIcon } from '@/shared/components/AssetIcon';
import { passwordCriteria } from '@/shared/lib/password-policy';

type PasswordInputFieldProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  criteriaValue?: string;
  showCriteria?: boolean;
} & Omit<ComponentProps<'input'>, 'id' | 'name' | 'type'>;

function PasswordCriteria({ value }: { value: string }) {
  return (
    <div className="grid w-full grid-cols-2 gap-x-8 gap-y-2">
      {passwordCriteria(value).map((criterion) => (
        <div
          key={criterion.label}
          className={cn(
            'flex min-w-0 items-center gap-1.5 text-xs font-normal leading-none',
            criterion.isMet ? 'text-success-800' : 'text-error-500',
          )}
        >
          <AssetIcon
            src={criterion.isMet ? shieldCheckIconUrl : shieldCheckErrorIconUrl}
            className="size-4 shrink-0"
          />
          <span>{criterion.label}</span>
        </div>
      ))}
    </div>
  );
}

export function PasswordInputField<T extends FieldValues>({
  register,
  name,
  label,
  error,
  htmlFor,
  className,
  criteriaValue,
  showCriteria = false,
  placeholder = '••••••••',
  autoComplete,
  disabled,
  ...inputProps
}: PasswordInputFieldProps<T>) {
  const [isVisible, setIsVisible] = useState(false);
  const fieldId = htmlFor ?? String(name);

  return (
    <div className={cn(showCriteria ? 'space-y-2' : 'space-y-3', className)}>
      <label
        htmlFor={fieldId}
        className="block text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <div
        className={cn(
          'relative flex h-12 items-center rounded-md border bg-card transition-colors',
          'focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15',
          error
            ? 'border-destructive focus-within:border-destructive focus-within:ring-destructive/15'
            : 'border-input',
          disabled && 'pointer-events-none bg-muted/50 opacity-60',
        )}
      >
        <span className="absolute left-3 inline-flex size-4 items-center justify-center rounded-md bg-primary/15 text-[7px] font-bold leading-none text-primary">
          •••
        </span>
        <input
          id={fieldId}
          type={isVisible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          className="h-full w-full rounded-md bg-transparent px-12 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          {...inputProps}
          {...register(name)}
        />
        <button
          type="button"
          className="absolute right-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setIsVisible((visible) => !visible)}
          disabled={disabled}
          aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
        >
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {showCriteria ? (
        <PasswordCriteria value={criteriaValue ?? ''} />
      ) : null}
    </div>
  );
}
