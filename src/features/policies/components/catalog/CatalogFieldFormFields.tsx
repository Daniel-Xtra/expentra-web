import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  FieldParamDefinitionsSettings,
  type CatalogFieldFormState,
} from '@/features/policies/components/catalog/CatalogFieldFormParts';
import { OperatorPicker } from '@/features/policies/components/catalog/OperatorPicker';
import { FormField } from '@/shared/components/FormField';
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

  return (
    <div className="space-y-4">
      <FormField label="Engine field">
        {mode === 'create' ? (
          <Select value={field.key} onValueChange={(value) => onSelectDefinition?.(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {availableDefinitions.map((item) => (
                <SelectItem key={item.key} value={item.key}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input value={field.key} readOnly disabled className="bg-muted/40 font-mono text-xs" />
        )}
      </FormField>

      <FormField label="Value type">
        <Input value={formatLabel(definition.valueType)} readOnly disabled className="bg-muted/40" />
      </FormField>

      <FormField label="Label" htmlFor={`${idPrefix}-label`}>
        <Input
          id={`${idPrefix}-label`}
          value={field.label}
          onChange={(event) => onChange({ ...field, label: event.target.value })}
        />
      </FormField>

      <FormField label="Description" htmlFor={`${idPrefix}-description`}>
        <Textarea
          id={`${idPrefix}-description`}
          rows={3}
          value={field.description}
          onChange={(event) => onChange({ ...field, description: event.target.value })}
        />
      </FormField>

      <FormField label="Allowed operators">
        <OperatorPicker
          catalog={catalog}
          allowedOperators={definition.operators}
          selected={field.operators}
          onChange={(operators) => onChange({ ...field, operators })}
        />
      </FormField>

      <FieldParamDefinitionsSettings
        paramDefinitions={field.paramDefinitions}
        onChange={(paramDefinitions) => onChange({ ...field, paramDefinitions })}
      />

      <FormField label="Sort order" htmlFor={`${idPrefix}-sort-order`}>
        <Input
          id={`${idPrefix}-sort-order`}
          inputMode="numeric"
          value={field.sortOrder}
          onChange={(event) => onChange({ ...field, sortOrder: event.target.value })}
        />
      </FormField>

      <FormField label="Status">
        <Select
          value={field.isActive ? 'active' : 'inactive'}
          onValueChange={(value) => onChange({ ...field, isActive: value === 'active' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
}
