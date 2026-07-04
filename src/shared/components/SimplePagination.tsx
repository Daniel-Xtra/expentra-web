import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SimplePaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function SimplePagination({
  page,
  totalPages,
  onPageChange,
  className,
}: SimplePaginationProps) {
  if (totalPages <= 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-center gap-3 py-4', className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        className="cursor-pointer disabled:cursor-not-allowed"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <CaretLeftIcon className="size-4 text-muted-foreground" />
      </Button>
      <span className="flex size-8 items-center justify-center rounded-md border border-primary text-sm font-medium text-primary">
        {page}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="cursor-pointer disabled:cursor-not-allowed"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <CaretRightIcon className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
