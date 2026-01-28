import { LibraryOptions } from "@jellyfin/sdk/lib/generated-client/models/library-options";
import { LibraryOptionsResultDto } from "@jellyfin/sdk/lib/generated-client/models/library-options-result-dto";
import { VirtualFolderInfo } from "@jellyfin/sdk/lib/generated-client/models/virtual-folder-info";
import {
  AddLibraryFormValues,
  defaultAddLibraryFormValues,
} from "../scheme";

type FetcherSource = {
  Name?: string | null;
  DefaultEnabled?: boolean | null;
};

type FetcherItem = {
  Name: string;
  Enabled: boolean;
};

const normalizeStringArray = (
  values?: Array<string | null | undefined> | null
) => (values ?? []).map((value) => value?.trim()).filter(Boolean) as string[];

const buildFetcherItems = (
  availableItems?: FetcherSource[],
  enabledNames?: Array<string | null | undefined> | null,
  orderNames?: Array<string | null | undefined> | null
) => {
  const availableNames = (availableItems ?? [])
    .map((item) => item?.Name?.trim())
    .filter(Boolean) as string[];

  const enabledSet = new Set(normalizeStringArray(enabledNames));

  const order = normalizeStringArray(orderNames);

  const orderedNames = order.length ? order : availableNames;
  const seen = new Set<string>();

  const orderedItems = orderedNames
    .map((name) => {
      if (!name || seen.has(name)) return null;
      seen.add(name);
      return {
        Name: name,
        Enabled: enabledSet.has(name),
        id: name,
      };
    })
    .filter(Boolean) as Array<{ Name: string; Enabled: boolean; id: string }>;

  const remainingItems = availableNames
    .filter((name) => !seen.has(name))
    .map((name) => ({
      Name: name,
      Enabled: enabledSet.has(name),
      id: name,
    }));

  return [...orderedItems, ...remainingItems];
};

const buildFetcherItemsFromDisabled = (
  availableItems?: FetcherSource[],
  disabledNames?: Array<string | null | undefined> | null,
  orderNames?: Array<string | null | undefined> | null
) => {
  const availableNames = (availableItems ?? [])
    .map((item) => item?.Name?.trim())
    .filter(Boolean) as string[];
  const disabledSet = new Set(normalizeStringArray(disabledNames));
  const enabledNames = availableNames.filter((name) => !disabledSet.has(name));
  return buildFetcherItems(availableItems, enabledNames, orderNames);
};

export const mapFetcherList = (items?: FetcherSource[]) =>
  (items ?? [])
    .filter((item) => item?.Name && item.Name.trim().length > 0)
    .map((item) => {
      const name = item!.Name!.trim();
      return {
        Name: name,
        Enabled: item?.DefaultEnabled ?? false,
        id: name,
      };
    });

const toEnabledNames = (items: FetcherItem[]) =>
  items
    .filter((item) => item.Enabled)
    .map((item) => item.Name.trim())
    .filter(Boolean);

const toAllNames = (items: Array<{ Name: string }>) =>
  items.map((item) => item.Name.trim()).filter(Boolean);

const buildTypeOptions = (data: AddLibraryFormValues) => {
  const typeOptions = [];

  typeOptions.push({
    Type: data.CollectionType === "movies" ? "Movie" : "Series",
    MetadataFetchers: toEnabledNames(data.MetadataFetchers),
    MetadataFetcherOrder: toEnabledNames(data.MetadataFetchers),
    ImageFetchers: toEnabledNames(data.ImageFetchers),
    ImageFetcherOrder: toEnabledNames(data.ImageFetchers),
    ImageOptions: [],
  });

  if (data.CollectionType === "tvshows") {
    typeOptions.push({
      Type: "Season",
      MetadataFetchers: toEnabledNames(data.SeasonMetadataFetchers),
      MetadataFetcherOrder: toEnabledNames(data.SeasonMetadataFetchers),
      ImageFetchers: toEnabledNames(data.SeasonImageFetchers),
      ImageFetcherOrder: toEnabledNames(data.SeasonImageFetchers),
      ImageOptions: [],
    });

    typeOptions.push({
      Type: "Episode",
      MetadataFetchers: toEnabledNames(data.EpisodeMetadataFetchers),
      MetadataFetcherOrder: toEnabledNames(data.EpisodeMetadataFetchers),
      ImageFetchers: toEnabledNames(data.EpisodeImageFetchers),
      ImageFetcherOrder: toEnabledNames(data.EpisodeImageFetchers),
      ImageOptions: [],
    });
  }

  return typeOptions;
};

export const buildLibraryOptions = (
  data: AddLibraryFormValues
): LibraryOptions => ({
  Enabled: data.LibrarySettings.Enabled,
  EnableRealtimeMonitor: data.LibrarySettings.EnableRealtimeMonitor,
  PreferredMetadataLanguage: data.LibrarySettings.PreferredMetadataLanguage,
  MetadataCountryCode: data.LibrarySettings.MetadataCountryCode,
  SeasonZeroDisplayName: data.LibrarySettings.SeasonZeroDisplayName,
  EnableEmbeddedTitles: data.MovieOptions.EnableEmbeddedTitles,
  EnableEmbeddedExtrasTitles: data.MovieOptions.EnableEmbeddedExtrasTitles,
  EnableEmbeddedEpisodeInfos: data.MovieOptions.EnableEmbeddedEpisodeInfos,
  AllowEmbeddedSubtitles: data.MovieOptions.AllowEmbeddedSubtitles as any,
  AutomaticallyAddToCollection: data.MovieOptions.AutomaticallyAddToCollection,
  EnableAutomaticSeriesGrouping: data.MovieOptions.EnableAutomaticSeriesGrouping,
  AutomaticRefreshIntervalDays: Number(
    data.MovieOptions.AutomaticRefreshIntervalDays
  ),
  SaveLocalMetadata: data.SaveLocalMetadata,
  EnableChapterImageExtraction:
    data.ChapterImages.EnableChapterImageExtraction,
  ExtractChapterImagesDuringLibraryScan:
    data.ChapterImages.ExtractChapterImagesDuringLibraryScan,
  EnableTrickplayImageExtraction:
    data.Trickplay.EnableTrickplayImageExtraction,
  ExtractTrickplayImagesDuringLibraryScan:
    data.Trickplay.ExtractTrickplayImagesDuringLibraryScan,
  SaveTrickplayWithMedia: data.Trickplay.SaveTrickplayImagesIntoMediaFolders,
  SubtitleDownloadLanguages: data.SubtitleDownloads.DownloadLanguages,
  RequirePerfectSubtitleMatch:
    data.SubtitleDownloads.RequirePerfectSubtitleMatch,
  SkipSubtitlesIfAudioTrackMatches:
    data.SubtitleDownloads.SkipSubtitlesIfAudioTrackMatches,
  SkipSubtitlesIfEmbeddedSubtitlesPresent:
    data.SubtitleDownloads.SkipSubtitlesIfEmbeddedSubtitlesPresent,
  SaveSubtitlesWithMedia: data.SubtitleDownloads.SaveSubtitlesWithMedia,

  MetadataSavers: toEnabledNames(data.MetadataSavers),
  DisabledLocalMetadataReaders: [],
  LocalMetadataReaderOrder: [],

  DisabledSubtitleFetchers: data.SubtitleDownloads.SubtitleFetchers.filter(
    (s) => !s.Enabled
  )
    .map((s) => s.Name.trim())
    .filter(Boolean),
  SubtitleFetcherOrder: toAllNames(data.SubtitleDownloads.SubtitleFetchers),

  DisabledMediaSegmentProviders: data.MediaSegmentProviders.filter(
    (s) => !s.Enabled
  )
    .map((s) => s.Name.trim())
    .filter(Boolean),
  MediaSegmentProvideOrder: toAllNames(data.MediaSegmentProviders),

  TypeOptions: buildTypeOptions(data),
});

export const buildFormValuesFromLibrary = (
  library: VirtualFolderInfo,
  availableOptions: LibraryOptionsResultDto
): AddLibraryFormValues => {
  const base: AddLibraryFormValues = {
    ...defaultAddLibraryFormValues,
    LibrarySettings: { ...defaultAddLibraryFormValues.LibrarySettings },
    MovieOptions: { ...defaultAddLibraryFormValues.MovieOptions },
    Trickplay: { ...defaultAddLibraryFormValues.Trickplay },
    ChapterImages: { ...defaultAddLibraryFormValues.ChapterImages },
    SubtitleDownloads: {
      ...defaultAddLibraryFormValues.SubtitleDownloads,
    },
  };

  const libraryOptions = library.LibraryOptions ?? {};
  const collectionType = (library.CollectionType ?? "")
    .toString()
    .toLowerCase();

  const paths = (
    library.Locations ??
    libraryOptions.PathInfos?.map((info) => info.Path) ??
    []
  ).filter(Boolean) as string[];

  const getAvailableType = (type: string) =>
    availableOptions.TypeOptions?.find((option) => option.Type === type);

  const getLibraryType = (type: string) =>
    libraryOptions.TypeOptions?.find((option) => option.Type === type);

  const mainTypeKey = collectionType === "movies" ? "Movie" : "Series";
  const mainAvailable = getAvailableType(mainTypeKey);
  const mainLibrary = getLibraryType(mainTypeKey);

  const seasonAvailable = getAvailableType("Season");
  const seasonLibrary = getLibraryType("Season");

  const episodeAvailable = getAvailableType("Episode");
  const episodeLibrary = getLibraryType("Episode");

  return {
    ...base,
    CollectionType: collectionType || base.CollectionType,
    Name: library.Name || base.Name,
    Paths: paths.length ? paths : base.Paths,
    LibrarySettings: {
      ...base.LibrarySettings,
      Enabled: libraryOptions.Enabled ?? base.LibrarySettings.Enabled,
      EnableRealtimeMonitor:
        libraryOptions.EnableRealtimeMonitor ??
        base.LibrarySettings.EnableRealtimeMonitor,
      PreferredMetadataLanguage:
        libraryOptions.PreferredMetadataLanguage ??
        base.LibrarySettings.PreferredMetadataLanguage,
      MetadataCountryCode:
        libraryOptions.MetadataCountryCode ??
        base.LibrarySettings.MetadataCountryCode,
      SeasonZeroDisplayName:
        libraryOptions.SeasonZeroDisplayName ??
        base.LibrarySettings.SeasonZeroDisplayName,
    },
    MovieOptions: {
      ...base.MovieOptions,
      EnableEmbeddedTitles:
        libraryOptions.EnableEmbeddedTitles ??
        base.MovieOptions.EnableEmbeddedTitles,
      EnableEmbeddedExtrasTitles:
        libraryOptions.EnableEmbeddedExtrasTitles ??
        base.MovieOptions.EnableEmbeddedExtrasTitles,
      EnableEmbeddedEpisodeInfos:
        libraryOptions.EnableEmbeddedEpisodeInfos ??
        base.MovieOptions.EnableEmbeddedEpisodeInfos,
      AllowEmbeddedSubtitles:
        (libraryOptions.AllowEmbeddedSubtitles as any) ??
        base.MovieOptions.AllowEmbeddedSubtitles,
      AutomaticallyAddToCollection:
        libraryOptions.AutomaticallyAddToCollection ??
        base.MovieOptions.AutomaticallyAddToCollection,
      AutomaticRefreshIntervalDays: (
        libraryOptions.AutomaticRefreshIntervalDays ??
        Number(base.MovieOptions.AutomaticRefreshIntervalDays)
      ).toString(),
      EnableAutomaticSeriesGrouping:
        libraryOptions.EnableAutomaticSeriesGrouping ??
        base.MovieOptions.EnableAutomaticSeriesGrouping,
    },
    MetadataFetchers: buildFetcherItems(
      mainAvailable?.MetadataFetchers,
      mainLibrary?.MetadataFetchers,
      mainLibrary?.MetadataFetcherOrder
    ),
    SeasonMetadataFetchers:
      collectionType === "tvshows"
        ? buildFetcherItems(
            seasonAvailable?.MetadataFetchers,
            seasonLibrary?.MetadataFetchers,
            seasonLibrary?.MetadataFetcherOrder
          )
        : base.SeasonMetadataFetchers,
    EpisodeMetadataFetchers:
      collectionType === "tvshows"
        ? buildFetcherItems(
            episodeAvailable?.MetadataFetchers,
            episodeLibrary?.MetadataFetchers,
            episodeLibrary?.MetadataFetcherOrder
          )
        : base.EpisodeMetadataFetchers,
    ImageFetchers: buildFetcherItems(
      mainAvailable?.ImageFetchers,
      mainLibrary?.ImageFetchers,
      mainLibrary?.ImageFetcherOrder
    ),
    SeasonImageFetchers:
      collectionType === "tvshows"
        ? buildFetcherItems(
            seasonAvailable?.ImageFetchers,
            seasonLibrary?.ImageFetchers,
            seasonLibrary?.ImageFetcherOrder
          )
        : base.SeasonImageFetchers,
    EpisodeImageFetchers:
      collectionType === "tvshows"
        ? buildFetcherItems(
            episodeAvailable?.ImageFetchers,
            episodeLibrary?.ImageFetchers,
            episodeLibrary?.ImageFetcherOrder
          )
        : base.EpisodeImageFetchers,
    SaveLocalMetadata:
      libraryOptions.SaveLocalMetadata ?? base.SaveLocalMetadata,
    MetadataSavers: buildFetcherItems(
      availableOptions.MetadataSavers,
      libraryOptions.MetadataSavers,
      libraryOptions.MetadataSavers
    ),
    MediaSegmentProviders: buildFetcherItemsFromDisabled(
      (availableOptions as any).MediaSegmentProviders,
      libraryOptions.DisabledMediaSegmentProviders,
      libraryOptions.MediaSegmentProvideOrder
    ),
    Trickplay: {
      ...base.Trickplay,
      EnableTrickplayImageExtraction:
        libraryOptions.EnableTrickplayImageExtraction ??
        base.Trickplay.EnableTrickplayImageExtraction,
      ExtractTrickplayImagesDuringLibraryScan:
        libraryOptions.ExtractTrickplayImagesDuringLibraryScan ??
        base.Trickplay.ExtractTrickplayImagesDuringLibraryScan,
      SaveTrickplayImagesIntoMediaFolders:
        libraryOptions.SaveTrickplayWithMedia ??
        base.Trickplay.SaveTrickplayImagesIntoMediaFolders,
    },
    ChapterImages: {
      ...base.ChapterImages,
      EnableChapterImageExtraction:
        libraryOptions.EnableChapterImageExtraction ??
        base.ChapterImages.EnableChapterImageExtraction,
      ExtractChapterImagesDuringLibraryScan:
        libraryOptions.ExtractChapterImagesDuringLibraryScan ??
        base.ChapterImages.ExtractChapterImagesDuringLibraryScan,
    },
    SubtitleDownloads: {
      ...base.SubtitleDownloads,
      DownloadLanguages: normalizeStringArray(
        libraryOptions.SubtitleDownloadLanguages ??
          base.SubtitleDownloads.DownloadLanguages
      ),
      SubtitleFetchers: buildFetcherItemsFromDisabled(
        availableOptions.SubtitleFetchers,
        libraryOptions.DisabledSubtitleFetchers,
        libraryOptions.SubtitleFetcherOrder
      ),
      RequirePerfectSubtitleMatch:
        libraryOptions.RequirePerfectSubtitleMatch ??
        base.SubtitleDownloads.RequirePerfectSubtitleMatch,
      SkipSubtitlesIfAudioTrackMatches:
        libraryOptions.SkipSubtitlesIfAudioTrackMatches ??
        base.SubtitleDownloads.SkipSubtitlesIfAudioTrackMatches,
      SkipSubtitlesIfEmbeddedSubtitlesPresent:
        libraryOptions.SkipSubtitlesIfEmbeddedSubtitlesPresent ??
        base.SubtitleDownloads.SkipSubtitlesIfEmbeddedSubtitlesPresent,
      SaveSubtitlesWithMedia:
        libraryOptions.SaveSubtitlesWithMedia ??
        base.SubtitleDownloads.SaveSubtitlesWithMedia,
    },
  };
};
