import type { ExpenseCategory } from '@/types/api';

export type ChartSegment = {
  key: string;
  label: string;
  value: number;
  color: string;
  detail?: string;
};

export const STATUS_CHART_COLORS = {
  DRAFT: '#94a3b8',
  SUBMITTED: '#3b82f6',
  UNDER_REVIEW: '#f59e0b',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  REIMBURSED: '#6366f1',
} as const;

export const CATEGORY_CHART_COLORS: Record<ExpenseCategory, string> = {
  TRAVEL: '#8b5cf6',
  MEALS: '#f97316',
  SUPPLIES: '#0ea5e9',
  OTHERS: '#64748b',
};
