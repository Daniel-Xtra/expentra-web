import type { FormEventHandler, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type FormDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @deprecated Use onOpenChange */
  onClose?: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  contentClassName?: string;
  className?: string;
  footer?: ReactNode;
  hideFooter?: boolean;
};

export function FormDialog({
  open,
  onOpenChange,
  onClose,
  title,
  description,
  children,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  onSubmit,
  contentClassName,
  className,
  footer,
  hideFooter = false,
}: FormDialogProps) {
  const handleOpenChange = (next: boolean) => {
    onOpenChange?.(next);
    if (!next) {
      onClose?.();
    }
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onSubmit?.(event);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={className}>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <DialogBody className={contentClassName}>{children}</DialogBody>

          {!hideFooter &&
            (footer ?? (
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  className="font-semibold"
                  disabled={loading}
                  onClick={() => handleOpenChange(false)}
                >
                  {cancelLabel}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving…' : submitLabel}
                </Button>
              </DialogFooter>
            ))}
        </form>
      </DialogContent>
    </Dialog>
  );
}
