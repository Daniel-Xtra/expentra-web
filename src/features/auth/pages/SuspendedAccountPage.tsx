import { useEffect } from 'react';
import { markAccountSuspended } from '@/shared/api/auth-errors';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { SuspendedAccountPanel } from '../components/SuspendedAccountPanel';

export function SuspendedAccountPage() {
  useEffect(() => {
    markAccountSuspended();
  }, []);

  return (
    <AuthPageLayout>
      <SuspendedAccountPanel />
    </AuthPageLayout>
  );
}
