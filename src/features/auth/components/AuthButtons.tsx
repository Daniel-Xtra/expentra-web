import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AuthPrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  asChild?: boolean;
};

export function AuthPrimaryButton({
  children,
  loading = false,
  loadingLabel = 'Saving…',
  className,
  disabled,
  asChild,
  ...props
}: AuthPrimaryButtonProps) {
  return (
    <Button
      type="button"
      asChild={asChild}
      className={cn(
        'h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {asChild ? children : loading ? loadingLabel : children}
    </Button>
  );
}

type AuthSecondaryButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  asChild?: boolean;
};

export function AuthSecondaryButton({
  children,
  className,
  onClick,
  asChild,
}: AuthSecondaryButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        'h-14 w-full rounded-sm border-black-50 p-5 font-sans text-sm/[19.6px] font-semibold text-neutral-950 hover:bg-neutral-100',
        className,
      )}
      onClick={onClick}
      asChild={asChild}
    >
      {children}
    </Button>
  );
}
