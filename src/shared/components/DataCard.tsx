import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type DataCardProps = {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DataCard({
  title,
  description,
  actions,
  footer,
  children,
  className,
  contentClassName,
}: DataCardProps) {
  return (
    <Card className={cn('overflow-hidden border-border/60', className)}>
      {(title || description || actions) && (
      <CardHeader className="flex flex-col gap-3 border-b border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0 space-y-0.5">
            {title && <CardTitle className="text-sm font-semibold">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions ? (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              {actions}
            </div>
          ) : null}
        </CardHeader>
      )}
      <CardContent className={cn('p-0', contentClassName)}>{children}</CardContent>
      {footer}
    </Card>
  );
}
