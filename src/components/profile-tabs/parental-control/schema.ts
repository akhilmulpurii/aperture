import * as z from "zod";

export const parentalControlFormSchema = z.object({
  MaxParentalRating: z.number().nullable().optional(),
  BlockUnratedItems: z.array(z.string()).optional(),
  AllowedTags: z.array(z.string()).optional(),
  BlockedTags: z.array(z.string()).optional(),
});

export type ParentalControlFormValues = z.infer<typeof parentalControlFormSchema>;
