import { forwardRef, type ComponentProps, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type AppFormInputProps = {
  placeholder: string;
  showLeftIcon?: boolean;
  showRightIcon?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  togglePassword?: () => void;
} & Omit<ComponentProps<'input'>, 'placeholder'>;

const AppFormInput = forwardRef<HTMLInputElement, AppFormInputProps>(
  (
    {
      placeholder,
      className,
      showLeftIcon = false,
      showRightIcon = false,
      leftIcon,
      rightIcon,
      togglePassword,
      type,
      ...inputProps
    },
    ref,
  ) => {
    return (
      <div className="relative">
        {showLeftIcon ? (
          <div className="pointer-events-none absolute inset-y-0 inset-s-0 z-10 grid w-10 place-content-center">
            <span className="text-black-400">{leftIcon}</span>
          </div>
        ) : null}
        <Input
          ref={ref}
          placeholder={placeholder}
          type={type}
          className={cn(
            'h-[52px] rounded-md border-black-50 bg-card p-4 font-sans text-sm/[19.6px] font-normal text-black-500 shadow-none',
            'placeholder:text-sm/[19.6px] placeholder:font-normal placeholder:text-black-300',
            'focus-visible:border-primary-500 focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:ring-offset-0',
            'aria-invalid:border-error-500 aria-invalid:ring-2 aria-invalid:ring-error-500/20',
            className,
          )}
          {...inputProps}
        />
        {showRightIcon ? (
          <div className="absolute inset-y-0 inset-e-0 grid w-10 place-content-center">
            <button
              type="button"
              tabIndex={-1}
              className="mr-4 flex cursor-pointer items-start justify-center text-[11px]/[15.4px] font-normal text-black-300 hover:text-black-400"
              onClick={togglePassword}
            >
              {rightIcon}
            </button>
          </div>
        ) : null}
      </div>
    );
  },
);

AppFormInput.displayName = 'AppFormInput';

export default AppFormInput;
