import * as z from "zod";

export const addUserFormSchema = z.object({
  Name: z.string().min(1, "Name is required"),
  Password: z.string().optional(),
  EnableAllFolders: z.boolean().default(true),
  EnabledFolders: z.array(z.string()).optional(),
});

export type AddUserFormValues = z.infer<typeof addUserFormSchema>;
