import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logoMarkLightUrl from '@/assets/brand/logo-mark-light.svg';
import logoMarkUrl from '@/assets/brand/logo-mark.svg';
import logoLightUrl from '@/assets/brand/logo-light.svg';
import logoUrl from '@/assets/brand/logo.svg';

type BrandLogoProps = {
  variant?: 'full' | 'mark' | 'lockup';
  theme?: 'default' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
  subtitle?: string;
};

const markSizeClasses = {
  sm: 'size-7',
  md: 'size-9',
  lg: 'size-12',
} as const;

const lockupHeightClasses = {
  sm: 'h-7',
  md: 'h-8',
  lg: 'h-10',
} as const;

export function BrandLogo({
  variant = 'lockup',
  theme = 'default',
  size = 'sm',
  className,
  href = '/',
  subtitle,
}: BrandLogoProps) {
  const isLight = theme === 'light';
  const markSrc = isLight ? logoMarkLightUrl : logoMarkUrl;

  if (variant === 'full') {
    const logoSrc = isLight ? logoLightUrl : logoUrl;
    return (
      <Link
        to={href}
        className={cn('inline-flex min-w-0 items-center', className)}
        aria-label="Expentra home"
      >
        <img
          src={logoSrc}
          alt="Expentra"
          className={cn('w-auto max-w-[168px]', lockupHeightClasses[size])}
        />
      </Link>
    );
  }

  if (variant === 'mark') {
    return (
      <Link to={href} className={cn('inline-flex shrink-0', className)} aria-label="Expentra home">
        <img src={markSrc} alt="Expentra" className={markSizeClasses[size]} />
      </Link>
    );
  }

  return (
    <Link
      to={href}
      className={cn('inline-flex min-w-0 items-center gap-2.5', className)}
      aria-label="Expentra home"
    >
      <img src={markSrc} alt="" aria-hidden className={cn('shrink-0', markSizeClasses[size])} />
      <div className="min-w-0">
        <p
          className={cn(
            'truncate font-semibold tracking-tight',
            size === 'lg' ? 'text-lg' : 'text-sm',
            isLight ? 'text-primary-foreground' : 'text-foreground',
          )}
        >
          Expentra
        </p>
        {subtitle && (
          <p
            className={cn(
              'truncate text-xs',
              isLight ? 'text-primary-foreground/70' : 'text-muted-foreground',
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}
