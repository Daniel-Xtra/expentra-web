import { cn } from '@/lib/utils';
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

        return (
          <label
            key={operator}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm',
              checked ? 'border-primary/40 bg-primary/5' : 'border-border/60',
            )}
          >
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={checked}
              onChange={(event) => {
                onChange(
                  event.target.checked
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
