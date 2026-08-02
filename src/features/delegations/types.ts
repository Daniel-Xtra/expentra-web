export type DelegationPerson = {
  reference: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};

export type DelegationResponse = {
  reference: string;
  delegatorReference: string;
  delegateReference: string;
  delegator: DelegationPerson;
  delegate: DelegationPerson;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
};
