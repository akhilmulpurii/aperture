import * as z from "zod";

export const nfoSettingsFormSchema = z.object({
  UserId: z.string().optional(),
  SaveImagePathsInNfo: z.boolean().default(false),
  EnablePathSubstitution: z.boolean().default(false),
  EnableExtraThumbsDuplication: z.boolean().default(false),
});

export type NfoSettingsFormValues = z.infer<typeof nfoSettingsFormSchema>;

export const defaultNfoSettingsFormValues: NfoSettingsFormValues = {
  UserId: "",
  SaveImagePathsInNfo: false,
  EnablePathSubstitution: false,
  EnableExtraThumbsDuplication: false,
};
