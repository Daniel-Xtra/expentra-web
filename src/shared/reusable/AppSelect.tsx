import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Option = {
  value: string;
  label: string;
};

type AppSelectProps = {
  label?: string;
  options: Option[];
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
  selectLabel?: string;
  value?: string;
  defaultValue?: string;
  error?: boolean;
};

const triggerClassName = (error?: boolean, className?: string) =>
  cn(
    'h-[52px]! border border-black-50 transition-colors duration-200',
    'data-[state=open]:border-primary-500 data-[state=open]:ring-1 data-[state=open]:ring-transparent data-[state=open]:border-2 data-[state=open]:ring-offset-primary-50 data-[state=open]:ring-offset-4',
    'focus:border-primary-500 focus:border-2 focus:ring-1 focus:ring-transparent focus:ring-offset-primary-50 focus:ring-offset-4',
    error && '!border-error-500 focus:!ring-offset-error-50',
    className,
  );

export default function AppSelect({
  label,
  options,
  placeholder,
  className,
  onChange,
  value,
  defaultValue,
  error,
}: AppSelectProps) {
  return (
    <div>
      {label ? (
        <label className="text-xs font-normal text-black-400">{label}</label>
      ) : null}
      <Select
        onValueChange={onChange}
        defaultValue={defaultValue}
        value={value}
      >
        <SelectTrigger
          className={triggerClassName(error, className)}
          aria-invalid={error ? true : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* <SelectGroup className="divide-y-2 rounded-none!">
            {selectLabel ? <SelectLabel>{selectLabel}</SelectLabel> : null} */}
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="rounded-none font-sans text-xs/[16.8px] font-normal capitalize text-black-500"
              >
                {option.label}
              </SelectItem>
            ))}
          {/* </SelectGroup> */}
        </SelectContent>
      </Select>
    </div>
  );
}
