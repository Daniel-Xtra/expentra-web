import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPageRange } from '@/shared/lib/pagination';
import type { PaginationMeta } from '@/types/api';

type TablePaginationProps = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
};

export function TablePagination({ meta, onPageChange, className }: TablePaginationProps) {
  const { page, limit, total, totalPages } = meta;
  const { start, end } = getPageRange(page, limit, total);
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  if (total === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-t border-border/60 px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p>
        Showing <span className="font-medium text-foreground">{start}</span>
        {'–'}
        <span className="font-medium text-foreground">{end}</span> of{' '}
        <span className="font-medium text-foreground">{total}</span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer disabled:cursor-not-allowed"
          disabled={!canGoBack}
          onClick={() => onPageChange(page - 1)}
        >
          <CaretLeftIcon className="size-3.5" />
          Previous
        </Button>
        <span className="min-w-[5.5rem] text-center text-xs">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer disabled:cursor-not-allowed"
          disabled={!canGoForward}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <CaretRightIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
