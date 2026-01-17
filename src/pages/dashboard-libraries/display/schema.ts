import * as z from "zod";

export const displayFormSchema = z.object({
  metadata: z.object({
    UseFileCreationTimeForDateAdded: z
      .enum(["UseFileCreationTime", "UseDateScanned"])
      .default("UseFileCreationTime"),
  }),
  configuration: z.object({
    EnableFolderView: z.boolean().default(false),
    DisplaySpecialsWithinSeasons: z.boolean().default(false),
    EnableGroupingMoviesIntoCollections: z.boolean().default(false),
    EnableGroupingShowsIntoCollections: z.boolean().default(false),
    EnableExternalContentInSuggestions: z.boolean().default(false),
  }),
});

export type DisplayFormValues = z.infer<typeof displayFormSchema>;

export const defaultDisplayFormValues: DisplayFormValues = {
  metadata: {
    UseFileCreationTimeForDateAdded: "UseFileCreationTime",
  },
  configuration: {
    EnableFolderView: false,
    DisplaySpecialsWithinSeasons: false,
    EnableGroupingMoviesIntoCollections: false,
    EnableGroupingShowsIntoCollections: false,
    EnableExternalContentInSuggestions: false,
  },
};
