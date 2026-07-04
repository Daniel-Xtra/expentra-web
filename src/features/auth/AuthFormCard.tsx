import type { FormEventHandler, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AuthFormCardProps = {
  title: string;
  description: string;
  submitLabel: string;
  loadingLabel: string;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  actions?: ReactNode;
  hideSubmit?: boolean;
};

export function AuthFormCard({
  title,
  description,
  submitLabel,
  loadingLabel,
  isSubmitting,
  onSubmit,
  children,
  actions,
  hideSubmit = false,
}: AuthFormCardProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {children}
          {actions}
          {!hideSubmit && (
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? loadingLabel : submitLabel}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
