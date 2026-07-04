import { Link } from 'react-router-dom';
import { WarningCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/use-auth';

export function EmailVerificationBanner() {
  const { user } = useAuth();

  if (!user || user.isEmailVerified) {
    return null;
  }

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-950">
      <WarningCircleIcon />
      <AlertTitle>Verify your email</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>Check your inbox for a verification code to unlock full access.</span>
        <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-300 bg-white">
          <Link to="/verify-email">Verify now</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
