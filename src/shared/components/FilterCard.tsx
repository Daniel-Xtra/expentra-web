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
        <div className="flex flex-col gap-3 py-1 sm:flex-row sm:flex-wrap sm:items-center">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
