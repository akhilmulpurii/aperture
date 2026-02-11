import { z } from "zod";

const optionalSelectValue = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional()
);

export const addLibraryFormSchema = z.object({
  CollectionType: z.string().min(1, "Please select a content type."),
  Name: z.string().trim().min(1, "Display name is required"),
  Paths: z
    .array(z.string().trim().min(1, "Folder path is required"))
    .min(1, "At least one folder path is required")
    .refine((paths) => {
      const normalized = paths.map((path) => path.trim());
      return new Set(normalized).size === normalized.length;
    }, "Folder paths must be unique"),
  LibrarySettings: z.object({
    Enabled: z.boolean().default(true),
    EnableRealtimeMonitor: z.boolean().default(true),
    PreferredMetadataLanguage: optionalSelectValue,
    MetadataCountryCode: optionalSelectValue,
    // TV Show specific
    SeasonZeroDisplayName: z.string().default("Specials"),
  }),
  MovieOptions: z.object({
    EnableEmbeddedTitles: z.boolean().default(false),
    EnableEmbeddedExtrasTitles: z.boolean().default(false),
    // TV Show specific
    EnableEmbeddedEpisodeInfos: z.boolean().default(false),
    AllowEmbeddedSubtitles: z
      .enum(["AllowAll", "AllowText", "AllowImage", "AllowNone"])
      .default("AllowAll"),
    AutomaticallyAddToCollection: z.boolean().default(false),
    AutomaticRefreshIntervalDays: z.string().default("0"), // Using string for Select, convert to number on submit
    // TV Show specific
    EnableAutomaticSeriesGrouping: z.boolean().default(false),
  }),
  // Lists
  MetadataFetchers: z.array(
    z.object({
      Name: z.string(),
      Enabled: z.boolean(),
      id: z.string(), // for dnd-kit
    })
  ),
  // TV Show specific fetchers
  SeasonMetadataFetchers: z.array(
    z.object({
      Name: z.string(),
      Enabled: z.boolean(),
      id: z.string(),
    })
  ),
  EpisodeMetadataFetchers: z.array(
    z.object({
      Name: z.string(),
      Enabled: z.boolean(),
      id: z.string(),
    })
  ),
  ImageFetchers: z.array(
    z.object({
      Name: z.string(),
      Enabled: z.boolean(),
      id: z.string(),
    })
  ),
  // TV Show specific image fetchers
  SeasonImageFetchers: z.array(
    z.object({
      Name: z.string(),
      Enabled: z.boolean(),
      id: z.string(),
    })
  ),
  EpisodeImageFetchers: z.array(
    z.object({
      Name: z.string(),
      Enabled: z.boolean(),
      id: z.string(),
    })
  ),
  SaveLocalMetadata: z.boolean().default(false),
  MetadataSavers: z.array(
    z.object({
      Name: z.string(),
      Enabled: z.boolean(),
      id: z.string(),
    })
  ),
  MediaSegmentProviders: z.array(
    z.object({
      Name: z.string(),
      Enabled: z.boolean(),
      id: z.string(),
    })
  ),
  Trickplay: z.object({
    EnableTrickplayImageExtraction: z.boolean().default(false),
    ExtractTrickplayImagesDuringLibraryScan: z.boolean().default(false),
    SaveTrickplayImagesIntoMediaFolders: z.boolean().default(false),
  }),
  ChapterImages: z.object({
    EnableChapterImageExtraction: z.boolean().default(false),
    ExtractChapterImagesDuringLibraryScan: z.boolean().default(false),
  }),
  SubtitleDownloads: z.object({
    DownloadLanguages: z.array(z.string()).default([]),
    SubtitleFetchers: z.array(
      z.object({
        Name: z.string(),
        Enabled: z.boolean(),
        id: z.string(),
      })
    ),
    RequirePerfectSubtitleMatch: z.boolean().default(true),
    SkipSubtitlesIfAudioTrackMatches: z.boolean().default(false),
    SkipSubtitlesIfEmbeddedSubtitlesPresent: z.boolean().default(false),
    SaveSubtitlesWithMedia: z.boolean().default(true),
  }),
});

export type AddLibraryFormValues = z.infer<typeof addLibraryFormSchema>;

export const defaultAddLibraryFormValues: AddLibraryFormValues = {
  CollectionType: "",
  Name: "",
  Paths: [],
  LibrarySettings: {
    Enabled: true,
    EnableRealtimeMonitor: true,
    PreferredMetadataLanguage: undefined,
    MetadataCountryCode: undefined,
    SeasonZeroDisplayName: "Specials",
  },
  MovieOptions: {
    EnableEmbeddedTitles: false,
    EnableEmbeddedExtrasTitles: false,
    EnableEmbeddedEpisodeInfos: false,
    AllowEmbeddedSubtitles: "AllowAll",
    AutomaticallyAddToCollection: false,
    AutomaticRefreshIntervalDays: "0",
    EnableAutomaticSeriesGrouping: false,
  },
  MetadataFetchers: [],
  SeasonMetadataFetchers: [],
  EpisodeMetadataFetchers: [],
  ImageFetchers: [],
  SeasonImageFetchers: [],
  EpisodeImageFetchers: [],
  SaveLocalMetadata: false,
  MetadataSavers: [],
  MediaSegmentProviders: [],
  Trickplay: {
    EnableTrickplayImageExtraction: false,
    ExtractTrickplayImagesDuringLibraryScan: false,
    SaveTrickplayImagesIntoMediaFolders: false,
  },
  ChapterImages: {
    EnableChapterImageExtraction: false,
    ExtractChapterImagesDuringLibraryScan: false,
  },
  SubtitleDownloads: {
    DownloadLanguages: [],
    SubtitleFetchers: [],
    RequirePerfectSubtitleMatch: true,
    SkipSubtitlesIfAudioTrackMatches: false,
    SkipSubtitlesIfEmbeddedSubtitlesPresent: false,
    SaveSubtitlesWithMedia: true,
  },
};
