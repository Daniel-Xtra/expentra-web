export type AuditLogResponse = {
  reference: string;
  action: string;
  resourceType: string;
  resourceReference: string;
  metadata: Record<string, unknown>;
  actor?: {
    reference: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  createdAt: string;
};
