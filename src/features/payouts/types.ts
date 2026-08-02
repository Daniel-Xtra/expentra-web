export type PayoutsAgingBucket = {
  key: '0_7' | '8_14' | '15_30' | '30_plus';
  label: string;
  count: number;
  totalAmount: number;
};

export type PayoutsQueueSummary = {
  currency: string;
  approvedCount: number;
  approvedAmount: number;
  oldestApprovedAt?: string | null;
  agingBuckets?: PayoutsAgingBucket[];
};
