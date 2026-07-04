import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RhfOtpField } from '@/shared/components/RhfOtpField';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { AuthFormCard } from './AuthFormCard';
import { AuthPageLayout } from './AuthPageLayout';
import {
  clearVerificationResendInFlight,
  isUserEmailVerified,
  markVerificationResendInFlight,
  recordVerificationResendAttempt,
  shouldAutoResendVerification,
} from './auth-session';
import { verifyEmailSchema, type VerifyEmailFormValues } from './schemas';
import { useAuth } from './use-auth';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';
  const { user, confirmEmailVerification, resendEmailVerification, signOut } = useAuth();
  const autoResendStarted = useRef(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { token: tokenFromUrl },
  });

  useEffect(() => {
    if (tokenFromUrl) {
      setValue('token', tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  useEffect(() => {
    if (autoResendStarted.current || !user || isUserEmailVerified(user)) {
      return;
    }

    if (!shouldAutoResendVerification() || !markVerificationResendInFlight()) {
      return;
    }

    autoResendStarted.current = true;

    void (async () => {
      if (tokenFromUrl) {
        setValue('token', '');
        navigate('/verify-email', { replace: true });
      }

      try {
        const message = await resendEmailVerification();
        recordVerificationResendAttempt();
        toastSuccess(message || 'A new verification code has been sent to your email.');
      } catch (err) {
        autoResendStarted.current = false;
        toastError(err, 'Failed to resend verification email');
      } finally {
        clearVerificationResendInFlight();
      }
    })();
  }, [user, resendEmailVerification, tokenFromUrl, navigate, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const message = await confirmEmailVerification(values.token);
      toastSuccess(message);
      navigate('/', { replace: true });
    } catch (err) {
      toastError(err, 'Email verification failed');
    }
  });

  const handleResend = async () => {
    if (!shouldAutoResendVerification()) {
      toastError('Please wait a minute before requesting another code.');
      return;
    }

    try {
      const message = await resendEmailVerification();
      recordVerificationResendAttempt();
      setValue('token', '');
      toastSuccess(message || 'A new verification code has been sent to your email.');
    } catch (err) {
      toastError(err, 'Failed to resend verification email');
    }
  };

  if (isUserEmailVerified(user)) {
    return (
      <AuthPageLayout footerLink={{ prompt: 'Back to', label: 'Dashboard', to: '/' }}>
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg">Email verified</CardTitle>
            <CardDescription>Your email address is already verified.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button asChild className="w-full" size="lg">
              <Link to="/">Go to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      footerLink={{
        prompt: 'Wrong account?',
        label: 'Sign out',
        onClick: () => void signOut(),
      }}
    >
      <AuthFormCard
        title="Verify your email"
        description={
          user?.email
            ? `Enter the code sent to ${user.email}.`
            : 'Enter the verification code from your email.'
        }
        submitLabel="Verify email"
        loadingLabel="Verifying…"
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        actions={
          <Button type="button" variant="outline" className="w-full" onClick={() => void handleResend()}>
            Resend verification email
          </Button>
        }
      >
        <RhfOtpField
          control={control}
          name="token"
          error={errors.token?.message}
        />
      </AuthFormCard>
    </AuthPageLayout>
  );
}
