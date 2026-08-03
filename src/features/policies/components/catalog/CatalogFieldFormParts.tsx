import { cn } from '@/lib/utils';
import AppCheckbox from '@/shared/reusable/AppCheckbox';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
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

const readOnlyInputClass = 'bg-neutral-100 text-black-400';

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
    <section className="space-y-3 rounded-lg border border-black-50 bg-neutral-100/50 p-4">
      <div>
        <p className="text-sm font-medium text-neutral-950">Field parameters</p>
        <p className="text-xs/[16.8px] text-black-400">
          Customize labels and requirements for parameters shown in the policy builder.
        </p>
      </div>
      {paramDefinitions.map((param, index) => {
        const checkboxId = `field-param-required-${param.key}`;
        return (
          <div
            key={param.key}
            className="space-y-3 border-t border-black-50 pt-3 first:border-0 first:pt-0"
          >
            <div className="space-y-3">
              <AppFormLabel className="text-black-400">Parameter key</AppFormLabel>
              <AppFormInput
                placeholder=""
                value={param.key}
                readOnly
                disabled
                className={cn(readOnlyInputClass, 'font-mono text-xs')}
              />
            </div>
            <div className="space-y-3">
              <AppFormLabel className="text-black-400">Parameter type</AppFormLabel>
              <AppFormInput
                placeholder=""
                value={formatLabel(param.type)}
                readOnly
                disabled
                className={readOnlyInputClass}
              />
            </div>
            <div className="space-y-3">
              <AppFormLabel htmlFor={`field-param-label-${param.key}`} className="text-black-400">
                Display label
              </AppFormLabel>
              <AppFormInput
                id={`field-param-label-${param.key}`}
                placeholder="Parameter label"
                value={param.label}
                onChange={(event) => {
                  const next = [...paramDefinitions];
                  next[index] = { ...param, label: event.target.value };
                  onChange(next);
                }}
              />
            </div>
            <label
              htmlFor={checkboxId}
              className="flex cursor-pointer items-center gap-3 text-sm text-neutral-950"
            >
              <AppCheckbox
                id={checkboxId}
                checked={param.required ?? false}
                onCheckedChange={(checked) => {
                  const next = [...paramDefinitions];
                  next[index] = { ...param, required: checked };
                  onChange(next);
                }}
              />
              Required when building conditions
            </label>
          </div>
        );
      })}
    </section>
  );
}
