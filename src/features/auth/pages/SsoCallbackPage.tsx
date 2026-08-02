import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { isAccountSuspendedError } from '@/shared/api/auth-errors';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { useAuth } from '../hooks/use-auth';
import { useAuthRedirectTarget } from '../hooks/use-auth-redirect';

export function SsoCallbackPage() {
  const { completeSso } = useAuth();
  const navigate = useNavigate();
  const redirectTarget = useAuthRedirectTarget();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = searchParams.get('code')?.trim();
    if (!code) {
      setError('SSO sign-in did not return a session code.');
      return;
    }

    void (async () => {
      try {
        await completeSso(code);
        navigate('/', { replace: true });
      } catch (err) {
        if (isAccountSuspendedError(err)) {
          navigate('/account-suspended', { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : 'SSO sign-in failed');
      }
    })();
  }, [completeSso, navigate, searchParams]);

  if (redirectTarget && !error) {
    return <Navigate to={redirectTarget} replace />;
  }

  return (
    <AuthPageLayout>
      <div className="space-y-4">
        <h1 className="text-xl/[28px] font-semibold tracking-tight text-neutral-950">
          {error ? 'SSO sign-in failed' : 'Completing sign-in…'}
        </h1>
        {error ? (
          <>
            <p className="text-sm/[19.6px] text-black-400">{error}</p>
            <Link
              to="/login"
              className="inline-block text-sm font-semibold text-primary-500 hover:underline"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <p className="text-sm/[19.6px] text-black-400">
            Please wait while we finish signing you in.
          </p>
        )}
      </div>
    </AuthPageLayout>
  );
}
