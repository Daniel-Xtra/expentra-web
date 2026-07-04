import type { Icon } from '@phosphor-icons/react';
import {
  ArrowUpIcon,
  BellIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ClipboardTextIcon,
  EnvelopeSimpleIcon,
  ReceiptIcon,
  UserCircleIcon,
  WalletIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { formatLabel } from '@/shared/utils/format';
import { formatNgn } from '@/shared/utils/money';
import type { NotificationResponse } from '@/types/api';

export type NotificationDisplay = {
  title: string;
  body: string;
  category: string;
  href?: string;
  hrefLabel?: string;
  icon: Icon;
  iconClassName: string;
};

const TYPE_DEFAULTS: Record<string, Pick<NotificationDisplay, 'category' | 'icon' | 'iconClassName'>> = {
  EXPENSE_SUBMITTED: {
    category: 'Expense',
    icon: ClipboardTextIcon,
    iconClassName: 'bg-blue-500/10 text-blue-600',
  },
  EXPENSE_APPROVED: {
    category: 'Expense',
    icon: CheckCircleIcon,
    iconClassName: 'bg-emerald-500/10 text-emerald-600',
  },
  EXPENSE_REJECTED: {
    category: 'Expense',
    icon: XCircleIcon,
    iconClassName: 'bg-destructive/10 text-destructive',
  },
  EXPENSE_PENDING_FINANCE: {
    category: 'Expense',
    icon: ReceiptIcon,
    iconClassName: 'bg-amber-500/10 text-amber-600',
  },
  EXPENSE_ESCALATED: {
    category: 'Expense',
    icon: ArrowUpIcon,
    iconClassName: 'bg-orange-500/10 text-orange-600',
  },
  EXPENSE_REIMBURSED: {
    category: 'Expense',
    icon: CheckCircleIcon,
    iconClassName: 'bg-emerald-500/10 text-emerald-600',
  },
  BUDGET_OVERSPEND: {
    category: 'Budget',
    icon: WalletIcon,
    iconClassName: 'bg-destructive/10 text-destructive',
  },
  BUDGET_THRESHOLD: {
    category: 'Budget',
    icon: ChartPieIcon,
    iconClassName: 'bg-amber-500/10 text-amber-600',
  },
  EMAIL_VERIFICATION: {
    category: 'Account',
    icon: EnvelopeSimpleIcon,
    iconClassName: 'bg-primary/10 text-primary',
  },
  PASSWORD_RESET_REQUEST: {
    category: 'Account',
    icon: EnvelopeSimpleIcon,
    iconClassName: 'bg-primary/10 text-primary',
  },
  USER_DEPARTMENT_CHANGED: {
    category: 'Account',
    icon: UserCircleIcon,
    iconClassName: 'bg-primary/10 text-primary',
  },
  DEPARTMENT_MANAGER_CHANGED: {
    category: 'Department',
    icon: UserCircleIcon,
    iconClassName: 'bg-blue-500/10 text-blue-600',
  },
};

const FALLBACK_DISPLAY: Pick<NotificationDisplay, 'category' | 'icon' | 'iconClassName'> = {
  category: 'Update',
  icon: BellIcon,
  iconClassName: 'bg-muted text-muted-foreground',
};

function readString(payload: Record<string, unknown>, key: string): string | undefined {
  const value = payload[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function resolveExpenseLink(payload: Record<string, unknown>) {
  const expenseReference = readString(payload, 'expenseReference');
  if (!expenseReference) {
    return undefined;
  }

  return {
    href: `/expenses/${expenseReference}`,
    hrefLabel: 'View expense',
  };
}

function resolveBudgetLink(notificationType: string) {
  if (!notificationType.startsWith('BUDGET_')) {
    return undefined;
  }

  return {
    href: '/admin/budgets',
    hrefLabel: 'View budgets',
  };
}

function buildFallbackBody(
  notificationType: string,
  payload: Record<string, unknown>,
): string {
  const expenseTitle = readString(payload, 'expenseTitle');
  const amount = typeof payload.amount === 'number' ? payload.amount : undefined;
  const currency = readString(payload, 'currency');

  if (expenseTitle && amount !== undefined) {
    const amountLabel = currency === 'NGN' ? formatNgn(amount) : `${currency ?? ''} ${(amount / 100).toFixed(2)}`.trim();
    return `${expenseTitle} · ${amountLabel}`;
  }

  if (expenseTitle) {
    return expenseTitle;
  }

  return `You have a new ${formatLabel(notificationType).toLowerCase()} notification.`;
}

export function getNotificationDisplay(notification: NotificationResponse): NotificationDisplay {
  const payload = notification.payload ?? {};
  const defaults = TYPE_DEFAULTS[notification.type] ?? FALLBACK_DISPLAY;
  const title =
    readString(payload, 'title') ?? formatLabel(notification.type);
  const body =
    readString(payload, 'body') ?? buildFallbackBody(notification.type, payload);
  const link =
    resolveExpenseLink(payload) ?? resolveBudgetLink(notification.type);

  return {
    title,
    body,
    category: defaults.category,
    icon: defaults.icon,
    iconClassName: defaults.iconClassName,
    ...link,
  };
}
