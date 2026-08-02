import { useEffect, useRef } from 'react';
import { CheckIcon, MinusIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

type AppCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  className?: string;
  'aria-label'?: string;
};

export default function AppCheckbox({
  checked,
  onCheckedChange,
  id,
  disabled,
  indeterminate = false,
  className,
  'aria-label': ariaLabel,
}: AppCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const showCheck = checked && !indeterminate;

  return (
    <span
      className={cn(
        'relative inline-flex size-7 shrink-0 rounded-xl',
        'focus-within:ring-0 focus-within:ring-offset-0',
        className,
      )}
    >
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => {
          event.stopPropagation();
          onCheckedChange(event.target.checked);
        }}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'absolute inset-0 z-10 size-full cursor-pointer opacity-0',
          disabled && 'cursor-not-allowed',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none flex size-7 items-center justify-center rounded-xl bg-neutral-100',
          disabled && 'opacity-50',
        )}
      >
        <span
          className={cn(
            'flex size-4 items-center justify-center rounded-md border border-black-50 bg-white transition-colors',
            (checked || indeterminate) && 'border-primary-500',
          )}
        >
          {indeterminate ? (
            <MinusIcon className="size-3 text-primary-500" weight="bold" />
          ) : showCheck ? (
            <CheckIcon className="size-3 text-primary-500" weight="bold" />
          ) : null}
        </span>
      </span>
    </span>
  );
}
