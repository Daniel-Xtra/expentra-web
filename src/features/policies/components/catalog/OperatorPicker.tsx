import { cn } from '@/lib/utils';
import AppCheckbox from '@/shared/reusable/AppCheckbox';
import type { PolicyCatalogResponse } from '@/types/api';

export function OperatorPicker({
  catalog,
  allowedOperators,
  selected,
  onChange,
}: {
  catalog: PolicyCatalogResponse;
  allowedOperators: string[];
  selected: string[];
  onChange: (operators: string[]) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {allowedOperators.map((operator) => {
        const checked = selected.includes(operator);
        const label =
          catalog.operators.find((item) => item.value === operator)?.label ?? operator;
        const checkboxId = `operator-${operator}`;

        return (
          <label
            key={operator}
            htmlFor={checkboxId}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm',
              checked ? 'border-primary-500/40 bg-primary-500/5' : 'border-black-50',
            )}
          >
            <AppCheckbox
              id={checkboxId}
              checked={checked}
              onCheckedChange={(nextChecked) => {
                onChange(
                  nextChecked
                    ? [...selected, operator]
                    : selected.filter((item) => item !== operator),
                );
              }}
            />
            {label}
          </label>
        );
      })}
    </div>
  );
}
