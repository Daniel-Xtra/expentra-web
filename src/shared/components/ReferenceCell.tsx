import { useRef, useState } from 'react';
import { CopyIcon } from '@phosphor-icons/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type ReferenceCellProps = {
  value?: string | null;
  className?: string;
  variant?: 'default' | 'compact';
};

export function ReferenceCell({
  value,
  className,
  variant = 'default',
}: ReferenceCellProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);

  if (!value) {
    return <span className="text-muted-foreground">—</span>;
  }

  const isCompact = variant === 'compact';

  const clearResetTimeout = () => {
    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      clearResetTimeout();
      setCopied(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setOpen(true);
      clearResetTimeout();
      resetTimeoutRef.current = window.setTimeout(() => {
        setOpen(false);
        setCopied(false);
        resetTimeoutRef.current = null;
      }, 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip open={open} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "max-w-full text-left font-mono text-muted-foreground hover:text-foreground",
              isCompact
                ? "inline-flex min-w-0 items-center gap-1 text-[11px]"
                : "inline-flex items-start gap-1.5 text-xs break-all",
              className,
            )}
            onClick={() => void handleCopy()}
          >
            <span className={cn(isCompact && "truncate")}>{value}</span>
            <CopyIcon
              className={cn(
                "size-3 shrink-0 opacity-60",
                isCompact ? "" : "mt-0.5",
              )}
              aria-hidden
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className={cn(copied && "text-[#31b454]")}>
          {copied ? "Copied!" : "Copy reference"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
