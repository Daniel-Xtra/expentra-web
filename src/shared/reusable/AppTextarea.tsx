import { InfoIcon } from '@phosphor-icons/react';
import { useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

type AppTextareaProps = {
  className?: string;
  placeholder?: string;
  hint?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value?: string;
  showHint?: boolean;
  defaultHeight?: string;
};

export default function AppTextarea({
  className,
  placeholder,
  hint = 'Hint description',
  value = '',
  onChange,
  showHint = true,
  defaultHeight = '108px',
}: AppTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight,
        Number.parseInt(defaultHeight, 10),
      )}px`;
    }
  }, [value, defaultHeight]);

  return (
    <div className="space-y-3 font-sans">
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={className}
        style={{ minHeight: defaultHeight }}
      />

      {showHint ? (
        <span className="flex items-center gap-1.5 text-[11px]/[15.4px] font-normal text-black-400">
          <InfoIcon className="size-3" />
          {hint}
        </span>
      ) : null}
    </div>
  );
}
