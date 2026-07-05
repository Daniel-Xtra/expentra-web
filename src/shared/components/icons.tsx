import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconDashboard(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Icon>
  );
}

export function IconReceipt(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </Icon>
  );
}

export function IconFile(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </Icon>
  );
}

export function IconClipboard(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </Icon>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
      <circle cx="17" cy="13" r="1" />
    </Icon>
  );
}

export function IconChart(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 19V5M4 19h16" />
      <path d="M8 15V9M12 15V6M16 15v-4" />
    </Icon>
  );
}

export function IconBell(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </Icon>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 21h18M5 21V7l7-4 7 4v14" />
      <path d="M9 11h1M9 15h1M14 11h1M14 15h1" />
    </Icon>
  );
}

export function IconShield(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Icon>
  );
}

export function IconLayers(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </Icon>
  );
}

export function IconGitBranch(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="12" r="2" />
      <path d="M6 8v8M6 12h8a2 2 0 0 0 2-2V8" />
    </Icon>
  );
}

export function IconScroll(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 21h8a2 2 0 0 0 2-2V5H8v14a2 2 0 0 1-2 2h0a2 2 0 0 1 2 2z" />
      <path d="M8 5V3h8v2" />
    </Icon>
  );
}

export function IconUser(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icon>
  );
}

