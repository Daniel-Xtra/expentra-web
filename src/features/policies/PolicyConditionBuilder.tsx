import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { Controller, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/shared/components/FormField';
import { cn } from '@/lib/utils';
import { formatLabel } from '@/shared/utils/format';
import type { ExpenseCategory, PolicyCatalogResponse } from '@/types/api';
import type { PolicyConditionFormShape } from './policy-config';
import {
  createEmptyCondition,
  getFieldMeta,
  getOperatorLabel,
  templateConditionsToForm,
} from './policy-conditions';

type PolicyConditionBuilderProps = {
  catalog: PolicyCatalogResponse;
  control: Control<PolicyConditionFormShape>;
  errors: FieldErrors<PolicyConditionFormShape>;
  watch: UseFormWatch<PolicyConditionFormShape>;
  setValue: UseFormSetValue<PolicyConditionFormShape>;
  register: UseFormRegister<PolicyConditionFormShape>;
  showTemplates?: boolean;
};

export function PolicyConditionBuilder({
  catalog,
  control,
  errors,
  watch,
  setValue,
  register,
  showTemplates = true,
}: PolicyConditionBuilderProps) {
  const categories = catalog.categories as ExpenseCategory[];
  const activeTemplates = catalog.templates.filter((template) => template.isActive);
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'conditions',
  });
  const match = watch('match');

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
          <p className="text-sm font-medium text-foreground">Quick templates</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {activeTemplates.map((template) => (
              <button
                key={template.reference}
                type="button"
                className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                onClick={() => applyTemplate(template.reference)}
              >
                <p className="text-sm font-medium text-foreground">{template.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <FormField label="Match mode" error={errors.match?.message}>
        <Controller
          name="match"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select match mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All conditions must match (AND)</SelectItem>
                <SelectItem value="any">Any condition can match (OR)</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">Conditions</p>
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

        {typeof errors.conditions?.message === 'string' && (
          <p className="text-xs text-destructive">{errors.conditions.message}</p>
        )}

        {fields.map((field, index) => {
          const conditionField = watch(`conditions.${index}.field`);
          const operator = watch(`conditions.${index}.operator`);
          const meta = getFieldMeta(catalog, conditionField);
          const rowError = Array.isArray(errors.conditions)
            ? errors.conditions[index]
            : undefined;

          return (
            <div
              key={field.id}
              className="space-y-3 rounded-lg border border-border/60 bg-muted/10 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">Condition {index + 1}</p>
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
                <p className="text-xs text-muted-foreground">{meta.description}</p>
              )}

              <div className="grid gap-3 grid-cols-1">
                <FormField label="Field" error={rowError?.field?.message}>
                  <Controller
                    name={`conditions.${index}.field`}
                    control={control}
                    render={({ field: controllerField }) => (
                      <Select
                        value={controllerField.value}
                        onValueChange={(value) => {
                          setValue(`conditions.${index}`, createEmptyCondition(catalog, value));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {catalog.fields.map((item) => (
                            <SelectItem key={item.key} value={item.key}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                <FormField label="Operator" error={rowError?.operator?.message}>
                  <Controller
                    name={`conditions.${index}.operator`}
                    control={control}
                    render={({ field: controllerField }) => (
                      <Select value={controllerField.value} onValueChange={controllerField.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {(meta?.operators ?? []).map((item) => (
                            <SelectItem key={item} value={item}>
                              {getOperatorLabel(catalog, item)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
              </div>

              {meta?.valueType === 'naira' && (
                <FormField
                  label="Amount (₦)"
                  htmlFor={`condition-amount-${index}`}
                  error={rowError?.valueNaira?.message}
                >
                  <Input
                    id={`condition-amount-${index}`}
                    inputMode="decimal"
                    {...register(`conditions.${index}.valueNaira`)}
                  />
                </FormField>
              )}

              {meta?.valueType === 'number' && (
                <FormField
                  label="Value"
                  htmlFor={`condition-number-${index}`}
                  error={rowError?.valueNumber?.message}
                >
                  <Input
                    id={`condition-number-${index}`}
                    inputMode="numeric"
                    {...register(`conditions.${index}.valueNumber`)}
                  />
                </FormField>
              )}

              {meta?.valueType === 'category' &&
                (operator === 'in' || operator === 'not_in' ? (
                  <FormField label="Categories" error={rowError?.valueCategories?.message}>
                    <Controller
                      name={`conditions.${index}.valueCategories`}
                      control={control}
                      render={({ field: controllerField }) => (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {categories.map((category) => {
                            const checked = controllerField.value?.includes(category) ?? false;
                            return (
                              <label
                                key={category}
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
                                    const current = controllerField.value ?? [];
                                    controllerField.onChange(
                                      event.target.checked
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
                      )}
                    />
                  </FormField>
                ) : (
                  <FormField label="Category" error={rowError?.valueCategory?.message}>
                    <Controller
                      name={`conditions.${index}.valueCategory`}
                      control={control}
                      render={({ field: controllerField }) => (
                        <Select
                          value={controllerField.value}
                          onValueChange={controllerField.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {formatLabel(category)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                ))}

              {meta?.valueType === 'weekdays' && (
                <FormField label="Days" error={rowError?.valueWeekdays?.message}>
                  <Controller
                    name={`conditions.${index}.valueWeekdays`}
                    control={control}
                    render={({ field: controllerField }) => (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {catalog.weekdays.map((day) => {
                          const dayValue = String(day.value);
                          const checked = controllerField.value?.includes(dayValue) ?? false;
                          const multi =
                            operator === 'in' || operator === 'not_in' || match === 'any';

                          return (
                            <label
                              key={day.value}
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
                                  if (multi) {
                                    const current = controllerField.value ?? [];
                                    controllerField.onChange(
                                      event.target.checked
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
                    )}
                  />
                </FormField>
              )}

              {meta?.valueType === 'boolean' && (
                <FormField label="Duplicate found" error={rowError?.valueBoolean?.message}>
                  <Controller
                    name={`conditions.${index}.valueBoolean`}
                    control={control}
                    render={({ field: controllerField }) => (
                      <Select value={controllerField.value} onValueChange={controllerField.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
              )}

              {meta?.paramDefinitions?.map((param) =>
                param.type === 'category' ? (
                  <FormField
                    key={param.key}
                    label={param.label}
                    error={rowError?.paramCategory?.message}
                  >
                    <Controller
                      name={`conditions.${index}.paramCategory`}
                      control={control}
                      render={({ field: controllerField }) => (
                        <Select
                          value={controllerField.value}
                          onValueChange={controllerField.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {formatLabel(category)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                ) : param.type === 'number' ? (
                  <FormField
                    key={param.key}
                    label={param.label}
                    htmlFor={`condition-param-${param.key}-${index}`}
                    error={rowError?.paramWindowDays?.message}
                  >
                    <Input
                      id={`condition-param-${param.key}-${index}`}
                      inputMode="numeric"
                      {...register(`conditions.${index}.paramWindowDays`)}
                    />
                  </FormField>
                ) : null,
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
