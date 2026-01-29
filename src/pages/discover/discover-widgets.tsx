import { SeerrSection } from "../../components/seerr-section";
import { SeerrRequestSection } from "../../components/seerr-request-section";
import { useSeerr } from "../../contexts/seerr-context";

export function DiscoverWidgets() {
  const {
    recentlyAdded,
    recentRequests,
    trending,
    popularMovies,
    popularTv,
    canManageRequests,
  } = useSeerr();

  return (
    <div className="space-y-8">
      {recentlyAdded.length > 0 && (
        <SeerrSection sectionName="Recently Added" items={recentlyAdded} />
      )}

      {recentRequests.length > 0 && (
        <SeerrRequestSection
          sectionName="Recent Requests"
          items={recentRequests}
          canManageRequests={canManageRequests}
        />
      )}

      {trending.length > 0 && (
        <SeerrSection sectionName="Trending" items={trending} />
      )}

      {popularMovies.length > 0 && (
        <SeerrSection sectionName="Popular Movies" items={popularMovies} />
      )}

      {popularTv.length > 0 && (
        <SeerrSection sectionName="Popular TV Shows" items={popularTv} />
      )}
    </div>
  );
}
