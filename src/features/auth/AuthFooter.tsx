import { Link } from 'react-router-dom';
import { authFormFooterClassName, type AuthAlternateAction } from '@/features/auth/auth-styles';

export function AuthAlternateActionRow({ prompt, label, to, onClick }: AuthAlternateAction) {
  return (
    <div className={authFormFooterClassName}>
      {prompt}{' '}
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="cursor-pointer font-medium text-primary hover:underline"
        >
          {label}
        </button>
      ) : (
        <Link to={to ?? '/login'} className="font-medium text-primary hover:underline">
          {label}
        </Link>
      )}
    </div>
  );
}
