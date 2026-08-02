export type PendingApprovalSummary = {
  currency: string;
  awaitingApprovalCount: number;
  awaitingApprovalAmount: number | string;
  agingApprovalCount: number;
};
