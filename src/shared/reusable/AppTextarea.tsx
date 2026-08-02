import { InfoIcon } from '@phosphor-icons/react';
import { forwardRef, useCallback, useEffect, useRef, type ChangeEvent, type ComponentProps } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type AppTextareaProps = {
  placeholder?: string;
  hint?: string;
  showHint?: boolean;
  defaultHeight?: string;
} & Omit<ComponentProps<'textarea'>, 'placeholder'>;

const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  (
    {
      className,
      placeholder,
      hint = 'Hint description',
      value,
      onChange,
      showHint = true,
      defaultHeight = '108px',
      ...textareaProps
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const minHeightPx = Number.parseInt(defaultHeight, 10);

    const resizeTextarea = useCallback(
      (element: HTMLTextAreaElement) => {
        element.style.overflow = 'hidden';
        element.style.height = '0px';
        element.style.height = `${Math.max(element.scrollHeight, minHeightPx)}px`;
      },
      [minHeightPx],
    );

    const textareaRef = (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (node) {
        resizeTextarea(node);
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    useEffect(() => {
      if (internalRef.current) {
        resizeTextarea(internalRef.current);
      }
    }, [value, resizeTextarea]);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      resizeTextarea(event.currentTarget);
      onChange?.(event);
    };

    return (
      <div className="space-y-3 font-sans">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={cn(
            'field-sizing-fixed min-h-0 resize-none overflow-y-hidden rounded-md border-black-50 bg-card p-4 font-sans text-sm/[19.6px] font-normal text-black-500 shadow-none',
            'placeholder:text-sm/[19.6px] placeholder:font-normal placeholder:text-black-300',
            'focus-visible:border-primary-500 focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:ring-offset-0',
            'aria-invalid:border-error-500 aria-invalid:ring-2 aria-invalid:ring-error-500/20',
            className,
          )}
          style={{ minHeight: defaultHeight, overflow: 'hidden' }}
          {...textareaProps}
        />

        {showHint ? (
          <span className="flex items-center gap-1.5 text-[11px]/[15.4px] font-normal text-black-400">
            <InfoIcon className="size-3" />
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);

AppTextarea.displayName = 'AppTextarea';

export default AppTextarea;
