import type { ReactNode } from 'react';

export function ProfileInfoField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 py-3.5 last:border-b-0">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="flex min-w-0 items-center justify-end gap-2 text-right">
        {typeof value === 'string' ? (
          <span className="text-sm font-medium text-foreground">{value}</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
