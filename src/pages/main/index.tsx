import {
  fetchResumeItems,
  fetchLibraryItems,
  fetchLiveTVItems,
  fetchNextUpItems,
} from "../../actions/media";
import { getAuthData, getUserLibraries } from "../../actions/utils";
import { AuthErrorHandler } from "../../components/auth-error-handler";
import { MediaSection } from "../../components/media-section";
import { SearchBar } from "../../components/search-component";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models/base-item-dto";
import { AuroraBackground } from "../../components/aurora-background";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/loading-spinner";

import { HeroSection } from "../../components/hero/hero-section";
import { JellyfinItem } from "../../types/jellyfin";

export default function Home() {
  const navigate = useNavigate();

  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [resumeItems, setResumeItems] = useState<any[]>([]);
  const [nextupItems, setNextupItems] = useState<JellyfinItem[]>([]);
  const [libraries, setLibraries] = useState<
    {
      library: any;
      items: BaseItemDto[];
    }[]
  >([]);

  const [authError, setAuthError] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const authData = await getAuthData();
        setServerUrl(authData.serverUrl);
        setUser(authData.user);

        // Fetch resume items and libraries in parallel
        const [resumeItemsResult, nextupItemsResult, userLibraries] = await Promise.all([
          fetchResumeItems(),
          fetchNextUpItems(),
          getUserLibraries(),
        ]);

      setResumeItems(resumeItemsResult);
      setNextupItems(nextupItemsResult.filter(item => !resumeItemsResult
        .some(resumeItem => resumeItem.Id === item.Id)));

        // Fetch items for each library in parallel
        const libraryData = await Promise.all(
          userLibraries.map(async (library) => {
            const items =
              library.CollectionType === "livetv"
                ? (await fetchLiveTVItems(true)).items
                : (await fetchLibraryItems(library.Id!, 12)).items;
            return { library, items };
          })
        );

        setLibraries(libraryData);
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

  if (loading) return <LoadingSpinner />;

  if (!libraries || serverUrl == null)
    return (
      <div className="p-4">Error loading Home Page. Please try again.</div>
    );

  return (
    <AuthErrorHandler error={authError}>
      <div className="relative px-4 py-6 max-w-full overflow-hidden">
        <AuroraBackground />

        <div className="relative z-[99] mb-8">
          <div className="mb-6">
            <SearchBar />
          </div>
        </div>

        <div className="relative z-10 mb-4">
          <h2 className="text-3xl font-semibold text-foreground mb-2 font-poppins">
            Welcome back, {user?.Name}
          </h2>
          <p className="text-muted-foreground mb-6">
            Continue watching or discover something new
          </p>
        </div>

        <HeroSection serverUrl={serverUrl} />

        {resumeItems.length > 0 && (
          <MediaSection
            sectionName="Continue Watching"
            mediaItems={resumeItems}
            serverUrl={serverUrl}
            continueWatching
            hideViewAll
          />
        )}

        {nextupItems.length > 0 && (
          <MediaSection
            sectionName="Next Up"
            mediaItems={nextupItems}
            serverUrl={serverUrl}
            continueWatching
            hideViewAll
          />
        )}

        {libraries.map(({ library, items }) => (
          <MediaSection
            key={library.Id}
            library={library}
            sectionName={library.Name}
            mediaItems={items}
            serverUrl={serverUrl}
          />
        ))}
      </div>
    </AuthErrorHandler>
  );
}
