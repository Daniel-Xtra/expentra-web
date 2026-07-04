import { ArrowLeftIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

type AuthStepHeaderProps = {
  step: number;
  total: number;
  backTo: string;
};

export function AuthStepHeader({ step, total, backTo }: AuthStepHeaderProps) {
  return (
    <Link
      to={backTo}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" />
      Step {step} of {total}
    </Link>
  );
}
