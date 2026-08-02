import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type FilterCardProps = {
  children: ReactNode;
  className?: string;
};

export function FilterCard({ children, className }: FilterCardProps) {
  return (
    <Card className={cn('border-border/60', className)}>
      <CardContent className="py-0">
        <div className="flex min-w-0 flex-col gap-3 py-1 sm:flex-row sm:flex-wrap sm:items-center *:min-w-0 *:w-full sm:*:w-auto">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
