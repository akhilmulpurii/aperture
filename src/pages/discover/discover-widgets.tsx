import { MediaSection } from "../../components/media-section";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";

interface DiscoverWidgetsProps {
  recentlyAdded: BaseItemDto[];
  trending: BaseItemDto[];
  serverUrl: string;
}

export function DiscoverWidgets({
  recentlyAdded,
  trending,
  serverUrl,
}: DiscoverWidgetsProps) {
  return (
    <div className="space-y-8">
      {recentlyAdded.length > 0 && (
        <MediaSection
          sectionName="Recently Added"
          mediaItems={recentlyAdded}
          serverUrl={serverUrl}
          hideViewAll={true}
        />
      )}

      {trending.length > 0 && (
        <MediaSection
          sectionName="Trending"
          mediaItems={trending}
          serverUrl={serverUrl}
          hideViewAll={true}
        />
      )}
    </div>
  );
}
