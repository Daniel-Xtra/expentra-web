import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type AssetIconProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src: string;
  alt?: string;
};

export function AssetIcon({ src, alt = '', className, ...props }: AssetIconProps) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={cn('inline-block size-4 object-contain', className)}
      {...props}
    />
  );
}
