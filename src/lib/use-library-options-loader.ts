"use client";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { fetchLibraryOptionsInfo } from "@/src/actions/media";
import { AddLibraryFormValues } from "@/src/form-schemas/libraries/add";
import { mapFetcherList } from "./library-form-helpers";

interface UseLibraryOptionsLoaderParams {
  collectionType?: string;
  form: UseFormReturn<AddLibraryFormValues>;
  setLoading: (loading: boolean) => void;
}

export function useLibraryOptionsLoader({
  collectionType,
  form,
  setLoading,
}: UseLibraryOptionsLoaderParams) {
  useEffect(() => {
    if (!collectionType) return;

    const loadLibraryOptions = async () => {
      setLoading(true);
      try {
        const apiType = collectionType === "movies" ? "movies" : "tvshows";
        const result = await fetchLibraryOptionsInfo(apiType, true);

        const typeKey = collectionType === "movies" ? "Movie" : "Series";
        const typeOptions = result.TypeOptions?.find((t) => t.Type === typeKey);

        if (typeOptions?.MetadataFetchers) {
          form.setValue(
            "MetadataFetchers",
            mapFetcherList(typeOptions.MetadataFetchers),
          );
        }

        if (collectionType === "tvshows") {
          const seasonOptions = result.TypeOptions?.find(
            (t) => t.Type === "Season",
          );
          if (seasonOptions?.MetadataFetchers) {
            form.setValue(
              "SeasonMetadataFetchers",
              mapFetcherList(seasonOptions.MetadataFetchers),
            );
          }

          const episodeOptions = result.TypeOptions?.find(
            (t) => t.Type === "Episode",
          );
          if (episodeOptions?.MetadataFetchers) {
            form.setValue(
              "EpisodeMetadataFetchers",
              mapFetcherList(episodeOptions.MetadataFetchers),
            );
          }
        }

        if (typeOptions?.ImageFetchers) {
          form.setValue(
            "ImageFetchers",
            mapFetcherList(typeOptions.ImageFetchers),
          );
        }

        if (collectionType === "tvshows") {
          const seasonOptions = result.TypeOptions?.find(
            (t) => t.Type === "Season",
          );
          if (seasonOptions?.ImageFetchers) {
            form.setValue(
              "SeasonImageFetchers",
              mapFetcherList(seasonOptions.ImageFetchers),
            );
          }

          const episodeOptions = result.TypeOptions?.find(
            (t) => t.Type === "Episode",
          );
          if (episodeOptions?.ImageFetchers) {
            form.setValue(
              "EpisodeImageFetchers",
              mapFetcherList(episodeOptions.ImageFetchers),
            );
          }
        }

        if (result.MetadataSavers) {
          form.setValue(
            "MetadataSavers",
            mapFetcherList(result.MetadataSavers),
          );
        }

        if (result.SubtitleFetchers) {
          form.setValue(
            "SubtitleDownloads.SubtitleFetchers",
            mapFetcherList(result.SubtitleFetchers),
          );
        }

        const mediaSegmentProviders: any[] =
          (result as any).MediaSegmentProviders || [];
        if (mediaSegmentProviders.length) {
          form.setValue(
            "MediaSegmentProviders",
            mapFetcherList(mediaSegmentProviders),
          );
        }
      } catch (error) {
        console.error("Failed to load library options", error);
        toast.error("Failed to load library options");
      } finally {
        setLoading(false);
      }
    };

    loadLibraryOptions();
  }, [collectionType, form, setLoading]);
}
