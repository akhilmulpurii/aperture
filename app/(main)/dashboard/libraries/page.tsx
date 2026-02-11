"use client";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { Plus, Folder, Tv, Film, Radio } from "lucide-react";
import { toast } from "sonner";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import {
  fetchVirtualFolders,
  removeVirtualFolder,
  scanLibrary,
} from "@/src/actions/media";
import { VirtualFolderInfo } from "@jellyfin/sdk/lib/generated-client/models";
import VirtualFolderCard from "@/src/components/virtual-folder-card";
import Link from "next/link";

export default function LibrariesPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const [libraries, setLibraries] = useState<VirtualFolderInfo[]>([]);

  const loadLibraries = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const libraryResult = await fetchVirtualFolders();
      setLibraries(libraryResult ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load libraries");
    } finally {
      setDashboardLoading(false);
    }
  }, [setDashboardLoading]);

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries, setDashboardLoading]);

  const handleScanLibrary = async (itemId?: string) => {
    try {
      await scanLibrary(itemId);
      toast.success("Library scan started");
    } catch (error) {
      console.error(error);
      toast.error("Failed to start library scan");
    }
  };

  const handleRemoveLibrary = async (name?: string) => {
    if (!name) return;
    try {
      setDashboardLoading(true);
      await removeVirtualFolder(name, true);
      toast.success("Library removed");
      await loadLibraries();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove library");
    } finally {
      setDashboardLoading(false);
    }
  };

  const getLibraryIcon = (collectionType?: string) => {
    switch (collectionType?.toLowerCase()) {
      case "movies":
        return <Film className="h-8 w-8 text-primary" />;
      case "tvshows":
        return <Tv className="h-8 w-8 text-primary" />;
      case "livetv":
        return <Radio className="h-8 w-8 text-primary" />;
      default:
        return <Folder className="h-8 w-8 text-primary" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Libraries</h1>
        <p className="text-muted-foreground mt-2">
          Manage your media libraries and folders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Link
          href="/dashboard/libraries/add"
          className="group relative flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-accent/5 transition-all duration-300"
        >
          <div className="mb-4 rounded-full bg-background p-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="text-lg font-medium text-muted-foreground group-hover:text-primary">
            Add Library
          </span>
        </Link>

        {libraries.map((library, index) => (
          <VirtualFolderCard
            key={`library-${library.ItemId}-${index}`}
            library={library}
            icon={getLibraryIcon(library.CollectionType)}
            onScan={() => handleScanLibrary(library.ItemId || undefined)}
            onRemove={() => handleRemoveLibrary(library.Name || undefined)}
            onRenameSuccess={loadLibraries}
          />
        ))}
      </div>
    </div>
  );
}
