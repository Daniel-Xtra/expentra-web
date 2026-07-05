export type FinanceQueueSummary = {
  currency: string;
  approvedCount: number;
  approvedAmount: number;
  oldestApprovedAt?: string | null;
};
