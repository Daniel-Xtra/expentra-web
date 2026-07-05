import { CheckIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

type AppCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
};

export default function AppCheckbox({
  checked,
  onCheckedChange,
  id,
  disabled,
  className,
}: AppCheckboxProps) {
  return (
    <span className={cn('inline-flex shrink-0', className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          'flex size-7 items-center justify-center rounded-xl bg-neutral-100',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20 peer-focus-visible:ring-offset-2',
          disabled && 'opacity-50',
        )}
      >
        <span
          className={cn(
            'flex size-4 items-center justify-center rounded-md border border-black-50 bg-white transition-colors',
            checked && 'border-primary-500',
          )}
        >
          {checked ? (
            <CheckIcon className="size-3 text-primary-500" weight="bold" />
          ) : null}
        </span>
      </span>
    </span>
  );
}
