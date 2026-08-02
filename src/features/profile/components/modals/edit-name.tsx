import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import AppFormInput from '@/shared/reusable/AppFormInput';
import { AppFormDialog } from '@/shared/reusable/AppFormDialog';
import type { UseFormReturn } from 'react-hook-form';
import type { ProfileFormValues } from '@/features/profile/hooks/use-profile';

type EditNameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ProfileFormValues>;
  loading: boolean;
  onSubmit: (values: ProfileFormValues) => void | Promise<void>;
};

export function EditNameDialog({
  open,
  onOpenChange,
  form,
  loading,
  onSubmit,
}: EditNameDialogProps) {
  return (
    <AppFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit name"
      description="Update how your name appears across Expentra."
      submitLabel="Save changes"
      loading={loading}
      onSubmit={() => void form.handleSubmit(onSubmit)()}
    >
      <Form {...form}>
        <form
          className="space-y-5 font-sans"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <AppFormLabel>First name</AppFormLabel>
                <AppFormInput
                  {...field}
                  placeholder="First name"
                  autoComplete="given-name"
                  disabled={loading}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <AppFormLabel>Last name</AppFormLabel>
                <AppFormInput
                  {...field}
                  placeholder="Last name"
                  autoComplete="family-name"
                  disabled={loading}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </AppFormDialog>
  );
}
