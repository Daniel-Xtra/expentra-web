import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type LoadingLayout = 'page' | 'dashboard' | 'detail' | 'auth';

type LoadingStateProps = {
  message?: string;
  className?: string;
  layout?: LoadingLayout;
};

function PageLayoutSkeleton() {
  return (
    <section className="flex max-w-none flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28 shrink-0" />
      </div>

      <div className="rounded-lg border border-border/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Skeleton className="h-9 min-w-[200px] flex-1" />
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-44" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/60">
        <div className="space-y-2 border-b border-border/60 px-4 py-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="divide-y divide-border/40 px-4 py-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="ml-auto h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardLayoutSkeleton() {
  return (
    <section className="flex max-w-none flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-[120px] shrink-0" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-lg" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>

      <Skeleton className="h-72 rounded-lg" />
    </section>
  );
}

function DetailLayoutSkeleton() {
  return (
    <section className="flex max-w-5xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="rounded-lg border border-border/60 p-6">
        <div className="flex items-center gap-4 border-b border-border/60 pb-6">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="divide-y divide-border/40 pt-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between py-3.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuthLayoutSkeleton() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <Skeleton className="size-10 rounded-full" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-56" />
    </div>
  );
}

const layoutSkeletons: Record<LoadingLayout, () => ReactNode> = {
  page: PageLayoutSkeleton,
  dashboard: DashboardLayoutSkeleton,
  detail: DetailLayoutSkeleton,
  auth: AuthLayoutSkeleton,
};

export function LoadingState({
  message = 'Loading…',
  className,
  layout = 'page',
}: LoadingStateProps) {
  const SkeletonLayout = layoutSkeletons[layout];

  return (
    <div className={cn(className)} role="status" aria-label={message}>
      <SkeletonLayout />
    </div>
  );
}
