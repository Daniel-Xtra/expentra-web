import { PasswordCriteriaChecklist } from '@/shared/components/PasswordCriteriaChecklist';

type AuthPasswordCriteriaProps = {
  value: string;
};

export function AuthPasswordCriteria({ value }: AuthPasswordCriteriaProps) {
  return <PasswordCriteriaChecklist value={value} />;
}
