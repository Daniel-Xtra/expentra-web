import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OtpInput } from '@/shared/components/OtpInput';
import { LoadingState } from '@/shared/components/LoadingState';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { requestPasswordReset, validatePasswordResetToken } from './api';
import { queryKeys } from '@/shared/api/query-keys';
import { AuthPageLayout } from './AuthPageLayout';
import { AuthStepHeader } from './AuthStepHeader';
import { resetPasswordCodeSchema, type ResetPasswordCodeFormValues } from './schemas';

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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordCodeFormValues>({
    resolver: zodResolver(resetPasswordCodeSchema),
    defaultValues: { token: tokenFromUrl },
  });

  const token = watch('token') ?? '';

  useEffect(() => {
    if (tokenFromUrl) {
      setValue('token', tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

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

  const onSubmit = handleSubmit(async (values) => {
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
      <AuthPageLayout footerLink={{ prompt: 'Remembered Password?', label: 'Sign In', to: '/login' }}>
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg">Link expired or invalid</CardTitle>
            <CardDescription>
              This reset link is no longer valid. Enter a new code or request another reset email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <Button asChild className="w-full" size="lg">
              <Link to="/forgot-password">Request a new code</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link to="/verify-otp">Enter code manually</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthPageLayout>
    );
  }

  const canContinue = isOtpComplete(token);

  return (
    <AuthPageLayout footerLink={{ prompt: 'Remembered Password?', label: 'Sign In', to: '/login' }}>
      <div className="w-full space-y-6">
        <AuthStepHeader step={2} total={3} backTo="/forgot-password" />

        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Enter Verification Code
          </h1>
          <p className="text-sm text-muted-foreground">
            {email
              ? `An OTP has been sent to ${email}`
              : 'An OTP has been sent to your email address'}
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-6">
          <div className="space-y-4">
            <Controller
              control={control}
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
            {errors.token?.message && (
              <p className="text-xs text-destructive">{errors.token.message}</p>
            )}
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
              disabled={isResending}
              onClick={() => void handleResend()}
            >
              {isResending ? 'Sending…' : 'Resend code'}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!canContinue || isSubmitting}
          >
            {isSubmitting ? 'Verifying…' : 'Continue'}
          </Button>
        </form>
      </div>
    </AuthPageLayout>
  );
}
