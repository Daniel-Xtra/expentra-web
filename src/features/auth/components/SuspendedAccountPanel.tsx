import { useNavigate } from 'react-router-dom';
import { clearAccountSuspended } from '@/shared/api/auth-errors';
import { AppIcon } from '@/shared/reusable/AppIcon';
import { useAuth } from '../hooks/use-auth';
import { AuthPrimaryButton } from './AuthButtons';

export function SuspendedAccountPanel() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleBackToSignIn = () => {
    clearAccountSuspended();
    void signOut().finally(() => {
      navigate('/', { replace: true });
    });
  };

  return (
    <div className="space-y-8 text-center">
      <AppIcon icon="upload-error" className="mx-auto size-16" />

      <div className="space-y-2">
        <h1 className="text-xl/[28px] font-semibold tracking-tight text-neutral-950">
          Your account has been suspended
        </h1>
        <p className="text-sm/[19.6px] text-black-400">
          Your access to Expentra has been suspended by your organization
          administrator. You can't sign in until your account has been
          reactivated.
        </p>
        <p className="text-sm/[19.6px] text-black-400">
          If you believe this is a mistake, please contact your organization
          administrator.
        </p>
      </div>

      <AuthPrimaryButton onClick={handleBackToSignIn}>
        Back to sign in
      </AuthPrimaryButton>
    </div>
  );
}
