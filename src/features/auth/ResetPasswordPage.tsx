import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PasswordInputField } from '@/shared/components/PasswordInputField';
import { handleMutationError } from '@/shared/api/form-errors';
import { toastSuccess } from '@/shared/lib/toast';
import { confirmPasswordReset } from './api';
import { AuthPageLayout } from './AuthPageLayout';
import { AuthStepHeader } from './AuthStepHeader';
import { setNewPasswordSchema, type SetNewPasswordFormValues } from './schemas';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SetNewPasswordFormValues>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const password = useWatch({ control, name: 'password' }) ?? '';

  if (!token) {
    return <Navigate to="/verify-otp" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const message = await confirmPasswordReset(token, values.password);
      toastSuccess(message);
      navigate('/login', { replace: true });
    } catch (err) {
      handleMutationError(err, { setError, fallback: 'Failed to reset password' });
    }
  });

  return (
    <AuthPageLayout footerLink={{ prompt: 'Remembered Password?', label: 'Sign In', to: '/login' }}>
      <div className="w-full space-y-6">
        <AuthStepHeader step={3} total={3} backTo="/verify-otp" />

        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Set new password</h1>
          <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-6">
          <div className="space-y-4">
            <PasswordInputField
              register={register}
              name="password"
              label="New password"
              autoComplete="new-password"
              error={errors.password?.message}
              criteriaValue={password}
              showCriteria
            />
            <PasswordInputField
              register={register}
              name="confirmPassword"
              label="Confirm new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
            />
          </div>

          <div className="space-y-3">
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Resetting…' : 'Reset password'}
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <Link to="/verify-otp">Use a different code</Link>
            </Button>
          </div>
        </form>
      </div>
    </AuthPageLayout>
  );
}
