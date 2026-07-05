import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { OtpInput } from '@/shared/components/OtpInput';
import { LoadingState } from '@/shared/components/LoadingState';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { requestPasswordReset, validatePasswordResetToken } from '../api';
import { queryKeys } from '@/shared/api/query-keys';
import { AuthPrimaryButton, AuthSecondaryButton } from '../components/AuthButtons';
import { AuthFormShell } from '../components/AuthFormShell';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { AuthStatusPanel, AuthStepHeader } from '../components/AuthStepHeader';
import { resetPasswordCodeSchema, type ResetPasswordCodeFormValues } from '../schemas';

const OTP_LENGTH = 6;

function resetPasswordNewPath(token: string) {
  return `/reset-password/new?token=${encodeURIComponent(token)}`;
}

function isOtpComplete(token: string) {
  return token.length === OTP_LENGTH;
}

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';
  const email = (location.state as { email?: string } | null)?.email?.trim() ?? '';
  const [isResending, setIsResending] = useState(false);

  const form = useForm<ResetPasswordCodeFormValues>({
    resolver: zodResolver(resetPasswordCodeSchema),
    defaultValues: { token: tokenFromUrl },
  });
  const { errors, isSubmitting } = form.formState;
  const token = form.watch('token') ?? '';

  useEffect(() => {
    if (tokenFromUrl) {
      form.setValue('token', tokenFromUrl);
    }
  }, [tokenFromUrl, form]);

  const tokenQuery = useQuery({
    queryKey: queryKeys.auth.passwordResetValidate(tokenFromUrl),
    queryFn: () => validatePasswordResetToken(tokenFromUrl),
    enabled: tokenFromUrl.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (tokenQuery.isSuccess && tokenFromUrl) {
      navigate(resetPasswordNewPath(tokenFromUrl), { replace: true });
    }
  }, [tokenQuery.isSuccess, tokenFromUrl, navigate]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await validatePasswordResetToken(values.token);
      navigate(resetPasswordNewPath(values.token));
    } catch (err) {
      toastError(err, 'Invalid or expired reset code');
    }
  });

  const handleResend = async () => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    setIsResending(true);
    try {
      await requestPasswordReset(email);
      toastSuccess('A new reset code has been sent to your email.');
    } catch (err) {
      toastError(err, 'Failed to resend reset code');
    } finally {
      setIsResending(false);
    }
  };

  if (tokenFromUrl && tokenQuery.isLoading) {
    return (
      <AuthPageLayout>
        <LoadingState layout="auth" message="Validating reset code…" />
      </AuthPageLayout>
    );
  }

  if (tokenFromUrl && tokenQuery.isError) {
    return (
      <AuthPageLayout footerLink={{ prompt: 'Remembered your password?', label: 'Sign in', to: '/login' }}>
        <AuthStatusPanel
          title="Link expired or invalid"
          description="This reset link is no longer valid. Enter a new code or request another reset email."
          actions={
            <>
              <AuthPrimaryButton asChild>
                <Link to="/forgot-password">Request a new code</Link>
              </AuthPrimaryButton>
              <AuthSecondaryButton asChild>
                <Link to="/verify-otp">Enter code manually</Link>
              </AuthSecondaryButton>
            </>
          }
        />
      </AuthPageLayout>
    );
  }

  const canContinue = isOtpComplete(token);

  return (
    <AuthPageLayout footerLink={{ prompt: 'Remembered your password?', label: 'Sign in', to: '/login' }}>
      <AuthFormShell
        header={<AuthStepHeader step={2} total={3} backTo="/forgot-password" />}
        title="Enter verification code"
        description={
          email
            ? `An OTP has been sent to ${email}`
            : 'An OTP has been sent to your email address'
        }
        submitLabel="Continue"
        loadingLabel="Verifying…"
        isSubmitting={isSubmitting}
        submitDisabled={!canContinue}
        onSubmit={onSubmit}
      >
        <Form {...form}>
          <div className="space-y-4">
            <Controller
              control={form.control}
              name="token"
              render={({ field }) => (
                <OtpInput
                  id="reset-otp"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  length={OTP_LENGTH}
                  align="start"
                  disabled={isSubmitting}
                  aria-invalid={errors.token ? true : undefined}
                />
              )}
            />
            {errors.token?.message ? (
              <p className="text-xs text-error-500">{errors.token.message}</p>
            ) : null}
            <button
              type="button"
              className="text-sm font-semibold text-primary-500 hover:underline disabled:pointer-events-none disabled:opacity-50"
              disabled={isResending}
              onClick={() => void handleResend()}
            >
              {isResending ? 'Sending…' : 'Resend code'}
            </button>
          </div>
        </Form>
      </AuthFormShell>
    </AuthPageLayout>
  );
}
