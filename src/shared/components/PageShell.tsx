import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageShellProps = {
  children: ReactNode;
  className?: string;
  wide?: boolean;
};

export function PageShell({ children, className, wide }: PageShellProps) {
  return (
    <section
      className={cn(
        'flex w-full min-w-0 flex-col gap-4',
        wide ? 'max-w-none' : 'max-w-5xl',
        className,
      )}
    >
      {children}
    </section>
  );
}
