import type {
  Control,
  FieldError,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/shared/components/EmptyState';
import { FormField } from '@/shared/components/FormField';
import type { PolicyCatalogResponse } from '@/types/api';
import type { PolicyConditionFormShape, EditPolicyFormValues, PolicyFormValues } from '../policy-config';
import { PolicyConditionBuilder } from '../PolicyConditionBuilder';

function fieldErrorMessage(error: FieldError | undefined): string | undefined {
  return error?.message;
}

type PolicyFormHookProps =
  | {
      register: UseFormRegister<PolicyFormValues>;
      control: Control<PolicyFormValues>;
      errors: FieldErrors<PolicyFormValues>;
      watch: UseFormWatch<PolicyFormValues>;
      setValue: UseFormSetValue<PolicyFormValues>;
    }
  | {
      register: UseFormRegister<EditPolicyFormValues>;
      control: Control<EditPolicyFormValues>;
      errors: FieldErrors<EditPolicyFormValues>;
      watch: UseFormWatch<EditPolicyFormValues>;
      setValue: UseFormSetValue<EditPolicyFormValues>;
    };

type PolicyFormFieldsProps = PolicyFormHookProps & {
  catalog: PolicyCatalogResponse;
  showTemplates?: boolean;
};

export function PolicyFormFields({
  catalog,
  register: registerProp,
  control: controlProp,
  errors: errorsProp,
  watch: watchProp,
  setValue: setValueProp,
  showTemplates = true,
}: PolicyFormFieldsProps) {
  const register = registerProp as UseFormRegister<PolicyFormValues>;
  const control = controlProp as Control<PolicyFormValues>;
  const errors = errorsProp as FieldErrors<PolicyFormValues>;
  const watch = watchProp as UseFormWatch<PolicyFormValues>;
  const setValue = setValueProp as UseFormSetValue<PolicyFormValues>;
  const hasCatalogFields = catalog.fields.length > 0;

  const conditionControl = control as unknown as Control<PolicyConditionFormShape>;
  const conditionErrors = errors as unknown as FieldErrors<PolicyConditionFormShape>;
  const conditionWatch = watch as unknown as UseFormWatch<PolicyConditionFormShape>;
  const conditionSetValue = setValue as unknown as UseFormSetValue<PolicyConditionFormShape>;
  const conditionRegister = register as unknown as UseFormRegister<PolicyConditionFormShape>;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Policy details</h3>
          <p className="text-xs text-muted-foreground">
            Name the rule and choose how employees experience violations.
          </p>
        </div>

        <FormField label="Policy name" htmlFor="policy-name" error={fieldErrorMessage(errors.name)}>
          <Input
            id="policy-name"
            placeholder="e.g. Receipt required above ₦5,000"
            aria-invalid={errors.name ? true : undefined}
            {...register('name')}
          />
        </FormField>

        <FormField label="Severity" error={fieldErrorMessage(errors.severity)}>
          <Controller
            name="severity"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={errors.severity ? true : undefined}>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WARN">
                    Warning — employee can justify and still submit
                  </SelectItem>
                  <SelectItem value="BLOCK">
                    Block — employee cannot submit until resolved
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label="Employee message (optional)"
          htmlFor="policy-custom-message"
          error={fieldErrorMessage(errors.customMessage)}
        >
          <Textarea
            id="policy-custom-message"
            rows={2}
            placeholder="Explain what the employee should do when this policy is triggered."
            aria-invalid={errors.customMessage ? true : undefined}
            {...register('customMessage')}
          />
        </FormField>
      </section>

      <section className="space-y-4 border-t border-border/50 pt-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Rule conditions</h3>
          <p className="text-xs text-muted-foreground">
            Define when this policy applies. All policies use the same condition engine.
          </p>
        </div>

        {!hasCatalogFields ? (
          <EmptyState
            title="No condition fields configured"
            description="Add condition fields under Rule catalog before creating policy rules."
          />
        ) : (
          <PolicyConditionBuilder
            catalog={catalog}
            control={conditionControl}
            errors={conditionErrors}
            watch={conditionWatch}
            setValue={conditionSetValue}
            register={conditionRegister}
            showTemplates={showTemplates}
          />
        )}
      </section>
    </div>
  );
}
