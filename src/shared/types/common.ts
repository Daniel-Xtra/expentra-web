export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  code?: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Array<{ field: string; message: string }>;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta?: PaginationMeta;
};
