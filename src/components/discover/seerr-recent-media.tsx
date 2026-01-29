import { useEffect, useState } from "react";
import { getSeerrRecentlyAddedItems } from "../../actions/seerr";
import { MediaSection } from "../../components/media-section";
import { StoreSeerrData } from "../../actions/store/store-seerr-data";
import { Loader2 } from "lucide-react";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";

export function RecentlyAddedSeerr() {
  const [items, setItems] = useState<BaseItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverUrl, setServerUrl] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [result, seerrData] = await Promise.all([
          getSeerrRecentlyAddedItems(),
          StoreSeerrData.get(),
        ]);

        if (seerrData?.serverUrl) {
          setServerUrl(seerrData.serverUrl);
        }

        if (result && result.results) {
          const mappedItems: BaseItemDto[] = result.results.map(
            (item: any) => ({
              Id: String(item.jellyfinMediaId),
              Name: item.title || item.name || "Could not find title",
              Type: item.mediaType === "movie" ? "Movie" : "Series",
              // @ts-ignore - Custom property handled in MediaCard
              ExternalPosterUrl: item.posterPath
                ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
                : null,
              RunTimeTicks: 0,
              ProductionYear: item.releaseDate
                ? new Date(item.releaseDate).getFullYear()
                : undefined,
              PremiereDate: item.releaseDate,
              CommunityRating: item.voteAverage,
            }),
          );
          setItems(mappedItems);
        }
      } catch (error) {
        console.error("Failed to load recently added Seerr items", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <MediaSection
      sectionName="Recently Added"
      mediaItems={items}
      serverUrl={serverUrl}
      hideViewAll={true}
    />
  );
}
