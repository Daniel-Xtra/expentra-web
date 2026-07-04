import { ListIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export type ViewMode = 'table' | 'card';

type ViewModeToggleProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
};

export function ViewModeToggle({ value, onChange, className }: ViewModeToggleProps) {
  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        aria-label="Table view"
        aria-pressed={value === 'table'}
        onClick={() => onChange('table')}
        className={cn(
          'inline-flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors',
          value === 'table'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <ListIcon className="size-4" weight={value === 'table' ? 'bold' : 'regular'} />
      </button>
      <button
        type="button"
        aria-label="Card view"
        aria-pressed={value === 'card'}
        onClick={() => onChange('card')}
        className={cn(
          'inline-flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors',
          value === 'card'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <SquaresFourIcon className="size-4" weight={value === 'card' ? 'bold' : 'regular'} />
      </button>
    </div>
  );
}
