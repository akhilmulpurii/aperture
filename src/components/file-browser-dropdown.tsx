import { useMemo, useState } from "react";
import { File, Folder, Search, ArrowUp, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import {
  fetchDefaultDirectoryBrowser,
  fetchDirectoryContents,
  fetchDrives,
  fetchParentPath,
} from "../actions";
import type { FileSystemEntryInfo } from "@jellyfin/sdk/lib/generated-client/models";
import { FileSystemEntryType } from "@jellyfin/sdk/lib/generated-client/models/file-system-entry-type";

type FileBrowserDropdownProps = {
  ariaLabel: string;
  className?: string;
  onSelect: (path: string) => void;
};

export function FileBrowserDropdown({
  ariaLabel,
  className,
  onSelect,
}: FileBrowserDropdownProps) {
  const [open, setOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [entries, setEntries] = useState<FileSystemEntryInfo[]>([]);
  const [drives, setDrives] = useState<FileSystemEntryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const sortedEntries = useMemo(() => {
    return entries.slice().sort((a, b) => {
      const aType = a.Type ?? FileSystemEntryType.Directory;
      const bType = b.Type ?? FileSystemEntryType.Directory;
      if (aType === bType) {
        return (a.Name || "").localeCompare(b.Name || "");
      }
      return aType === FileSystemEntryType.Directory ? -1 : 1;
    });
  }, [entries]);

  const displayPath = currentPath || "/";

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEntries([]);
      setCurrentPath("");
      setErrorMessage("");
    } else {
      void initializeBrowser();
    }
  };

  const initializeBrowser = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [defaultBrowser, driveList] = await Promise.all([
        fetchDefaultDirectoryBrowser(),
        fetchDrives(),
      ]);
      setDrives(driveList);

      const defaultPath = defaultBrowser?.Path ?? "";
      if (defaultPath) {
        setCurrentPath(defaultPath);
        const contents = await fetchDirectoryContents(
          defaultPath,
          false,
          true
        );
        setEntries(contents);
      } else {
        setCurrentPath("");
        setEntries(driveList);
      }
    } catch (error) {
      console.error("Failed to initialize file browser:", error);
      setErrorMessage("Unable to load directories.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = async (path: string) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const contents = await fetchDirectoryContents(path, false, true);
      setCurrentPath(path);
      setEntries(contents);
    } catch (error) {
      console.error("Failed to load directory:", error);
      setErrorMessage("Unable to load this directory.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateUp = async () => {
    if (!currentPath) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const parentPath = await fetchParentPath(currentPath);
      if (!parentPath) {
        setCurrentPath("");
        setEntries(drives);
      } else {
        const contents = await fetchDirectoryContents(
          parentPath,
          false,
          true
        );
        setCurrentPath(parentPath);
        setEntries(contents);
      }
    } catch (error) {
      console.error("Failed to fetch parent path:", error);
      setErrorMessage("Unable to load parent directory.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            "rounded-md p-1 text-muted-foreground transition hover:text-foreground",
            className
          )}
        >
          <Search className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-3"
        sideOffset={6}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Select path</p>
            <p className="text-xs text-muted-foreground">
              Dummy file system
            </p>
          </div>
        </div>

        <div className="mt-2 rounded-md border border-border/70 bg-muted/30 px-2 py-1 text-xs font-mono text-muted-foreground">
          {displayPath}
        </div>

        <div className="mt-2 max-h-48 overflow-auto rounded-md border border-border/60">
          {isLoading ? (
            <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading folders...
            </div>
          ) : errorMessage ? (
            <div className="px-2 py-3 text-xs text-red-500">
              {errorMessage}
            </div>
          ) : sortedEntries.length === 0 ? (
            <div className="px-2 py-3 text-xs text-muted-foreground">
              This folder is empty.
            </div>
          ) : (
            <div className="p-1">
              <button
                type="button"
                onClick={handleNavigateUp}
                disabled={!currentPath}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition hover:bg-accent disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
                <span className="truncate">..</span>
              </button>
              {sortedEntries.map((entry) => {
                const name = entry.Name || entry.Path || "Unknown";
                const path = entry.Path || "";
                const isDirectory =
                  entry.Type === FileSystemEntryType.Directory ||
                  entry.Type === FileSystemEntryType.NetworkShare ||
                  entry.Type === FileSystemEntryType.NetworkComputer;

                return (
                  <button
                    key={`${entry.Type}-${path || name}`}
                    type="button"
                    onClick={() => {
                      if (isDirectory && path) {
                        void handleNavigate(path);
                        return;
                      }
                      if (path) {
                        onSelect(path);
                        setOpen(false);
                      }
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-accent"
                  >
                    {isDirectory ? (
                      <Folder className="h-4 w-4 text-primary" />
                    ) : (
                      <File className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="truncate">{name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={() => {
            onSelect(currentPath || "/");
            setOpen(false);
          }}
        >
          Use this folder
        </Button>
      </PopoverContent>
    </Popover>
  );
}
