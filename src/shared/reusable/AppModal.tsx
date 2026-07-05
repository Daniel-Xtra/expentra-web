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
import Icon from './AppIcon';

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
      className={cn(className, 'dialog')}
    >
      <div className={hideHeader ? 'hidden' : 'block'}>
        <DialogHeader className="sticky inset-x-0 top-0 flex h-[112px] items-center justify-between bg-neutral-100 px-8 py-10 sm:p-8">
          <div className="space-y-1">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>

          <div className="flex items-center gap-11 shrink-0">
            {!hideHeaderExtra ? headerExtra : null}
            <DialogClose aria-label="Close modal" >
              <Icon icon="close" type="icons" format="png" className="size-6" />
            </DialogClose>
          </div>
        </DialogHeader>
      </div>

      <div
        className={cn(
          'scrollbar-thin max-h-[53vh] overflow-y-auto p-6 font-sans sm:p-10 md:max-h-[60vh] lg:max-h-[55vh] xl:max-h-[60vh]',
          hideFooter && 'xl:max-h-[80vh]',
        )}
      >
        {content}
      </div>

      <div className={hideFooter ? 'hidden' : 'block'}>
        <DialogFooter className="sticky inset-x-0 bottom-0 m-0 flex flex-col-reverse gap-4 border-t-[0.5px] border-t-neutral-200 bg-white p-8 sm:flex-row">
          {actions ?? (
            <Button type="button" className="h-14 w-full rounded-sm p-5 font-sans text-sm font-semibold" onClick={primaryFn}>
              {buttonText}
            </Button>
          )}
        </DialogFooter>
      </div>
    </DialogContent>
  );
}
