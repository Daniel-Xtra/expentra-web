import { api } from '@/shared/api/client';
import { downloadBlob } from '@/shared/utils/download';
import type { AccessReviewRow } from '@/features/access-review/types';
import type { ApiResponse } from '@/types/api';

export async function fetchAccessReview(): Promise<AccessReviewRow[]> {
  const { data } = await api.get<ApiResponse<AccessReviewRow[]>>(
    '/authorization/access-review',
  );
  return data.data ?? [];
}

export async function downloadAccessReviewExcel(): Promise<void> {
  const { data } = await api.get<Blob>('/authorization/access-review/export', {
    responseType: 'blob',
  });
  downloadBlob(data, 'access-review.xlsx');
}
