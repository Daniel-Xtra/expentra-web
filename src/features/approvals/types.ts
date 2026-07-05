export type QueueSummary = Record<string, number | string>;

export type PendingApprovalSummary = {
  currency: string;
  awaitingApprovalCount: number;
  awaitingApprovalAmount: number;
  agingApprovalCount: number;
};
