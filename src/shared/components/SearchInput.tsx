import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import type { ChangeEvent, ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';


type SearchInputProps = Omit<ComponentProps<'input'>, 'type' | 'value'> & {
  value: string;
  onValueChange: (value: string) => void;
  showIcon?: boolean;
  showClear?: boolean;
  containerClassName?: string;
};

export function SearchInput({
  value,
  onValueChange,
  onChange,
  className,
  containerClassName,
  showIcon = true,
  showClear = true,
  placeholder = 'Search…',
  id,
  ...props
}: SearchInputProps) {
  const hasValue = value.length > 0;
  const canClear = showClear && hasValue;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    onValueChange(event.target.value);
  }

  function handleClear() {
    onValueChange('');
  }

  return (
    <div className={cn('group/search relative', containerClassName)}>
      {showIcon && !canClear ? (
       <MagnifyingGlassIcon
          className="pointer-events-none absolute top-1/2 right-5 size-5 -translate-y-1/2 text-foreground/80 transition-colors group-focus-within/search:text-primary"
          aria-hidden
        />
      ) : null}

      <Input
        type="text"
        role="searchbox"
        id={id}
        value={value}
        placeholder={placeholder}
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        className={cn(
          'h-12 rounded-md border-border bg-card px-5 text-base shadow-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 hover:border-primary/70 focus-visible:border-primary focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/15 [&::-webkit-search-cancel-button]:hidden',
          showIcon || canClear ? 'pr-14' : undefined,
          className,
        )}
        onChange={handleChange}
        {...props}
      />

      {canClear ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute top-1/2 right-4 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
          onClick={handleClear}
        >
          <XIcon className="size-4" weight="bold" />
        </button>
      ) : null}
    </div>
  );
}
