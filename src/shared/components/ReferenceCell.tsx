import { CopyIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toastSuccess } from '@/shared/lib/toast';

async function copyReference(value: string): Promise<void> {
  await navigator.clipboard.writeText(value);
  toastSuccess('Reference copied');
}

type ReferenceCellProps = {
  value?: string | null;
  className?: string;
  variant?: 'default' | 'compact';
};

export function ReferenceCell({
  value,
  className,
  variant = 'default',
}: ReferenceCellProps) {
  if (!value) {
    return <span className="text-muted-foreground">—</span>;
  }

  const isCompact = variant === 'compact';

  return (
    <button
      type="button"
      className={cn(
        'max-w-full text-left font-mono text-muted-foreground hover:text-foreground',
        isCompact
          ? 'inline-flex min-w-0 items-center gap-1 text-[11px]'
          : 'inline-flex items-start gap-1.5 text-xs break-all',
        className,
      )}
      title={value}
      onClick={() => void copyReference(value)}
    >
      <span className={cn(isCompact && 'truncate')}>{value}</span>
      <CopyIcon
        className={cn('size-3 shrink-0 opacity-60', isCompact ? '' : 'mt-0.5')}
        aria-hidden
      />
    </button>
  );
}
