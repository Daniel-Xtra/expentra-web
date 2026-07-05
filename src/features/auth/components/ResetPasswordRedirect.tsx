import { Navigate, useSearchParams } from 'react-router-dom';
export function ResetPasswordRedirect() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim();
  if (token) {
    return <Navigate to={`/verify-otp?token=${encodeURIComponent(token)}`} replace />;
  }
  return <Navigate to="/verify-otp" replace />;
}

