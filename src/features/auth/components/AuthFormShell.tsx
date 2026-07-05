import type { FormEventHandler, ReactNode } from 'react';
import { AuthPrimaryButton } from './AuthButtons';

type AuthFormShellProps = {
  title: string;
  description?: string;
  submitLabel: string;
  loadingLabel: string;
  isSubmitting: boolean;
  submitDisabled?: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  header?: ReactNode;
  actions?: ReactNode;
  trailingActions?: ReactNode;
  hideSubmit?: boolean;
};

export function AuthFormShell({
  title,
  description,
  submitLabel,
  loadingLabel,
  isSubmitting,
  submitDisabled = false,
  onSubmit,
  children,
  header,
  actions,
  trailingActions,
  hideSubmit = false,
}: AuthFormShellProps) {
  return (
    <div className="space-y-8">
      {header}

      <div className="space-y-2">
        <h1 className="text-xl/[28px] font-semibold tracking-tight text-neutral-950">{title}</h1>
        {description ? (
          <p className="text-sm/[19.6px] text-black-400">{description}</p>
        ) : null}
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {children}
        {actions}
        {!hideSubmit ? (
          <AuthPrimaryButton
            type="submit"
            loading={isSubmitting}
            loadingLabel={loadingLabel}
            disabled={submitDisabled}
          >
            {submitLabel}
          </AuthPrimaryButton>
        ) : null}
        {trailingActions}
      </form>
    </div>
  );
}
