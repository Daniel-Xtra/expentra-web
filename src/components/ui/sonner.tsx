import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
  XIcon,
} from '@phosphor-icons/react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { cn } from '@/lib/utils';

function Toaster({ className, toastOptions, icons, ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className={cn('toaster group', className)}
      position="top-right"
      closeButton
      expand={false}
      visibleToasts={3}
      gap={10}
      duration={4000}
      offset={{ top: 64, right: 16 }}
      mobileOffset={{ top: 56, right: 12, left: 12 }}
      icons={{
        success: (
          <CheckCircleIcon
            className="size-5 text-success-800"
            weight="fill"
            aria-hidden
          />
        ),
        error: (
          <WarningCircleIcon
            className="size-5 text-error-500"
            weight="fill"
            aria-hidden
          />
        ),
        info: (
          <InfoIcon className="size-5 text-primary-500" weight="fill" aria-hidden />
        ),
        close: <XIcon className="size-3.5" weight="bold" aria-hidden />,
        ...icons,
      }}
      toastOptions={{
        closeButtonAriaLabel: 'Close notification',
        ...toastOptions,
      }}
      {...props}
    />
  );
}

export { Toaster };
