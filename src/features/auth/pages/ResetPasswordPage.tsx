import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { handleMutationError } from '@/shared/api/form-errors';
import { toastSuccess } from '@/shared/lib/toast';
import { confirmPasswordReset } from '../api';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { AuthFormShell } from '../components/AuthFormShell';
import { AuthPasswordField } from '../components/AuthPasswordField';
import { AuthSecondaryButton } from '../components/AuthButtons';
import { AuthStepHeader } from '../components/AuthStepHeader';
import { setNewPasswordSchema, type SetNewPasswordFormValues } from '../schemas';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const form = useForm<SetNewPasswordFormValues>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const { isSubmitting } = form.formState;
  const password = useWatch({ control: form.control, name: 'password' }) ?? '';

  if (!token) {
    return <Navigate to="/verify-otp" replace />;
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const message = await confirmPasswordReset(token, values.password);
      toastSuccess(message);
      navigate('/login', { replace: true });
    } catch (err) {
      handleMutationError(err, { setError: form.setError, fallback: 'Failed to reset password' });
    }
  });

  return (
    <AuthPageLayout footerLink={{ prompt: 'Remembered your password?', label: 'Sign in', to: '/login' }}>
      <AuthFormShell
        header={<AuthStepHeader step={3} total={3} backTo="/verify-otp" />}
        title="Set new password"
        description="Choose a strong password for your account."
        submitLabel="Reset password"
        loadingLabel="Resetting…"
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        trailingActions={
          <AuthSecondaryButton asChild>
            <Link to="/verify-otp">Use a different code</Link>
          </AuthSecondaryButton>
        }
      >
        <Form {...form}>
          <div className="space-y-5">
            <AuthPasswordField
              control={form.control}
              name="password"
              label="New password"
              autoComplete="new-password"
              showCriteria
              criteriaValue={password}
            />
            <AuthPasswordField
              control={form.control}
              name="confirmPassword"
              label="Confirm new password"
              autoComplete="new-password"
            />
          </div>
        </Form>
      </AuthFormShell>
    </AuthPageLayout>
  );
}
