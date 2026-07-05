import { cn } from '@/lib/utils';
import {
  FieldParamDefinitionsSettings,
  type CatalogFieldFormState,
} from '@/features/policies/components/catalog/CatalogFieldFormParts';
import { OperatorPicker } from '@/features/policies/components/catalog/OperatorPicker';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppSelect from '@/shared/reusable/AppSelect';
import AppTextarea from '@/shared/reusable/AppTextarea';
import { formatLabel } from '@/shared/utils/format';
import type { PolicyCatalogField, PolicyCatalogResponse } from '@/types/api';

type CatalogFieldFormFieldsProps = {
  mode: 'create' | 'edit';
  catalog: PolicyCatalogResponse;
  field: CatalogFieldFormState;
  definition: PolicyCatalogField;
  availableDefinitions?: PolicyCatalogField[];
  onChange: (field: CatalogFieldFormState) => void;
  onSelectDefinition?: (key: string) => void;
};

const readOnlyInputClass = 'bg-neutral-100 text-black-400';

export function CatalogFieldFormFields({
  mode,
  catalog,
  field,
  definition,
  availableDefinitions = [],
  onChange,
  onSelectDefinition,
}: CatalogFieldFormFieldsProps) {
  const idPrefix = mode === 'create' ? 'create-field' : 'field';

  const engineFieldOptions = availableDefinitions.map((item) => ({
    value: item.key,
    label: item.label,
  }));

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-3">
        <AppFormLabel className="text-black-400">Engine field</AppFormLabel>
        {mode === 'create' ? (
          <AppSelect
            placeholder="Select field"
            options={engineFieldOptions}
            value={field.key}
            onChange={(value) => onSelectDefinition?.(value)}
          />
        ) : (
          <AppFormInput
            placeholder=""
            value={field.key}
            readOnly
            disabled
            className={cn(readOnlyInputClass, 'font-mono text-xs')}
          />
        )}
      </div>

      <div className="space-y-3">
        <AppFormLabel className="text-black-400">Value type</AppFormLabel>
        <AppFormInput
          placeholder=""
          value={formatLabel(definition.valueType)}
          readOnly
          disabled
          className={readOnlyInputClass}
        />
      </div>

      <div className="space-y-3">
        <AppFormLabel htmlFor={`${idPrefix}-label`} className="text-black-400">
          Label
        </AppFormLabel>
        <AppFormInput
          id={`${idPrefix}-label`}
          placeholder="Display label"
          value={field.label}
          onChange={(event) => onChange({ ...field, label: event.target.value })}
        />
      </div>

      <div className="space-y-3">
        <AppFormLabel htmlFor={`${idPrefix}-description`} className="text-black-400">
          Description
        </AppFormLabel>
        <AppTextarea
          placeholder="Describe how this field is used in conditions"
          value={field.description}
          onChange={(event) => onChange({ ...field, description: event.target.value })}
          showHint={false}
        />
      </div>

      <div className="space-y-3">
        <AppFormLabel className="text-black-400">Allowed operators</AppFormLabel>
        <OperatorPicker
          catalog={catalog}
          allowedOperators={definition.operators}
          selected={field.operators}
          onChange={(operators) => onChange({ ...field, operators })}
        />
      </div>

      <FieldParamDefinitionsSettings
        paramDefinitions={field.paramDefinitions}
        onChange={(paramDefinitions) => onChange({ ...field, paramDefinitions })}
      />

      <div className="space-y-3">
        <AppFormLabel htmlFor={`${idPrefix}-sort-order`} className="text-black-400">
          Sort order
        </AppFormLabel>
        <AppFormInput
          id={`${idPrefix}-sort-order`}
          placeholder="e.g. 1"
          inputMode="numeric"
          value={field.sortOrder}
          onChange={(event) => onChange({ ...field, sortOrder: event.target.value })}
        />
      </div>

      <div className="space-y-3">
        <AppFormLabel className="text-black-400">Status</AppFormLabel>
        <AppSelect
          placeholder="Select status"
          options={statusOptions}
          value={field.isActive ? 'active' : 'inactive'}
          onChange={(value) => onChange({ ...field, isActive: value === 'active' })}
        />
      </div>
    </div>
  );
}
