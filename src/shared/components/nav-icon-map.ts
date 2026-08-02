import type { Icon } from '@phosphor-icons/react';
import {
  BellIcon,
  BookOpenTextIcon,
  BriefcaseIcon,
  BuildingsIcon,
  ChartBarIcon,
  ChecksIcon,
  ClockCounterClockwiseIcon,
  FileIcon,
  FilePlusIcon,
  FlowArrowIcon,
  GitBranchIcon,
  IdentificationBadgeIcon,
  PiggyBankIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  SquaresFourIcon,
  UserCircleIcon,
  UsersThreeIcon,
  WalletIcon,
} from '@phosphor-icons/react';

/** Fallback when a route has no mapped icon. */
export const navIconFallback: Icon = FileIcon;

export const navIconMap: Record<string, Icon> = {
  '/dashboard': SquaresFourIcon,
  '/expenses': ReceiptIcon,
  '/expenses/new': FilePlusIcon,
  '/approvals': ChecksIcon,
  '/department': BriefcaseIcon,
  '/payouts': WalletIcon,
  '/admin/reports': ChartBarIcon,
  '/notifications': BellIcon,
  '/admin/users': UsersThreeIcon,
  '/admin/departments': BuildingsIcon,
  '/admin/budgets': PiggyBankIcon,
  '/admin/roles': IdentificationBadgeIcon,
  '/admin/approval-levels': FlowArrowIcon,
  '/admin/delegations': GitBranchIcon,
  '/admin/policies': BookOpenTextIcon,
  '/admin/audit-logs': ClockCounterClockwiseIcon,
  '/admin/access-review': ShieldCheckIcon,
  '/profile': UserCircleIcon,
};
