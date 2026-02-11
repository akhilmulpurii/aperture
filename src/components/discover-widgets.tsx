"use client";

import { SeerrSection } from "@/src/components/seerr-section";
import { SeerrRequestSection } from "@/src/components/seerr-request-section";
import { useSeerr } from "@/src/contexts/seerr-context";
import { useSeerrDashboard } from "@/src/hooks/use-seerr-dashboard";
import { SeerrSectionSkeleton } from "@/src/components/seerr-section-skeleton";

export function DiscoverWidgets() {
  const {
    recentRequests,
    canManageRequests,
    loading: contextLoading,
  } = useSeerr();
  const {
    recentlyAdded,
    trending,
    popularMovies,
    popularTv,
    loading: dashboardLoading,
  } = useSeerrDashboard();

  if (contextLoading || dashboardLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SeerrSectionSkeleton key={i} />
        ))}
      </div>
    );
  }

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
