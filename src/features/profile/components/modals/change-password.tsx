import { useState } from "react";
import { LockSimpleIcon } from "@phosphor-icons/react";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import AppFormLabel from "@/shared/reusable/AppFormLabel";
import AppFormInput from "@/shared/reusable/AppFormInput";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { AppModal } from "@/shared/reusable/AppModal";
import { changePassword } from "@/features/users/api";
import { handleMutationError } from "@/shared/api/form-errors";
import { toastSuccess } from "@/shared/lib/toast";
import { cn } from "@/lib/utils";
import { PasswordCriteriaChecklist } from "@/shared/components/PasswordCriteriaChecklist";
import { changePasswordSchema, type ChangePasswordFormValues } from "../../schemas";

const ChangePassword = ({ closeModal }: { closeModal: () => void }) => {
  const [visible, setVisible] = useState({
    currentPassword: false,
    newPassword: false,
  });
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const currentPassword =
    useWatch({ control: form.control, name: "currentPassword" }) ?? "";
  const newPassword =
    useWatch({ control: form.control, name: "newPassword" }) ?? "";

  const isDifferentFromCurrent = !(
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    currentPassword === newPassword
  );

  const canCheckDifferent =
    currentPassword.length > 0 && newPassword.length > 0;

  const changePasswordMutation = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      changePassword(values.currentPassword, values.newPassword),
    onSuccess: (message) => {
      toastSuccess(message);
      form.reset();
      closeModal();
    },
    onError: (err) => {
      handleMutationError(err, {
        setError: form.setError,
        fallback: "Failed to change password",
      });
    },
  });

  const handleSubmitNewPassword = async (values: ChangePasswordFormValues) => {
    await changePasswordMutation.mutateAsync(values);
  };

  return (
    <div>
      <AppModal
        title={"Change your password"}
        description={
          <>
            <span className="text-xs/[16.8px] font-normal font-sans text-neutral-600">
              Please enter your current password and new password
            </span>
          </>
        }
        primaryFn={() => {}}
        content={
          <div className="space-y-6 font-sans">
            <Form {...form}>
              <form className="space-y-6 font-sans">
                <div className="space-y-3">
                  <AppFormLabel className=" text-black-400">
                    Current password
                  </AppFormLabel>

                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <AppFormInput
                          leftIcon={
                            <LockSimpleIcon className="size-4" weight="fill" />
                          }
                          rightIcon={
                            <span>
                              {visible.currentPassword ? "Hide" : "Show"}
                            </span>
                          }
                          placeholder="•  •  •  •  •  •  •  •  •"
                          type={visible.currentPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className={cn(
                            "w-full ps-8! pe-12!",
                            fieldState.error &&
                              "border-error-500! focus-visible:border-error-500!",
                          )}
                          showLeftIcon
                          showRightIcon
                          togglePassword={() =>
                            setVisible({
                              ...visible,
                              currentPassword: !visible.currentPassword,
                            })
                          }
                          {...field}
                          aria-invalid={fieldState.invalid ? true : undefined}
                        />
                        <FormMessage className="text-xs text-error-500" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-3">
                  <AppFormLabel className=" text-black-400">
                    New password
                  </AppFormLabel>

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <AppFormInput
                          leftIcon={
                            <LockSimpleIcon className="size-4" weight="fill" />
                          }
                          rightIcon={
                            <span>{visible.newPassword ? "Hide" : "Show"}</span>
                          }
                          placeholder="•  •  •  •  •  •  •  •  •"
                          type={visible.newPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className={cn(
                            "w-full ps-8! pe-12!",
                            fieldState.error &&
                              "border-error-500! focus-visible:border-error-500!",
                          )}
                          showLeftIcon
                          showRightIcon
                          togglePassword={() =>
                            setVisible({
                              ...visible,
                              newPassword: !visible.newPassword,
                            })
                          }
                          {...field}
                          aria-invalid={fieldState.invalid ? true : undefined}
                        />
                        <FormMessage className="text-xs text-error-500" />
                      </FormItem>
                    )}
                  />
                </div>
                <PasswordCriteriaChecklist
                  value={newPassword}
                  extraCriteria={[
                    {
                      key: 'different-from-current',
                      label: 'Different from current password',
                      isMet: isDifferentFromCurrent,
                      active: canCheckDifferent,
                    },
                  ]}
                />
              </form>
            </Form>
          </div>
        }
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              className="p-5 rounded-sm font-sans h-14 w-full font-semibold text-sm/[19.6px] text-neutral-950 hover:bg-transparent"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="p-5 rounded-sm font-sans h-14 w-full font-semibold text-sm/[19.6px]"
              disabled={changePasswordMutation.isPending}
              onClick={form.handleSubmit(handleSubmitNewPassword)}
            >
              {changePasswordMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </>
        }
      />
    </div>
  );
};

export default ChangePassword;
