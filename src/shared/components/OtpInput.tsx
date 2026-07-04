import {
  useCallback,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils';

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  id?: string;
  'aria-invalid'?: boolean;
  className?: string;
  align?: 'start' | 'center';
};

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  id,
  'aria-invalid': ariaInvalid,
  className,
  align = 'center',
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.slice(0, length).split('');
  while (digits.length < length) {
    digits.push('');
  }

  const isLongToken = value.length > length;

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  }, []);

  const handleChange = (index: number, char: string) => {
    const sanitized = char.replace(/\s/g, '');
    if (!sanitized) {
      const chars = value.slice(0, length).split('');
      while (chars.length < length) {
        chars.push('');
      }
      chars[index] = '';
      onChange(chars.join(''));
      return;
    }

    if (sanitized.length > 1) {
      onChange(sanitized);
      if (sanitized.length <= length) {
        focusInput(Math.min(sanitized.length, length - 1));
      }
      return;
    }

    if (!/^[a-zA-Z0-9]$/.test(sanitized)) {
      return;
    }

    const chars = value.slice(0, length).split('');
    while (chars.length < length) {
      chars.push('');
    }
    chars[index] = sanitized;
    onChange(chars.join(''));

    if (index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = value.slice(0, length).split('');
      while (chars.length < length) {
        chars.push('');
      }
      if (chars[index]) {
        chars[index] = '';
        onChange(chars.join(''));
      } else if (index > 0) {
        chars[index - 1] = '';
        onChange(chars.join(''));
        focusInput(index - 1);
      }
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (!pasted) {
      return;
    }
    onChange(pasted);
    if (pasted.length <= length) {
      focusInput(Math.min(pasted.length, length - 1));
    }
  };

  if (isLongToken) {
    return (
      <div
        id={id}
        className={cn(
          'flex items-center justify-between gap-3 rounded-md border border-input bg-muted/30 px-3 py-2.5',
          ariaInvalid && 'border-destructive ring-1 ring-destructive/20',
          className,
        )}
      >
        <p className="text-sm text-muted-foreground">Code applied from link</p>
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
          disabled={disabled}
          onClick={() => onChange('')}
        >
          Enter manually
        </button>
      </div>
    );
  }

  return (
    <div
      id={id}
      role="group"
      aria-label="One-time code"
      aria-invalid={ariaInvalid}
      className={cn(
        'flex items-center gap-2.5 sm:gap-3',
        align === 'start' ? 'justify-start' : 'justify-center',
        className,
      )}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="text"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={digits[index] ?? ''}
          aria-invalid={ariaInvalid}
          className={cn(
            'size-11 rounded-lg border border-input bg-card text-center text-base font-semibold tracking-widest transition-colors outline-none sm:size-12',
            'focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            ariaInvalid && 'border-destructive ring-1 ring-destructive/20',
          )}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
