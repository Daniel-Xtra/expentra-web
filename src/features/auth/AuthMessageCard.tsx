import type { ReactNode } from 'react';
import {
  type AuthAlternateAction,
  authFormBodyClassName,
  authFormSurfaceClassName,
} from '@/features/auth/auth-styles';
import { AuthAlternateActionRow } from '@/features/auth/AuthFooter';

type AuthMessageCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  alternateAction?: AuthAlternateAction;
};

export function AuthMessageCard({
  title,
  description,
  children,
  alternateAction,
}: AuthMessageCardProps) {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </header>

      <div className={authFormSurfaceClassName}>
        <div className={`${authFormBodyClassName} space-y-3`}>{children}</div>
        {alternateAction && <AuthAlternateActionRow {...alternateAction} />}
      </div>
    </div>
  );
}
