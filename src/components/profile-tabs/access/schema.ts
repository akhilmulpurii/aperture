import * as z from "zod";

export const accessFormSchema = z.object({
  EnableAllFolders: z.boolean().default(true),
  EnabledFolders: z.array(z.string()).optional(),
  EnableAllDevices: z.boolean().default(true),
  EnabledDevices: z.array(z.string()).optional(),
});

export type AccessFormValues = z.infer<typeof accessFormSchema>;
