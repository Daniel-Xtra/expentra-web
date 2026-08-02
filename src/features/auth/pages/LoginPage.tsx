import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import {
  isAccountSuspendedError,
  isAccountSuspendedMessage,
  markAccountSuspended,
} from '@/shared/api/auth-errors';
import { handleMutationError } from '@/shared/api/form-errors';
import { toastError, toastInfo } from '@/shared/lib/toast';
import { getIdleLogoutMessage } from '../hooks/use-idle-session-timeout';
import { AuthFormShell } from '../components/AuthFormShell';
import { AuthInputField } from '../components/AuthInputField';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { AuthPasswordField } from '../components/AuthPasswordField';
import { AuthSecondaryButton } from '../components/AuthButtons';
import { GoogleIcon } from '../components/GoogleIcon';
import { loginSchema, type LoginFormValues } from '../schemas';
import { useAuth } from '../hooks/use-auth';
import { useAuthRedirectTarget } from '../hooks/use-auth-redirect';
import { fetchSsoStatus, getSsoStartUrl, type SsoStatus } from '../api';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const redirectTarget = useAuthRedirectTarget();
  const [searchParams, setSearchParams] = useSearchParams();
  const [ssoStatus, setSsoStatus] = useState<SsoStatus | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const { isSubmitting } = form.formState;

  useEffect(() => {
    const message = getIdleLogoutMessage();
    if (message) {
      toastInfo(message);
    }
  }, []);

  useEffect(() => {
    const ssoError = searchParams.get('ssoError');
    if (!ssoError) {
      return;
    }

    if (isAccountSuspendedMessage(ssoError)) {
      markAccountSuspended();
      navigate('/account-suspended', { replace: true });
      return;
    }

    toastError(ssoError);
    const next = new URLSearchParams(searchParams);
    next.delete('ssoError');
    setSearchParams(next, { replace: true });
  }, [navigate, searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const status = await fetchSsoStatus();
        if (!cancelled) {
          setSsoStatus(status);
        }
      } catch {
        if (!cancelled) {
          setSsoStatus({ enabled: false, buttonLabel: 'Sign in with SSO' });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (redirectTarget && !isSubmitting) {
    return <Navigate to={redirectTarget} replace />;
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await signIn(values.email, values.password);
      if (!result.isEmailVerified) {
        navigate('/verify-email', { replace: true });
        return;
      }
      navigate('/', { replace: true });
    } catch (err) {
      if (isAccountSuspendedError(err)) {
        navigate('/account-suspended', { replace: true });
        return;
      }

      handleMutationError(err, { setError: form.setError, fallback: 'Sign-in failed' });
    }
  });

  return (
    <AuthPageLayout
      footerLink={{ prompt: "Don't have an account?", label: 'Sign up', to: '/signup' }}
    >
      <AuthFormShell
        title="Welcome back"
        submitLabel="Continue"
        loadingLabel="Signing in…"
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        trailingActions={
          ssoStatus?.enabled ? (
            <div className="space-y-4">
              <div className="relative flex items-center gap-3">
                <div className="h-px flex-1 bg-black-50" />
                <span className="text-xs font-medium uppercase tracking-wide text-black-400">
                  or
                </span>
                <div className="h-px flex-1 bg-black-50" />
              </div>
              <AuthSecondaryButton
                onClick={() => {
                  window.location.assign(getSsoStartUrl());
                }}
              >
                <span className="inline-flex items-center justify-center gap-2.5">
                  <GoogleIcon className="size-5 shrink-0" />
                  {ssoStatus.buttonLabel}
                </span>
              </AuthSecondaryButton>
            </div>
          ) : null
        }
      >
        <Form {...form}>
          <div className="space-y-5">
            <AuthInputField
              control={form.control}
              name="email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
            />
            <AuthPasswordField
              control={form.control}
              name="password"
              label="Password"
              autoComplete="current-password"
            />
            <div className="-mt-2 flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-primary-500"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </Form>
      </AuthFormShell>
    </AuthPageLayout>
  );
}
