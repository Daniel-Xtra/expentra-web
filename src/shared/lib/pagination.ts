import type { PaginationMeta } from '@/types/api';

export const DEFAULT_PAGE_SIZE = 20;

export function getPageRange(page: number, limit: number, total: number) {
  if (total === 0) {
    return { start: 0, end: 0 };
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return { start, end };
}

export function resolvePaginationMeta(
  meta: PaginationMeta | undefined,
  itemCount: number,
  page: number,
  limit: number,
): PaginationMeta {
  if (meta) {
    const total = Number(meta.total ?? itemCount);
    const resolvedLimit = Number(meta.limit ?? limit);
    const resolvedPage = Number(meta.page ?? page);
    const computedTotalPages =
      total === 0 ? 0 : Math.ceil(total / Math.max(resolvedLimit, 1));
    const totalPages =
      meta.totalPages != null && Number(meta.totalPages) > 0
        ? Number(meta.totalPages)
        : computedTotalPages;

    return {
      page: resolvedPage,
      limit: resolvedLimit,
      total,
      totalPages,
      unreadCount: meta.unreadCount,
    };
  }

  return {
    page,
    limit,
    total: itemCount,
    totalPages: itemCount === 0 ? 0 : Math.max(1, Math.ceil(itemCount / limit)),
  };
}

export function shouldShowPagination(meta: PaginationMeta): boolean {
  return meta.total > 0;
}

export function formatTotalLabel(count: number, singular: string, plural?: string) {
  const label = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${label}`;
}
