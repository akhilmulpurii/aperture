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
  mapSeerrItemsToBaseItemDto,
} from "../../actions/seerr";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";

export default function DiscoverPage() {
  const [authError, setAuthError] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeerrConnected, setIsSeerrConnected] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState<BaseItemDto[]>([]);
  const [trending, setTrending] = useState<BaseItemDto[]>([]);

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
          const [recentResult, trendingResult] = await Promise.all([
            getSeerrRecentlyAddedItems(),
            getSeerrTrendingItems(),
          ]);

          if (recentResult?.results) {
            setRecentlyAdded(mapSeerrItemsToBaseItemDto(recentResult.results));
          }
          if (trendingResult?.results) {
            setTrending(mapSeerrItemsToBaseItemDto(trendingResult.results));
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
              serverUrl={"testurl"}
            />
          )}
        </div>
      </div>
    </AuthErrorHandler>
  );
}
