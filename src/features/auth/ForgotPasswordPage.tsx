import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { RhfInputField } from '@/shared/components/RhfInputField';
import { handleMutationError } from '@/shared/api/form-errors';
import { requestPasswordReset } from './api';
import { AuthFormCard } from './AuthFormCard';
import { AuthPageLayout } from './AuthPageLayout';
import { AuthStepHeader } from './AuthStepHeader';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from './schemas';
import { useAuthRedirectTarget } from './use-auth-redirect';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const redirectTarget = useAuthRedirectTarget();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  if (redirectTarget) {
    return <Navigate to={redirectTarget} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await requestPasswordReset(values.email);
      navigate('/verify-otp', { state: { email: values.email } });
    } catch (err) {
      handleMutationError(err, { setError, fallback: 'Failed to send reset email' });
    }
  });

  return (
    <AuthPageLayout footerLink={{ prompt: 'Remember your password?', label: 'Sign in', to: '/login' }}>
      <div className="w-full space-y-6">
        <AuthStepHeader step={1} total={3} backTo="/login" />

        <AuthFormCard
          title="Forgot password"
          description="Enter your email and we'll send you a reset code."
          submitLabel="Send reset code"
          loadingLabel="Sending…"
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        >
          <RhfInputField
            register={register}
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            error={errors.email?.message}
          />
        </AuthFormCard>
      </div>
    </AuthPageLayout>
  );
}
