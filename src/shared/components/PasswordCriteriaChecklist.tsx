import { ShieldCheckIcon, XCircleIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import {
  hasPasswordNumber,
  hasPasswordSpecialChar,
  hasPasswordUppercase,
  PASSWORD_MIN_LENGTH,
} from '@/shared/lib/password-policy';

function criterionClass(isMet: boolean, active: boolean) {
  return cn(
    'list-none flex items-center gap-1.5 font-normal text-[11px]/[15.4px]',
    active ? (isMet ? 'text-success-800' : 'text-error-500') : 'text-black-300',
  );
}

function CriterionIcon({ isMet, active }: { isMet: boolean; active: boolean }) {
  if (!active) {
    return <ShieldCheckIcon className="size-4 shrink-0 text-black-300" />;
  }

  return isMet ? (
    <ShieldCheckIcon className="size-4 shrink-0 text-success-800" />
  ) : (
    <XCircleIcon className="size-4 shrink-0 text-error-500" />
  );
}

type CriterionItemProps = {
  label: string;
  isMet: boolean;
  active: boolean;
};

function CriterionItem({ label, isMet, active }: CriterionItemProps) {
  return (
    <p className={criterionClass(isMet, active)}>
      <CriterionIcon isMet={isMet} active={active} />
      <span>{label}</span>
    </p>
  );
}

function CriteriaRow({ items }: { items: CriterionItemProps[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <CriterionItem key={item.label} {...item} />
      ))}
    </div>
  );
}

export type PasswordCriteriaExtraItem = {
  key: string;
  label: string;
  isMet: boolean;
  active: boolean;
};

type PasswordCriteriaChecklistProps = {
  value: string;
  extraCriteria?: PasswordCriteriaExtraItem[];
};

export function PasswordCriteriaChecklist({
  value,
  extraCriteria = [],
}: PasswordCriteriaChecklistProps) {
  const hasStarted = value.length > 0;
  const hasExtraCriteria = extraCriteria.length > 0;

  const rules = {
    minLength: value.length >= PASSWORD_MIN_LENGTH,
    hasNumber: hasPasswordNumber(value),
    hasSpecial: hasPasswordSpecialChar(value),
    hasUppercase: hasPasswordUppercase(value),
  };

  const baseCriteria = {
    minLength: { label: '8 character', isMet: rules.minLength, active: hasStarted },
    hasNumber: { label: 'Numbers', isMet: rules.hasNumber, active: hasStarted },
    hasUppercase: { label: 'One Uppercase', isMet: rules.hasUppercase, active: hasStarted },
    hasSpecial: {
      label: 'One special character',
      isMet: rules.hasSpecial,
      active: hasStarted,
    },
  };

  const extraItems = extraCriteria.map((criterion) => ({
    label: criterion.label,
    isMet: criterion.isMet,
    active: criterion.active,
  }));

  const rows = hasExtraCriteria
    ? [
        [baseCriteria.minLength, baseCriteria.hasNumber, baseCriteria.hasUppercase],
        [baseCriteria.hasSpecial, ...extraItems],
      ]
    : [
        [baseCriteria.minLength, baseCriteria.hasNumber],
        [baseCriteria.hasUppercase, baseCriteria.hasSpecial],
      ];

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <CriteriaRow key={index} items={row} />
      ))}
    </div>
  );
}
