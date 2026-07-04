import { Input } from '@/components/ui/input';
import { FormField } from '@/shared/components/FormField';
import { formatLabel } from '@/shared/utils/format';
import type { PolicyCatalogField } from '@/types/api';

export type CatalogFieldFormState = {
  key: string;
  label: string;
  description: string;
  operators: string[];
  paramDefinitions: PolicyCatalogField['paramDefinitions'];
  sortOrder: string;
  isActive: boolean;
};

export function cloneParamDefinitions(
  paramDefinitions: PolicyCatalogField['paramDefinitions'] = [],
): PolicyCatalogField['paramDefinitions'] {
  return paramDefinitions.map((param) => ({ ...param }));
}

export function FieldParamDefinitionsSettings({
  paramDefinitions,
  onChange,
}: {
  paramDefinitions: PolicyCatalogField['paramDefinitions'];
  onChange: (paramDefinitions: PolicyCatalogField['paramDefinitions']) => void;
}) {
  if (paramDefinitions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-lg border border-border/60 bg-muted/10 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Field parameters</p>
        <p className="text-xs text-muted-foreground">
          Customize labels and requirements for parameters shown in the policy builder.
        </p>
      </div>
      {paramDefinitions.map((param, index) => (
        <div
          key={param.key}
          className="space-y-3 border-t border-border/40 pt-3 first:border-0 first:pt-0"
        >
          <FormField label="Parameter key">
            <Input value={param.key} readOnly disabled className="bg-muted/40 font-mono text-xs" />
          </FormField>
          <FormField label="Parameter type">
            <Input
              value={formatLabel(param.type)}
              readOnly
              disabled
              className="bg-muted/40"
            />
          </FormField>
          <FormField label="Display label" htmlFor={`field-param-label-${param.key}`}>
            <Input
              id={`field-param-label-${param.key}`}
              value={param.label}
              onChange={(event) => {
                const next = [...paramDefinitions];
                next[index] = { ...param, label: event.target.value };
                onChange(next);
              }}
            />
          </FormField>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={param.required ?? false}
              onChange={(event) => {
                const next = [...paramDefinitions];
                next[index] = { ...param, required: event.target.checked };
                onChange(next);
              }}
            />
            Required when building conditions
          </label>
        </div>
      ))}
    </section>
  );
}
