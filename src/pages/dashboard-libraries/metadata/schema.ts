import * as z from "zod";

export const metadataFormSchema = z.object({
  PreferredMetadataLanguage: z.string().optional(),
  MetadataCountryCode: z.string().optional(),
  DummyChapterDuration: z.coerce.number().min(0).default(0),
  ChapterImageResolution: z
    .enum(["MatchSource", "P2160", "P1080", "P720", "P480", "P360", "P240", "P144"])
    .default("MatchSource"),
});

export type MetadataFormValues = z.infer<typeof metadataFormSchema>;

export const defaultMetadataFormValues: MetadataFormValues = {
  PreferredMetadataLanguage: undefined,
  MetadataCountryCode: undefined,
  DummyChapterDuration: 0,
  ChapterImageResolution: "MatchSource",
};
