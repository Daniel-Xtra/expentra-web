import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

const iconModules = import.meta.glob('../../assets/icons/*.{png,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

type AppIconProps = {
  icon: string;
  height?: number;
  width?: number;
  format?: 'png' | 'svg';
  className?: string;
  type?: 'icons' | 'images';
  onClick?: () => void;
  style?: CSSProperties;
  alt?: string;
};

function resolveAssetSrc(
  icon: string,
  format: 'png' | 'svg',
  type: 'icons' | 'images',
): string {
  if (type === 'icons') {
    const key = `../../assets/icons/${icon}.${format}`;
    return iconModules[key] ?? `/assets/${icon}.${format}`;
  }
  return `/assets/${icon}.${format}`;
}

export function AppIcon({
  icon,
  height = 24,
  width = 24,
  format = 'png',
  className,
  type = 'icons',
  onClick,
  style,
  alt = '',
}: AppIconProps) {
  return (
    <img
      src={resolveAssetSrc(icon, format, type)}
      alt={alt}
      width={width}
      height={height}
      aria-hidden={alt ? undefined : true}
      className={cn('inline-block object-contain', className)}
      onClick={onClick}
      style={style}
    />
  );
}
