"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getSeerrRecentlyAddedItems,
  getSeerrTrendingItems,
  getSeerrPopularMovies,
  getSeerrPopularTv,
} from "@/src/actions/seerr";
import { SeerrMediaItem } from "@/src/types/seerr-types";
import { useSeerr } from "@/src/contexts/seerr-context";

export function useSeerrDashboard() {
  const { isSeerrConnected } = useSeerr();
  const [loading, setLoading] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState<SeerrMediaItem[]>([]);
  const [trending, setTrending] = useState<SeerrMediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<SeerrMediaItem[]>([]);
  const [popularTv, setPopularTv] = useState<SeerrMediaItem[]>([]);

  const fetchDashboardData = useCallback(async () => {
    if (!isSeerrConnected) return;

    setLoading(true);
    try {
      const [
        recentResult,
        trendingResult,
        popularMoviesResult,
        popularTvResult,
      ] = await Promise.all([
        getSeerrRecentlyAddedItems(),
        getSeerrTrendingItems(),
        getSeerrPopularMovies(),
        getSeerrPopularTv(),
      ]);

      if (recentResult?.results) setRecentlyAdded(recentResult.results);
      if (trendingResult?.results) setTrending(trendingResult.results);
      if (popularMoviesResult?.results)
        setPopularMovies(popularMoviesResult.results);
      if (popularTvResult?.results) setPopularTv(popularTvResult.results);
    } catch (error) {
      console.error("Failed to fetch Seerr dashboard content", error);
    } finally {
      setLoading(false);
    }
  }, [isSeerrConnected]);

  // Initial fetch on mount if connected
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    loading,
    recentlyAdded,
    trending,
    popularMovies,
    popularTv,
    refreshCallback: fetchDashboardData,
  };
}
