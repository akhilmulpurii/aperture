import * as z from "zod";

export const passwordFormSchema = z.object({
  CurrentPassword: z.string().optional(),
  NewPassword: z.string().min(1, "Password is required"),
  ConfirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.NewPassword === data.ConfirmPassword, {
  message: "Passwords do not match",
  path: ["ConfirmPassword"],
});

export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
