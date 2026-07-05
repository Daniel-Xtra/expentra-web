import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatUserName } from '@/shared/utils/user';

const sizeStyles = {
  sm: { root: 'size-9', text: 'text-xs' },
  md: { root: 'size-10', text: 'text-lg' },
  lg: { root: 'size-16', text: 'text-xl' },
  xl: { root: 'size-20', text: 'text-2xl' },
} as const;

type UserAvatarProps = {
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string;
  } | null;
  initials?: string;
  size?: keyof typeof sizeStyles;
  className?: string;
};

export function UserAvatar({
  user,
  initials,
  size = 'md',
  className,
}: UserAvatarProps) {
  const displayInitial =
    initials ?? formatUserName(user).charAt(0).toUpperCase();
  const styles = sizeStyles[size];

  return (
    <Avatar
      className={cn('shrink-0 rounded-md after:rounded-md', styles.root, className)}
    >
      <AvatarFallback
        className={cn(
          'rounded-md bg-neutral-950 font-sans font-semibold text-white',
          styles.text,
        )}
      >
        {displayInitial}
      </AvatarFallback>
    </Avatar>
  );
}
