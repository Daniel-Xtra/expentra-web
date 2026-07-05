import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import type { UseFormReturn } from 'react-hook-form';
import { Controller, useFieldArray } from 'react-hook-form';
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
  templateConditionsToForm,
} from '../policy-conditions';

type PolicyConditionBuilderProps<T extends PolicyConditionFormShape = PolicyConditionFormShape> = {
  catalog: PolicyCatalogResponse;
  form: UseFormReturn<T>;
  showTemplates?: boolean;
};

export function PolicyConditionBuilder<T extends PolicyConditionFormShape>({
  catalog,
  form,
  showTemplates = true,
}: PolicyConditionBuilderProps<T>) {
  const categories = catalog.categories as ExpenseCategory[];
  const activeTemplates = catalog.templates.filter((template) => template.isActive);
  const { control, watch, setValue, formState: { errors } } = form;
  const conditionErrors = errors as unknown as import('react-hook-form').FieldErrors<PolicyConditionFormShape>;

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'conditions',
  });
  const match = watch('match');

  const matchOptions = [
    { value: 'all', label: 'All conditions must match (AND)' },
    { value: 'any', label: 'Any condition can match (OR)' },
  ];

  const booleanOptions = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
  ];

  const applyTemplate = (reference: string) => {
    const template = catalog.templates.find((item) => item.reference === reference);
    if (!template) return;
    const parsed = templateConditionsToForm(catalog, template);
    setValue('match', parsed.match);
    replace(parsed.conditions);
  };

  return (
    <div className="space-y-4">
      {showTemplates && activeTemplates.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-950">Quick templates</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {activeTemplates.map((template) => (
              <button
                key={template.reference}
                type="button"
                className="rounded-lg border border-black-50 bg-neutral-100 px-3 py-2 text-left transition-colors hover:border-primary-500/40 hover:bg-primary-500/5"
                onClick={() => applyTemplate(template.reference)}
              >
                <p className="text-sm font-medium text-neutral-950">{template.name}</p>
                <p className="mt-1 text-xs/[16.8px] text-black-400">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <AppFormLabel className="text-black-400">Match mode</AppFormLabel>
        <Controller
          name="match"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <AppSelect
                placeholder="Select match mode"
                options={matchOptions}
                value={field.value}
                onChange={field.onChange}
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
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-neutral-950">Conditions</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append(createEmptyCondition(catalog))}
          >
            <PlusIcon className="size-4" />
            Add condition
          </Button>
        </div>

        {typeof conditionErrors.conditions?.message === 'string' && (
          <p className="text-xs text-error-500">{conditionErrors.conditions.message}</p>
        )}

        {fields.map((field, index) => {
          const conditionField = watch(`conditions.${index}.field`);
          const operator = watch(`conditions.${index}.operator`);
          const meta = getFieldMeta(catalog, conditionField);

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
            <div
              key={field.id}
              className="space-y-3 rounded-lg border border-black-50 bg-neutral-100/50 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-neutral-950">Condition {index + 1}</p>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Remove condition ${index + 1}`}
                    onClick={() => remove(index)}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                )}
              </div>

              {meta && (
                <p className="text-xs/[16.8px] text-black-400">{meta.description}</p>
              )}

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

              {meta?.valueType === 'naira' && (
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
                          {...inputField}
                          value={inputField.value ?? ''}
                          aria-invalid={fieldState.invalid ? true : undefined}
                          className={cn(
                            fieldState.error &&
                              'border-error-500! focus-visible:border-error-500!',
                          )}
                        />
                        <FormMessage className="text-xs text-error-500" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {meta?.valueType === 'number' && (
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
                          {...inputField}
                          value={inputField.value ?? ''}
                          aria-invalid={fieldState.invalid ? true : undefined}
                          className={cn(
                            fieldState.error &&
                              'border-error-500! focus-visible:border-error-500!',
                          )}
                        />
                        <FormMessage className="text-xs text-error-500" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {meta?.valueType === 'category' &&
                (operator === 'in' || operator === 'not_in' ? (
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
                ))}

              {meta?.valueType === 'weekdays' && (
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
                            const multi =
                              operator === 'in' || operator === 'not_in' || match === 'any';
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
              )}

              {meta?.valueType === 'boolean' && (
                <div className="space-y-3">
                  <AppFormLabel className="text-black-400">Duplicate found</AppFormLabel>
                  <Controller
                    name={`conditions.${index}.valueBoolean`}
                    control={control}
                    render={({ field: controllerField, fieldState }) => (
                      <>
                        <AppSelect
                          options={booleanOptions}
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
              )}

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
                            {...inputField}
                            value={inputField.value ?? ''}
                            aria-invalid={fieldState.invalid ? true : undefined}
                            className={cn(
                              fieldState.error &&
                                'border-error-500! focus-visible:border-error-500!',
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
        })}
      </div>
    </div>
  );
}
