import { Controller } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormDialog } from '@/shared/components/FormDialog';
import { FormField } from '@/shared/components/FormField';
import { PolicyFormFields } from '@/features/policies/components/PolicyFormFields';
import type { EditPolicyFormValues, PolicyFormValues } from '@/features/policies/policy-config';
import type { PolicyCatalogResponse } from '@/types/api';

type CreatePolicyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<PolicyFormValues>;
  catalog: PolicyCatalogResponse;
  loading: boolean;
  onSubmit: () => void;
};

export function CreatePolicyDialog({
  open,
  onOpenChange,
  form,
  catalog,
  loading,
  onSubmit,
}: CreatePolicyDialogProps) {
  return (
    <FormDialog
      title="Add policy"
      description="Define when the rule applies and how employees experience violations."
      open={open}
      onOpenChange={onOpenChange}
      submitLabel="Create policy"
      loading={loading}
      className="max-w-3xl"
      contentClassName="max-h-[70vh] overflow-y-auto"
      onSubmit={onSubmit}
    >
      <PolicyFormFields
        catalog={catalog}
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
        watch={form.watch}
        setValue={form.setValue}
      />
    </FormDialog>
  );
}

type EditPolicyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<EditPolicyFormValues>;
  catalog: PolicyCatalogResponse;
  loading: boolean;
  onSubmit: () => void;
};

export function EditPolicyDialog({
  open,
  onOpenChange,
  form,
  catalog,
  loading,
  onSubmit,
}: EditPolicyDialogProps) {
  return (
    <FormDialog
      title="Edit policy"
      description="Update rule conditions, severity, or employee messaging."
      open={open}
      onOpenChange={onOpenChange}
      submitLabel="Save changes"
      loading={loading}
      className="max-w-3xl"
      contentClassName="max-h-[70vh] overflow-y-auto"
      onSubmit={onSubmit}
    >
      <div className="space-y-6">
        <PolicyFormFields
          catalog={catalog}
          register={form.register}
          control={form.control}
          errors={form.formState.errors}
          watch={form.watch}
          setValue={form.setValue}
          showTemplates={false}
        />
        <FormField label="Status" error={form.formState.errors.isActive?.message}>
          <Controller
            name="isActive"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>
    </FormDialog>
  );
}
