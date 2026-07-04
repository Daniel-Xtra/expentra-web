import type { ReactNode } from 'react';
import { FileTextIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
  compact?: boolean;
};

export function EmptyState({
  title,
  description,
  action,
  className,
  icon,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-4 text-center',
        compact ? 'py-6' : 'py-10',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-md border border-dashed border-border bg-muted/50 text-muted-foreground',
          compact ? 'size-10' : 'size-12',
        )}
      >
        {icon ?? <FileTextIcon className={compact ? 'size-5' : 'size-6'} aria-hidden />}
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
