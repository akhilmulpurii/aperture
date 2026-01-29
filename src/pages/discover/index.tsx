import { AuthErrorHandler } from "../../components/auth-error-handler";
import { AuroraBackground } from "../../components/aurora-background";
import { SearchBar } from "../../components/search-component";
import { useEffect, useState } from "react";
import { getAuthData } from "../../actions";
import { useNavigate } from "react-router-dom";
import { StoreSeerrData } from "../../actions/store/store-seerr-data";
import { Loader2 } from "lucide-react";
import { NotConnected } from "../../components/discover/not-connected";
import { DiscoverWidgets } from "./discover-widgets";
import {
  getSeerrRecentlyAddedItems,
  getSeerrTrendingItems,
  getSeerrPopularMovies,
  getSeerrPopularTv,
} from "../../actions/seerr";
import { SeerrMediaItem } from "../../types/seerr";

export default function DiscoverPage() {
  const [authError, setAuthError] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeerrConnected, setIsSeerrConnected] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState<SeerrMediaItem[]>([]);
  const [trending, setTrending] = useState<SeerrMediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<SeerrMediaItem[]>([]);
  const [popularTv, setPopularTv] = useState<SeerrMediaItem[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        await getAuthData();
        const seerrData = await StoreSeerrData.get();
        if (
          seerrData &&
          seerrData.serverUrl &&
          (seerrData.apiKey || (seerrData.username && seerrData.password))
        ) {
          setIsSeerrConnected(true);

          // Fetch widget data in parallel
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

          if (recentResult?.results) {
            setRecentlyAdded(recentResult.results);
          }
          if (trendingResult?.results) {
            setTrending(trendingResult.results);
          }
          if (popularMoviesResult?.results) {
            setPopularMovies(popularMoviesResult.results);
          }
          if (popularTvResult?.results) {
            setPopularTv(popularTvResult.results);
          }
        }
      } catch (error: any) {
        console.error("Failed to load data:", error);

        if (error.isAuthError) {
          setAuthError(error);
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  return (
    <AuthErrorHandler error={authError}>
      <div className="relative px-4 py-6 max-w-full overflow-hidden min-h-[calc(100vh-4rem)]">
        <AuroraBackground />

        <div className="relative z-[99] mb-8 animate-in fade-in duration-500">
          <div className="mb-6">
            <SearchBar />
          </div>
          {loading ? (
            <div className="flex h-[50vh] w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !isSeerrConnected ? (
            <NotConnected />
          ) : (
            <DiscoverWidgets
              recentlyAdded={recentlyAdded}
              trending={trending}
              popularMovies={popularMovies}
              popularTv={popularTv}
            />
          )}
        </div>
      </div>
    </AuthErrorHandler>
  );
}
