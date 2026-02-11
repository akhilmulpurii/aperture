"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserDto } from "@jellyfin/sdk/lib/generated-client/models";
import { useState } from "react";
import { changeUserPassword } from "../../../actions";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { toast } from "sonner";
import { passwordFormSchema, PasswordFormValues } from "./schema";

export default function PasswordTab({ user }: { user?: UserDto }) {
  const [isResetting, setIsResetting] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      CurrentPassword: "",
      NewPassword: "",
      ConfirmPassword: "",
    },
  });

  async function onSubmit(data: PasswordFormValues) {
    if (!user?.Id) return;

    try {
      await changeUserPassword(
        data.CurrentPassword || undefined,
        data.NewPassword,
        user.Id,
      );
      toast.success("Password updated successfully");
      form.reset();
    } catch (error: any) {
      console.error("Failed to update password:", error);
      const errorMessage =
        error?.response?.data || error.message || "Failed to update password";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to update password",
      );
    }
  }

  async function onResetPassword() {
    if (!user?.Id) return;
    setIsResetting(true);
    try {
      await changeUserPassword(undefined, undefined, user.Id, true);
      toast.success("Password reset successfully");
    } catch (error: any) {
      console.error("Failed to reset password:", error);
      const errorMessage =
        error?.response?.data || error.message || "Failed to reset password";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to reset password",
      );
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full max-w-2xl"
      >
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">
            Change Password
          </h3>

          <FormField
            control={form.control}
            name="CurrentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="NewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ConfirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onResetPassword}
            disabled={isResetting}
          >
            {isResetting ? "Resetting..." : "Reset Password"}
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
