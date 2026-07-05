import type { ReactNode } from 'react';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type AuthStepHeaderProps = {
  step: number;
  total: number;
  backTo: string;
  backLabel?: string;
};

export function AuthStepHeader({
  step,
  total,
  backTo,
  backLabel = 'Back',
}: AuthStepHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 text-sm font-medium text-black-400 transition-colors hover:text-neutral-950"
      >
        <ArrowLeftIcon className="size-4" />
        {backLabel}
      </Link>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {Array.from({ length: total }, (_, index) => (
            <span
              key={index}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                index < step ? 'bg-primary-500' : 'bg-black-50',
              )}
            />
          ))}
        </div>
        <p className="text-xs font-medium text-black-400">
          Step {step} of {total}
        </p>
      </div>
    </div>
  );
}

type AuthStatusPanelProps = {
  title: string;
  description: string;
  actions: ReactNode;
};

export function AuthStatusPanel({ title, description, actions }: AuthStatusPanelProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-xl/[28px] font-semibold tracking-tight text-neutral-950">{title}</h1>
        <p className="text-sm/[19.6px] text-black-400">{description}</p>
      </div>
      <div className="space-y-3">{actions}</div>
    </div>
  );
}
