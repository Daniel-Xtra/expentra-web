import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AppIcon } from './AppIcon';

export type ModalProps = {
  title?: ReactNode;
  description?: ReactNode;
  content: ReactNode;
  buttonText?: string;
  className?: string;
  primaryFn?: () => void;
  actions?: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  headerExtra?: ReactNode;
  hideHeaderExtra?: boolean;
};

export function AppModal({
  title,
  description,
  content,
  buttonText,
  primaryFn,
  actions,
  className = 'max-w-sm sm:max-w-lg',
  hideHeader = false,
  hideFooter = false,
  headerExtra,
  hideHeaderExtra = false,
}: ModalProps) {
  return (
    <DialogContent
      showCloseButton={false}
      onInteractOutside={(e) => {
        if (!document.contains(e.target as Node)) {
          return;
        }
        e.preventDefault();
      }}
      onEscapeKeyDown={(e) => e.preventDefault()}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn('flex max-h-[min(90dvh,48rem)] flex-col overflow-hidden p-0', className)}
    >
      {!hideHeader ? (
        <DialogHeader className="flex min-h-[88px] shrink-0 items-center justify-between bg-neutral-100 px-4 py-5 sm:h-[112px] sm:px-8 sm:py-10">
          <div className="space-y-1">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>

          <div className="flex shrink-0 items-center gap-11">
            {!hideHeaderExtra ? headerExtra : null}
            <DialogClose aria-label="Close modal">
              <AppIcon icon="close" type="icons" format="png" className="size-6" />
            </DialogClose>
          </div>
        </DialogHeader>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none] p-4 font-sans sm:p-6 lg:p-10">
        {content}
      </div>

      {!hideFooter ? (
        <DialogFooter className="m-0 shrink-0 flex-col-reverse gap-3 border-t-[0.5px] border-t-neutral-200 bg-white p-4 sm:flex-row sm:gap-4 sm:p-8">
          {actions ?? (
            <Button
              type="button"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm font-semibold"
              onClick={primaryFn}
            >
              {buttonText}
            </Button>
          )}
        </DialogFooter>
      ) : null}
    </DialogContent>
  );
}
