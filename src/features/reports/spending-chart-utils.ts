import { formatNgn } from '@/shared/utils/money';
import type { ExpenseCategory } from '@/types/api';

export const CHART_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'TRAVEL',
  'MEALS',
  'SUPPLIES',
  'OTHERS',
];

/** Compact NGN tick labels for spending charts (kobo → ₦ / ₦K / ₦M). */
export function formatNgnAxis(kobo: number): string {
  const naira = kobo / 100;
  if (naira >= 1_000_000) {
    return `₦${(naira / 1_000_000).toFixed(1)}M`;
  }
  if (naira >= 1_000) {
    return `₦${(naira / 1_000).toFixed(0)}K`;
  }
  return formatNgn(kobo);
}

export function normalizeCategoryAmounts(
  amounts?: Partial<Record<ExpenseCategory, number>> | Record<string, number>,
): Partial<Record<ExpenseCategory, number>> {
  if (!amounts) {
    return {};
  }

  const result: Partial<Record<ExpenseCategory, number>> = {};
  for (const [key, value] of Object.entries(amounts)) {
    const category = key.toUpperCase() as ExpenseCategory;
    if (!CHART_EXPENSE_CATEGORIES.includes(category)) {
      continue;
    }
    const amount = Number(value) || 0;
    if (amount > 0) {
      result[category] = (result[category] ?? 0) + amount;
    }
  }
  return result;
}

export function getActiveChartCategories(
  rows: Array<{ categoryAmounts?: Partial<Record<ExpenseCategory, number>> }>,
): ExpenseCategory[] {
  const totals = new Map<ExpenseCategory, number>();
  for (const row of rows) {
    for (const category of CHART_EXPENSE_CATEGORIES) {
      const amount = row.categoryAmounts?.[category] ?? 0;
      if (amount > 0) {
        totals.set(category, (totals.get(category) ?? 0) + amount);
      }
    }
  }
  return CHART_EXPENSE_CATEGORIES.filter((category) => (totals.get(category) ?? 0) > 0);
}
