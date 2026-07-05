import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { handleMutationError } from '@/shared/api/form-errors';
import { AuthFormShell } from '../components/AuthFormShell';
import { AuthInputField } from '../components/AuthInputField';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { AuthPasswordField } from '../components/AuthPasswordField';
import { loginSchema, type LoginFormValues } from '../schemas';
import { useAuth } from '../hooks/use-auth';
import { useAuthRedirectTarget } from '../hooks/use-auth-redirect';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const redirectTarget = useAuthRedirectTarget();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const { isSubmitting } = form.formState;

  if (redirectTarget && !isSubmitting) {
    return <Navigate to={redirectTarget} replace />;
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await signIn(values.email, values.password);
      navigate('/', { replace: true });
    } catch (err) {
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
                className="text-sm font-semibold text-primary-500 hover:underline"
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
