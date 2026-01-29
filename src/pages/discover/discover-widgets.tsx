import { SeerrSection } from "../../components/seerr-section";
import { SeerrMediaItem } from "../../types/seerr";

interface DiscoverWidgetsProps {
  recentlyAdded: SeerrMediaItem[];
  trending: SeerrMediaItem[];
  popularMovies: SeerrMediaItem[];
  popularTv: SeerrMediaItem[];
}

export function DiscoverWidgets({
  recentlyAdded,
  trending,
  popularMovies,
  popularTv,
}: DiscoverWidgetsProps) {
  return (
    <div className="space-y-8">
      {recentlyAdded.length > 0 && (
        <SeerrSection sectionName="Recently Added" items={recentlyAdded} />
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
