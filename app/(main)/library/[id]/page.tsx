"use client";
import { fetchLibraryItems, getLibraryById } from "@/src/actions";
import { getAuthData } from "@/src/actions/utils";
import { LibraryMediaList } from "@/src/components/library-media-list";
import { SearchBar } from "@/src/components/search-component";
import { ScanLibraryButton } from "@/src/components/scan-library-button";
import { AuroraBackground } from "@/src/components/aurora-background";
import { useEffect, useState } from "react";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import LoadingSpinner from "@/src/components/loading-spinner";
import { useParams } from "next/navigation";

export default function LibraryPage() {
  const { id } = useParams<{ id: string }>();

  const [libraryDetails, setLibraryDetails] = useState<BaseItemDto | null>(
    null,
  );
  const [libraryItems, setLibraryItems] = useState<BaseItemDto[]>([]);
  const [libraryName, setLibraryName] = useState<string>("Library");
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLibraryData() {
      if (!id?.trim()) return;

      try {
        // Get auth info
        const authData = await getAuthData();
        setServerUrl(authData.serverUrl);

        // Fetch both library details and initial items in parallel
        const [details, initialItems] = await Promise.all([
          getLibraryById(id),
          fetchLibraryItems(id), // first fetch to get totalRecordCount
        ]);

        if (!details || !initialItems) {
          return;
        }

        setLibraryDetails(details);

        // Fetch all items using totalRecordCount
        const allItems = await fetchLibraryItems(
          id,
          initialItems.totalRecordCount,
        );
        setLibraryItems(allItems.items);

        setLibraryName(details.Name || "Library");
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
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (
    libraryDetails == null ||
    id == null ||
    libraryItems == null ||
    serverUrl == null
  )
    return <div className="p-4">Error loading Library. Please try again.</div>;

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
            <ScanLibraryButton libraryId={id} />
          </div>
          <span className="font-mono text-muted-foreground">
            {libraryItems.length} items
          </span>
        </div>
        <LibraryMediaList mediaItems={libraryItems} serverUrl={serverUrl} />
      </div>
    </div>
  );
}
