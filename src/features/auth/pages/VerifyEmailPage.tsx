import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { RhfOtpField } from '@/shared/components/RhfOtpField';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { AuthFormShell } from '../components/AuthFormShell';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { AuthPrimaryButton, AuthSecondaryButton } from '../components/AuthButtons';
import { AuthStatusPanel } from '../components/AuthStepHeader';
import {
  clearVerificationResendInFlight,
  isUserEmailVerified,
  markVerificationResendInFlight,
  recordVerificationResendAttempt,
  shouldAutoResendVerification,
} from '../auth-session';
import { verifyEmailSchema, type VerifyEmailFormValues } from '../schemas';
import { useAuth } from '../hooks/use-auth';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';
  const { user, confirmEmailVerification, resendEmailVerification, signOut } = useAuth();
  const autoResendStarted = useRef(false);

  const form = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { token: tokenFromUrl },
  });
  const { errors, isSubmitting } = form.formState;

  useEffect(() => {
    if (tokenFromUrl) {
      form.setValue('token', tokenFromUrl);
    }
  }, [tokenFromUrl, form]);

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
        form.setValue('token', '');
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
  }, [user, resendEmailVerification, tokenFromUrl, navigate, form]);

  const onSubmit = form.handleSubmit(async (values) => {
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
      form.setValue('token', '');
      toastSuccess(message || 'A new verification code has been sent to your email.');
    } catch (err) {
      toastError(err, 'Failed to resend verification email');
    }
  };

  if (isUserEmailVerified(user)) {
    return (
      <AuthPageLayout footerLink={{ prompt: 'Back to', label: 'Dashboard', to: '/' }}>
        <AuthStatusPanel
          title="Email verified"
          description="Your email address is already verified."
          actions={
            <AuthPrimaryButton asChild>
              <Link to="/">Go to dashboard</Link>
            </AuthPrimaryButton>
          }
        />
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
      <AuthFormShell
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
          <AuthSecondaryButton onClick={() => void handleResend()}>
            Resend verification email
          </AuthSecondaryButton>
        }
      >
        <Form {...form}>
          <RhfOtpField control={form.control} name="token" error={errors.token?.message} />
        </Form>
      </AuthFormShell>
    </AuthPageLayout>
  );
}
