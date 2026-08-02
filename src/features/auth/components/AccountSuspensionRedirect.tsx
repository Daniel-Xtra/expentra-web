import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  isAccountSuspensionActive,
  onAccountSuspended,
  onAccountSuspendedCleared,
} from '@/shared/api/auth-errors';

export function AccountSuspensionRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const [suspended, setSuspended] = useState(isAccountSuspensionActive);

  useEffect(() => onAccountSuspended(() => setSuspended(true)), []);
  useEffect(() => onAccountSuspendedCleared(() => setSuspended(false)), []);

  useEffect(() => {
    if (suspended && !location.pathname.startsWith('/account-suspended')) {
      navigate('/account-suspended', { replace: true });
    }
  }, [suspended, location.pathname, navigate]);

  return null;
}
