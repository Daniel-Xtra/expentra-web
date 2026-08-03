import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { handleMutationError } from '@/shared/api/form-errors';
import { requestPasswordReset } from '../api';
import { AuthFormShell } from '../components/AuthFormShell';
import { AuthInputField } from '../components/AuthInputField';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { AuthStepHeader } from '../components/AuthStepHeader';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas';
import { useAuthRedirectTarget } from '../hooks/use-auth-redirect';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const redirectTarget = useAuthRedirectTarget();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const { isSubmitting } = form.formState;

  if (redirectTarget) {
    return <Navigate to={redirectTarget} replace />;
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await requestPasswordReset(values.email);
      navigate('/verify-otp', { state: { email: values.email } });
    } catch (err) {
      handleMutationError(err, { setError: form.setError, fallback: 'Failed to send reset email' });
    }
  });

  return (
    <AuthPageLayout footerLink={{ prompt: 'Remember your password?', label: 'Sign in', to: '/' }}>
      <AuthFormShell
        header={<AuthStepHeader step={1} total={3} backTo="/" />}
        title="Forgot password"
        description="Enter your email and we'll send you a reset code."
        submitLabel="Send reset code"
        loadingLabel="Sending…"
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      >
        <Form {...form}>
          <AuthInputField
            control={form.control}
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
          />
        </Form>
      </AuthFormShell>
    </AuthPageLayout>
  );
}
