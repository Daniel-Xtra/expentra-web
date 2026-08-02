import { PlusIcon } from '@phosphor-icons/react';
import type { UseFormReturn } from 'react-hook-form';
import { Controller, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppSelect from '@/shared/reusable/AppSelect';
import type { PolicyCatalogResponse } from '@/types/api';
import type { PolicyConditionFormShape } from '../policy-config';
import { createEmptyCondition, templateConditionsToForm } from '../policy-conditions';
import { PolicyConditionRow } from './PolicyConditionRow';

type PolicyConditionBuilderProps = {
  catalog: PolicyCatalogResponse;
  form: UseFormReturn<PolicyConditionFormShape>;
  showTemplates?: boolean;
};

const MATCH_OPTIONS = [
  { value: 'all', label: 'All conditions must match (AND)' },
  { value: 'any', label: 'Any condition can match (OR)' },
];

export function PolicyConditionBuilder({
  catalog,
  form,
  showTemplates = true,
}: PolicyConditionBuilderProps) {
  const activeTemplates = catalog.templates.filter((template) => template.isActive);
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

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
      {showTemplates && activeTemplates.length > 0 ? (
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
      ) : null}

      <div className="space-y-3">
        <AppFormLabel className="text-black-400">Match mode</AppFormLabel>
        <Controller
          name="match"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <AppSelect
                placeholder="Select match mode"
                options={MATCH_OPTIONS}
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

        {typeof errors.conditions?.message === 'string' ? (
          <p className="text-xs text-error-500">{errors.conditions.message}</p>
        ) : null}

        {fields.map((field, index) => {
          const fieldKey = watch(`conditions.${index}.field`);
          const operator = watch(`conditions.${index}.operator`);

          return (
            <PolicyConditionRow
              key={field.id}
              catalog={catalog}
              control={control}
              index={index}
              fieldKey={fieldKey}
              operator={operator}
              match={match}
              setValue={setValue}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
            />
          );
        })}
      </div>
    </div>
  );
}
