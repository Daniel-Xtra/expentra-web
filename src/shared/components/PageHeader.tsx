import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title?: string;
  description?: string;
  meta?: ReactNode;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
  greeting?: string;
  descriptionDateTime?: string;
};

export function PageHeader({
  title,
  description,
  meta,
  backTo,
  backLabel = 'Back',
  actions,
  className,
  greeting,
  descriptionDateTime,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {backTo && (
          <Button variant="ghost" size="sm" className="-ml-2 h-8 px-2 text-muted-foreground" asChild>
            <Link to={backTo}>
              <ArrowLeftIcon className="size-3.5" />
              {backLabel}
            </Link>
          </Button>
        )}
        {greeting ? (
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {greeting}
          </h1>
        ) : null}
        {title && !greeting ? (
          <h1 className="text-balance text-base font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        ) : null}
        {title && greeting ? (
          <p className="text-balance text-base font-semibold tracking-tight text-foreground">
            {title}
          </p>
        ) : null}
        {description ? (
          greeting ? (
            <time
              dateTime={descriptionDateTime}
              className="block text-[13px] tracking-wide text-muted-foreground/75"
            >
              {description}
            </time>
          ) : (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          )
        ) : null}
        {meta ? (
          greeting ? (
            <p className="inline-flex items-center rounded-md bg-muted/70 px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {meta}
            </p>
          ) : (
            <div className="text-sm text-muted-foreground">{meta}</div>
          )
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
