import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  getSeerrRecentlyAddedItems,
  getSeerrTrendingItems,
  getSeerrPopularMovies,
  getSeerrPopularTv,
  getSeerrRecentRequests,
  getSeerrUser,
} from "../actions/seerr";
import { StoreSeerrData } from "../actions/store/store-seerr-data";
import { SeerrMediaItem, SeerrRequestItem } from "../types/seerr";
import { getAuthData } from "../actions";

interface SeerrContextType {
  recentlyAdded: SeerrMediaItem[];
  trending: SeerrMediaItem[];
  popularMovies: SeerrMediaItem[];
  popularTv: SeerrMediaItem[];
  recentRequests: SeerrRequestItem[];
  canManageRequests: boolean;
  loading: boolean;
  isSeerrConnected: boolean;
  authError: any | null;
  addRequest: (request: SeerrRequestItem) => void;
  removeRequest: (requestId: number) => void;
  refreshData: () => Promise<void>;
  serverUrl: string | null;
}

const SeerrContext = createContext<SeerrContextType | undefined>(undefined);

export function SeerrProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isSeerrConnected, setIsSeerrConnected] = useState(false);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<SeerrMediaItem[]>([]);
  const [trending, setTrending] = useState<SeerrMediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<SeerrMediaItem[]>([]);
  const [popularTv, setPopularTv] = useState<SeerrMediaItem[]>([]);
  const [recentRequests, setRecentRequests] = useState<SeerrRequestItem[]>([]);
  const [canManageRequests, setCanManageRequests] = useState(false);
  const [authError, setAuthError] = useState<any | null>(null);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await getAuthData();
      const seerrData = await StoreSeerrData.get();
      if (
        seerrData &&
        seerrData.serverUrl &&
        (seerrData.apiKey || (seerrData.username && seerrData.password))
      ) {
        setIsSeerrConnected(true);
        setServerUrl(seerrData.serverUrl);

        const [
          recentResult,
          trendingResult,
          popularMoviesResult,
          popularTvResult,
          recentRequestsResult,
        ] = await Promise.all([
          getSeerrRecentlyAddedItems(),
          getSeerrTrendingItems(),
          getSeerrPopularMovies(),
          getSeerrPopularTv(),
          getSeerrRecentRequests(),
        ]);

        if (recentResult?.results) setRecentlyAdded(recentResult.results);
        if (trendingResult?.results) setTrending(trendingResult.results);
        if (popularMoviesResult?.results)
          setPopularMovies(popularMoviesResult.results);
        if (popularTvResult?.results) setPopularTv(popularTvResult.results);
        if (recentRequestsResult?.results)
          setRecentRequests(recentRequestsResult.results);

        const user = await getSeerrUser();
        if (user) {
          const permissions = user.permissions || 0;
          if ((permissions & 2) !== 0) {
            setCanManageRequests(true);
          } else {
            setCanManageRequests(false);
          }
        }
      } else {
        setIsSeerrConnected(false);
        setServerUrl(null);
      }
    } catch (error: any) {
      console.error("Failed to load Seerr data", error);
      if (error.isAuthError) {
        setAuthError(error);
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addRequest = useCallback((newRequest: SeerrRequestItem) => {
    setRecentRequests((prev) => {
      const filtered = prev.filter((r) => r.id !== newRequest.id);
      return [newRequest, ...filtered].slice(0, 10);
    });
  }, []);

  const removeRequest = useCallback((requestId: number) => {
    setRecentRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  const value = {
    recentlyAdded,
    trending,
    popularMovies,
    popularTv,
    recentRequests,
    canManageRequests,
    loading,
    isSeerrConnected,
    authError,
    addRequest,
    removeRequest,
    refreshData: fetchData,
    serverUrl,
  };

  return (
    <SeerrContext.Provider value={value}>{children}</SeerrContext.Provider>
  );
}

export function useSeerr() {
  const context = useContext(SeerrContext);
  if (context === undefined) {
    throw new Error("useSeerr must be used within a SeerrProvider");
  }
  return context;
}
