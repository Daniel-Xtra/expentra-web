import type { CSSProperties } from 'react';

type IconProps = {
  icon: string;
  height?: number;
  width?: number;
  format?: 'png' | 'svg';
  className?: string;
  type?: 'icons' | 'images';
  onClick?: () => void;
  style?: CSSProperties;
};

export default function Icon({
  icon,
  height = 24,
  width = 24,
  format = 'png',
  className,
  type = 'icons',
  onClick,
  style,
}: IconProps) {
  return (
    <img
      src={`/src/assets/${type}/${icon}.${format}`}
      alt=""
      width={width}
      height={height}
      className={className}
      onClick={onClick}
      style={style}
    />
  );
}
