import { TrashIcon } from '@phosphor-icons/react';
import type { Control, UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import AppCheckbox from '@/shared/reusable/AppCheckbox';
import AppFormInput from '@/shared/reusable/AppFormInput';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppSelect from '@/shared/reusable/AppSelect';
import { formatLabel } from '@/shared/utils/format';
import type { ExpenseCategory, PolicyCatalogResponse } from '@/types/api';
import type { PolicyConditionFormShape } from '../policy-config';
import {
  createEmptyCondition,
  getFieldMeta,
  getOperatorLabel,
} from '../policy-conditions';

const BOOLEAN_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

type PolicyConditionRowProps = {
  catalog: PolicyCatalogResponse;
  control: Control<PolicyConditionFormShape>;
  index: number;
  fieldKey: string;
  operator: string;
  match: PolicyConditionFormShape['match'];
  setValue: UseFormReturn<PolicyConditionFormShape>['setValue'];
  onRemove: () => void;
  canRemove: boolean;
};

export function PolicyConditionRow({
  catalog,
  control,
  index,
  fieldKey,
  operator,
  match,
  setValue,
  onRemove,
  canRemove,
}: PolicyConditionRowProps) {
  const categories = catalog.categories as ExpenseCategory[];
  const meta = getFieldMeta(catalog, fieldKey);

  const fieldOptions = catalog.fields.map((item) => ({
    value: item.key,
    label: item.label,
  }));

  const operatorOptions = (meta?.operators ?? []).map((item) => ({
    value: item,
    label: getOperatorLabel(catalog, item),
  }));

  const categoryOptions = categories.map((category) => ({
    value: category,
    label: formatLabel(category),
  }));

  return (
    <div className="space-y-3 rounded-lg border border-black-50 bg-neutral-100/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-neutral-950">Condition {index + 1}</p>
        {canRemove ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={`Remove condition ${index + 1}`}
            onClick={onRemove}
          >
            <TrashIcon className="size-4" />
          </Button>
        ) : null}
      </div>

      {meta ? <p className="text-xs/[16.8px] text-black-400">{meta.description}</p> : null}

      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-3">
          <AppFormLabel className="text-black-400">Field</AppFormLabel>
          <Controller
            name={`conditions.${index}.field`}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <>
                <AppSelect
                  placeholder="Select field"
                  options={fieldOptions}
                  value={controllerField.value}
                  onChange={(value) => {
                    setValue(`conditions.${index}`, createEmptyCondition(catalog, value));
                  }}
                  error={Boolean(fieldState.error)}
                />
                {fieldState.error ? (
                  <p className="text-xs text-error-500">{fieldState.error.message}</p>
                ) : null}
              </>
            )}
          />
        </div>

        <div className="space-y-3">
          <AppFormLabel className="text-black-400">Operator</AppFormLabel>
          <Controller
            name={`conditions.${index}.operator`}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <>
                <AppSelect
                  placeholder="Select operator"
                  options={operatorOptions}
                  value={controllerField.value}
                  onChange={controllerField.onChange}
                  error={Boolean(fieldState.error)}
                />
                {fieldState.error ? (
                  <p className="text-xs text-error-500">{fieldState.error.message}</p>
                ) : null}
              </>
            )}
          />
        </div>
      </div>

      {meta?.valueType === 'naira' ? (
        <div className="space-y-3">
          <AppFormLabel htmlFor={`condition-amount-${index}`} className="text-black-400">
            Amount (₦)
          </AppFormLabel>
          <FormField
            control={control}
            name={`conditions.${index}.valueNaira`}
            render={({ field: inputField, fieldState }) => (
              <FormItem>
                <AppFormInput
                  id={`condition-amount-${index}`}
                  inputMode="decimal"
                  placeholder="0.00"
                  {...inputField}
                  value={inputField.value ?? ''}
                  aria-invalid={fieldState.invalid ? true : undefined}
                  className={cn(
                    fieldState.error && 'border-error-500! focus-visible:border-error-500!',
                  )}
                />
                <FormMessage className="text-xs text-error-500" />
              </FormItem>
            )}
          />
        </div>
      ) : null}

      {meta?.valueType === 'number' ? (
        <div className="space-y-3">
          <AppFormLabel htmlFor={`condition-number-${index}`} className="text-black-400">
            Value
          </AppFormLabel>
          <FormField
            control={control}
            name={`conditions.${index}.valueNumber`}
            render={({ field: inputField, fieldState }) => (
              <FormItem>
                <AppFormInput
                  id={`condition-number-${index}`}
                  inputMode="numeric"
                  placeholder="0"
                  {...inputField}
                  value={inputField.value ?? ''}
                  aria-invalid={fieldState.invalid ? true : undefined}
                  className={cn(
                    fieldState.error && 'border-error-500! focus-visible:border-error-500!',
                  )}
                />
                <FormMessage className="text-xs text-error-500" />
              </FormItem>
            )}
          />
        </div>
      ) : null}

      {meta?.valueType === 'category' ? (
        operator === 'in' || operator === 'not_in' ? (
          <div className="space-y-3">
            <AppFormLabel className="text-black-400">Categories</AppFormLabel>
            <Controller
              name={`conditions.${index}.valueCategories`}
              control={control}
              render={({ field: controllerField, fieldState }) => (
                <>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {categories.map((category) => {
                      const checked = controllerField.value?.includes(category) ?? false;
                      const checkboxId = `condition-category-${index}-${category}`;
                      return (
                        <label
                          key={category}
                          htmlFor={checkboxId}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm',
                            checked
                              ? 'border-primary-500/40 bg-primary-500/5'
                              : 'border-black-50',
                          )}
                        >
                          <AppCheckbox
                            id={checkboxId}
                            checked={checked}
                            onCheckedChange={(nextChecked) => {
                              const current = controllerField.value ?? [];
                              controllerField.onChange(
                                nextChecked
                                  ? [...current, category]
                                  : current.filter((item) => item !== category),
                              );
                            }}
                          />
                          {formatLabel(category)}
                        </label>
                      );
                    })}
                  </div>
                  {fieldState.error ? (
                    <p className="text-xs text-error-500">{fieldState.error.message}</p>
                  ) : null}
                </>
              )}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <AppFormLabel className="text-black-400">Category</AppFormLabel>
            <Controller
              name={`conditions.${index}.valueCategory`}
              control={control}
              render={({ field: controllerField, fieldState }) => (
                <>
                  <AppSelect
                    placeholder="Select category"
                    options={categoryOptions}
                    value={controllerField.value}
                    onChange={controllerField.onChange}
                    error={Boolean(fieldState.error)}
                  />
                  {fieldState.error ? (
                    <p className="text-xs text-error-500">{fieldState.error.message}</p>
                  ) : null}
                </>
              )}
            />
          </div>
        )
      ) : null}

      {meta?.valueType === 'weekdays' ? (
        <div className="space-y-3">
          <AppFormLabel className="text-black-400">Days</AppFormLabel>
          <Controller
            name={`conditions.${index}.valueWeekdays`}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  {catalog.weekdays.map((day) => {
                    const dayValue = String(day.value);
                    const checked = controllerField.value?.includes(dayValue) ?? false;
                    const multi = operator === 'in' || operator === 'not_in' || match === 'any';
                    const checkboxId = `condition-weekday-${index}-${day.value}`;

                    return (
                      <label
                        key={day.value}
                        htmlFor={checkboxId}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm',
                          checked
                            ? 'border-primary-500/40 bg-primary-500/5'
                            : 'border-black-50',
                        )}
                      >
                        <AppCheckbox
                          id={checkboxId}
                          checked={checked}
                          onCheckedChange={(nextChecked) => {
                            if (multi) {
                              const current = controllerField.value ?? [];
                              controllerField.onChange(
                                nextChecked
                                  ? [...current, dayValue]
                                  : current.filter((item) => item !== dayValue),
                              );
                              return;
                            }
                            controllerField.onChange([dayValue]);
                          }}
                        />
                        {day.label}
                      </label>
                    );
                  })}
                </div>
                {fieldState.error ? (
                  <p className="text-xs text-error-500">{fieldState.error.message}</p>
                ) : null}
              </>
            )}
          />
        </div>
      ) : null}

      {meta?.valueType === 'boolean' ? (
        <div className="space-y-3">
          <AppFormLabel className="text-black-400">Duplicate found</AppFormLabel>
          <Controller
            name={`conditions.${index}.valueBoolean`}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <>
                <AppSelect
                  options={BOOLEAN_OPTIONS}
                  value={controllerField.value}
                  onChange={controllerField.onChange}
                  error={Boolean(fieldState.error)}
                />
                {fieldState.error ? (
                  <p className="text-xs text-error-500">{fieldState.error.message}</p>
                ) : null}
              </>
            )}
          />
        </div>
      ) : null}

      {meta?.paramDefinitions?.map((param) =>
        param.type === 'category' ? (
          <div key={param.key} className="space-y-3">
            <AppFormLabel className="text-black-400">{param.label}</AppFormLabel>
            <Controller
              name={`conditions.${index}.paramCategory`}
              control={control}
              render={({ field: controllerField, fieldState }) => (
                <>
                  <AppSelect
                    placeholder="Select category"
                    options={categoryOptions}
                    value={controllerField.value}
                    onChange={controllerField.onChange}
                    error={Boolean(fieldState.error)}
                  />
                  {fieldState.error ? (
                    <p className="text-xs text-error-500">{fieldState.error.message}</p>
                  ) : null}
                </>
              )}
            />
          </div>
        ) : param.type === 'number' ? (
          <div key={param.key} className="space-y-3">
            <AppFormLabel
              htmlFor={`condition-param-${param.key}-${index}`}
              className="text-black-400"
            >
              {param.label}
            </AppFormLabel>
            <FormField
              control={control}
              name={`conditions.${index}.paramWindowDays`}
              render={({ field: inputField, fieldState }) => (
                <FormItem>
                  <AppFormInput
                    id={`condition-param-${param.key}-${index}`}
                    inputMode="numeric"
                    placeholder="0"
                    {...inputField}
                    value={inputField.value ?? ''}
                    aria-invalid={fieldState.invalid ? true : undefined}
                    className={cn(
                      fieldState.error && 'border-error-500! focus-visible:border-error-500!',
                    )}
                  />
                  <FormMessage className="text-xs text-error-500" />
                </FormItem>
              )}
            />
          </div>
        ) : null,
      )}
    </div>
  );
}
