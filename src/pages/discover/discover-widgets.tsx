import { SeerrSection } from "../../components/seerr-section";
import { SeerrRequestSection } from "../../components/seerr-request-section";
import { SeerrMediaItem, SeerrRequestItem } from "../../types/seerr";

interface DiscoverWidgetsProps {
  recentlyAdded: SeerrMediaItem[];
  recentRequests: SeerrRequestItem[];
  trending: SeerrMediaItem[];
  popularMovies: SeerrMediaItem[];
  popularTv: SeerrMediaItem[];
  canManageRequests?: boolean;
}

export function DiscoverWidgets({
  recentlyAdded,
  recentRequests,
  trending,
  popularMovies,
  popularTv,
  canManageRequests,
}: DiscoverWidgetsProps) {
  return (
    <div className="space-y-8">
      {recentlyAdded.length > 0 && (
        <SeerrSection
          sectionName="Recently Added"
          items={recentlyAdded}
          canManageRequests={canManageRequests}
        />
      )}

      {recentRequests.length > 0 && (
        <SeerrRequestSection
          sectionName="Recent Requests"
          items={recentRequests}
          canManageRequests={canManageRequests}
        />
      )}

      {trending.length > 0 && (
        <SeerrSection
          sectionName="Trending"
          items={trending}
          canManageRequests={canManageRequests}
        />
      )}

      {popularMovies.length > 0 && (
        <SeerrSection
          sectionName="Popular Movies"
          items={popularMovies}
          canManageRequests={canManageRequests}
        />
      )}

      {popularTv.length > 0 && (
        <SeerrSection
          sectionName="Popular TV Shows"
          items={popularTv}
          canManageRequests={canManageRequests}
        />
      )}
    </div>
  );
}
