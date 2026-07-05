import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { handleMutationError } from '@/shared/api/form-errors';
import { toastSuccess } from '@/shared/lib/toast';
import { AuthFormShell } from '../components/AuthFormShell';
import { AuthInputField } from '../components/AuthInputField';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { AuthPasswordField } from '../components/AuthPasswordField';
import { signUpSchema, type SignUpFormValues } from '../schemas';
import { useAuth } from '../hooks/use-auth';
import { useAuthRedirectTarget } from '../hooks/use-auth-redirect';

export function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const redirectTarget = useAuthRedirectTarget();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const { isSubmitting } = form.formState;
  const password = useWatch({ control: form.control, name: 'password' }) ?? '';

  if (redirectTarget) {
    return <Navigate to={redirectTarget} replace />;
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const message = await signUp({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      toastSuccess(message);
      navigate('/verify-email', { replace: true });
    } catch (err) {
      handleMutationError(err, { setError: form.setError, fallback: 'Registration failed' });
    }
  });

  return (
    <AuthPageLayout
      footerLink={{ prompt: 'Already have an account?', label: 'Sign in', to: '/login' }}
    >
      <AuthFormShell
        title="Create account"
        description="Register with your work email to get started."
        submitLabel="Create account"
        loadingLabel="Creating account…"
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      >
        <Form {...form}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <AuthInputField
                control={form.control}
                name="firstName"
                label="First name"
                autoComplete="given-name"
                placeholder="Jane"
              />
              <AuthInputField
                control={form.control}
                name="lastName"
                label="Last name"
                autoComplete="family-name"
                placeholder="Doe"
              />
            </div>
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
              autoComplete="new-password"
              showCriteria
              criteriaValue={password}
            />
            <AuthPasswordField
              control={form.control}
              name="confirmPassword"
              label="Confirm password"
              autoComplete="new-password"
            />
          </div>
        </Form>
      </AuthFormShell>
    </AuthPageLayout>
  );
}
