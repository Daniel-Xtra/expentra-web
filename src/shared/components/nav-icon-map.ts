import type { ReactElement, SVGProps } from 'react';
import {
  IconBell,
  IconBuilding,
  IconChart,
  IconClipboard,
  IconDashboard,
  IconFile,
  IconGitBranch,
  IconLayers,
  IconReceipt,
  IconScroll,
  IconShield,
  IconUser,
  IconUsers,
  IconWallet,
} from './icons';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export const navIconMap: Record<string, (props: IconProps) => ReactElement> = {
  '/dashboard': IconDashboard,
  '/expenses': IconReceipt,
  '/expenses/new': IconFile,
  '/approvals': IconClipboard,
  '/department-overview': IconBuilding,
  '/finance': IconWallet,
  '/admin/reports': IconChart,
  '/notifications': IconBell,
  '/admin/users': IconUsers,
  '/admin/departments': IconBuilding,
  '/admin/budgets': IconWallet,
  '/admin/roles': IconShield,
  '/admin/approval-levels': IconLayers,
  '/admin/delegations': IconGitBranch,
  '/admin/policies': IconScroll,
  '/admin/audit-logs': IconScroll,
  '/admin/access-review': IconShield,
  '/profile': IconUser,
};
