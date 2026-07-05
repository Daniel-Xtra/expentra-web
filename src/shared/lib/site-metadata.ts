export const SITE_NAME = 'Expentra';

export const SITE_DESCRIPTION =
  'Expense management for modern teams. Submit claims, track approvals, and stay on budget.';

export function formatPageTitle(pageTitle?: string): string {
  if (!pageTitle || pageTitle === SITE_NAME) {
    return SITE_NAME;
  }
  return `${pageTitle} · ${SITE_NAME}`;
}
