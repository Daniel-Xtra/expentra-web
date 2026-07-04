import { cn } from '@/lib/utils';

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700',
    dotClassName: 'bg-emerald-500',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-amber-50 text-amber-700',
    dotClassName: 'bg-amber-500',
  },
} as const;

export function DepartmentStatusBadge({ isActive }: { isActive: boolean }) {
  const config = isActive ? statusConfig.active : statusConfig.inactive;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-1 text-xs font-semibold tracking-wide',
        config.className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', config.dotClassName)} />
      {config.label}
    </span>
  );
}
