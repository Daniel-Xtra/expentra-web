import { cn } from '@/lib/utils';

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    dotClassName: 'bg-emerald-500',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-muted text-muted-foreground',
    dotClassName: 'bg-muted-foreground/60',
  },
} as const;

export function ApprovalLevelStatusBadge({ isActive }: { isActive: boolean }) {
  const config = isActive ? statusConfig.active : statusConfig.inactive;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-transparent px-2.5 py-1 text-xs font-medium',
        config.className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', config.dotClassName)} />
      {config.label}
    </span>
  );
}
