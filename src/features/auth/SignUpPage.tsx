import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { handleMutationError } from '@/shared/api/form-errors';
import { PasswordInputField } from '@/shared/components/PasswordInputField';
import { RhfInputField } from '@/shared/components/RhfInputField';
import { toastSuccess } from '@/shared/lib/toast';
import { AuthFormCard } from './AuthFormCard';
import { AuthPageLayout } from './AuthPageLayout';
import { signUpSchema, type SignUpFormValues } from './schemas';
import { useAuth } from './use-auth';
import { useAuthRedirectTarget } from './use-auth-redirect';

export function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const redirectTarget = useAuthRedirectTarget();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const password = useWatch({ control, name: 'password' }) ?? '';

  if (redirectTarget) {
    return <Navigate to={redirectTarget} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
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
      handleMutationError(err, { setError, fallback: 'Registration failed' });
    }
  });

  return (
    <AuthPageLayout
      footerLink={{ prompt: 'Already have an account?', label: 'Sign in', to: '/login' }}
    >
      <AuthFormCard
        title="Create account"
        description="Register with your work email to get started."
        submitLabel="Create account"
        loadingLabel="Creating account…"
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RhfInputField
            register={register}
            name="firstName"
            label="First name"
            autoComplete="given-name"
            placeholder="Jane"
            error={errors.firstName?.message}
          />
          <RhfInputField
            register={register}
            name="lastName"
            label="Last name"
            autoComplete="family-name"
            placeholder="Doe"
            error={errors.lastName?.message}
          />
        </div>
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
          autoComplete="new-password"
          error={errors.password?.message}
          criteriaValue={password}
          showCriteria
        />
        <PasswordInputField
          register={register}
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
        />
      </AuthFormCard>
    </AuthPageLayout>
  );
}
