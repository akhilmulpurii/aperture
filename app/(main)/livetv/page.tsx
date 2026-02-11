"use client";
import { fetchLiveTVItems } from "@/src/actions";
import { getAuthData } from "@/src/actions/utils";
import { LibraryMediaList } from "@/src/components/library-media-list";
import { SearchBar } from "@/src/components/search-component";
import {
  BaseItemDto,
  ItemSortBy,
} from "@jellyfin/sdk/lib/generated-client/models";
import { AuroraBackground } from "@/src/components/aurora-background";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/src/components/loading-spinner";

const libraryName = "Live TV";

export default function LiveTVPage() {
  const [libraryItems, setLibraryItems] = useState<BaseItemDto[]>([]);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLibraryData() {
      try {
        // Get auth info
        const authData = await getAuthData();
        setServerUrl(authData.serverUrl);

        const libraryItems = await fetchLiveTVItems();

        if (!libraryItems) {
          return;
        }

        setLibraryItems(libraryItems.items);
      } catch (err: any) {
        console.error(err);
        if (err.message?.includes("Authentication expired")) {
          // redirect
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    }

    fetchLibraryData();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (serverUrl == null)
    return <div className="p-4">Error loading Live TV. Please try again.</div>;

  return (
    <div className="relative px-4 py-6 max-w-full overflow-hidden">
      <AuroraBackground />
      {/* Main content with higher z-index */}
      <div className="relative z-10">
        <div className="relative z-99 mb-8">
          <div className="mb-6">
            <SearchBar />
          </div>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-semibold text-foreground font-poppins">
              {libraryName}
            </h2>
          </div>
          <span className="font-mono text-muted-foreground">
            {libraryItems.length} items
          </span>
        </div>
        <LibraryMediaList
          mediaItems={libraryItems}
          serverUrl={serverUrl}
          initialSortField={ItemSortBy.IsFavoriteOrLiked}
        />
      </div>
    </div>
  );
}
