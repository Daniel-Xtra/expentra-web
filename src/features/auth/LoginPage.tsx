import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { handleMutationError } from '@/shared/api/form-errors';
import { PasswordInputField } from '@/shared/components/PasswordInputField';
import { RhfInputField } from '@/shared/components/RhfInputField';
import { AuthFormCard } from './AuthFormCard';
import { AuthPageLayout } from './AuthPageLayout';
import { loginSchema, type LoginFormValues } from './schemas';
import { useAuth } from './use-auth';
import { useAuthRedirectTarget } from './use-auth-redirect';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const redirectTarget = useAuthRedirectTarget();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (redirectTarget && !isSubmitting) {
    return <Navigate to={redirectTarget} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values.email, values.password);
      navigate('/', { replace: true });
    } catch (err) {
      handleMutationError(err, { setError, fallback: 'Sign-in failed' });
    }
  });

  return (
    <AuthPageLayout
      footerLink={{ prompt: "Don't have an account?", label: 'Sign up', to: '/signup' }}
    >
      <AuthFormCard
        title="Sign in"
        description="Use your company email and password."
        submitLabel="Sign in"
        loadingLabel="Signing in…"
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
        <PasswordInputField
          register={register}
          name="password"
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
        />
        <div className="-mt-2 flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </AuthFormCard>
    </AuthPageLayout>
  );
}
