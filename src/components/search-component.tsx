"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import { searchItems } from "../actions";
import { SearchSuggestionItem } from "./search-suggestion-item";

import * as Kbd from "../components/ui/kbd";
import { TextShimmer } from "./motion-primitives/text-shimmer";
import { useAuth } from "../hooks/useAuth";
import { SidebarTrigger } from "../components/ui/sidebar";
import { useIsMobile } from "../hooks/use-mobile";
import { searchSeerrItems } from "../actions/seerr";
import { StoreSeerrData } from "../actions/store/store-seerr-data";
import { SeerrRequestModal } from "./seerr-request-modal";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [seerrSuggestions, setSeerrSuggestions] = useState<any[]>([]);
  const [isSeerrConnected, setIsSeerrConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();
  const isPlayerVisible = false;
  // Server actions are imported directly
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { serverUrl } = useAuth();

  // Memoized loading component to prevent re-rendering while typing, animation restarts every time without memoization
  const loadingComponent = useMemo(
    () => (
      <div className="flex justify-center items-center p-8">
        <TextShimmer className="text-sm font-mono">
          {`Searching ${
            serverUrl &&
            new URL(serverUrl).hostname.replace(/^(jellyfin\.|www\.)/, "")
          }...`}
        </TextShimmer>
      </div>
    ),
    [serverUrl],
  );

  // Check connection on mount
  useEffect(() => {
    StoreSeerrData.get().then((data) => {
      if (
        data &&
        data.serverUrl &&
        (data.apiKey || (data.username && data.password))
      ) {
        setIsSeerrConnected(true);
      }
    });
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.trim().length > 2) {
      setIsLoading(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const promises: Promise<any>[] = [searchItems(searchQuery.trim())];
          if (isSeerrConnected) {
            console.log(
              "[SearchBar] Fetching Seerr results for:",
              searchQuery.trim(),
            );
            promises.push(searchSeerrItems(searchQuery.trim()));
          }

          const [results, seerrResults] = await Promise.all(promises);

          console.log("[SearchBar] Results:", {
            library: results?.length,
            seerr: seerrResults?.length,
          });

          // Sort to prioritize Movies and Series over Episodes and People
          const sortedResults = results.sort((a: any, b: any) => {
            const typePriority = { Movie: 1, Series: 2, Person: 3, Episode: 4 };
            const aPriority =
              typePriority[a.Type as keyof typeof typePriority] || 5;
            const bPriority =
              typePriority[b.Type as keyof typeof typePriority] || 5;
            return aPriority - bPriority;
          });
          setSuggestions(sortedResults.slice(0, 6)); // Limit to 6 suggestions

          if (seerrResults) {
            setSeerrSuggestions(seerrResults.slice(0, 3));
          }
          setShowSuggestions(true);
        } catch (error) {
          console.error("Search failed:", error);
          setSuggestions([]);
          setSeerrSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setSeerrSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  // Global keyboard shortcut for search activation
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Only activate on slash key if no input is focused and no modifiers are pressed
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        !document.activeElement?.hasAttribute("contenteditable")
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [selectedSeerrItem, setSelectedSeerrItem] = useState<{
    id: number;
    mediaType: "movie" | "tv";
  } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (item: any, isSeerr?: boolean) => {
    setShowSuggestions(false);

    if (isSeerr) {
      setSelectedSeerrItem({
        id: item.id,
        mediaType: item.mediaType || "movie",
      });
      return;
    }

    if (item.Type === "Movie") {
      router.push(`/movie/${item.Id}`);
    } else if (item.Type === "Series") {
      // Assuming a series page exists at /series/[id]
      router.push(`/series/${item.Id}`);
    } else if (item.Type === "Person") {
      router.push(`/person/${item.Id}`);
    } else if (item.Type === "Episode") {
      // For episodes, navigate to the search page for now as SeriesId is not directly available
      router.push(`/search?q=${encodeURIComponent(item.Name)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim().length > 2) {
      setShowSuggestions(true);
    }
  };

  const formatRuntime = (runTimeTicks?: number) => {
    if (!runTimeTicks) return null;
    const totalMinutes = Math.round(runTimeTicks / 600000000); // Convert from ticks to minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Hide the search bar when media player is visible
  if (isPlayerVisible) {
    return null;
  }

  return (
    <div
      className={`relative z-99 md:max-w-xl ${className}`}
      ref={suggestionsRef}
    >
      <form onSubmit={handleSearch} className="flex gap-2">
        {/* Mobile Navigation Trigger - Only visible on mobile */}
        <div className="md:hidden">
          <SidebarTrigger className="bg-card border-border border text-foreground hover:bg-accent rounded-2xl h-11 w-11 p-0" />
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground z-10" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={
              isMobile
                ? "Search"
                : "Search movies, TV shows, episodes, and people..."
            }
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={() => {
              if (searchQuery.trim().length > 2 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="pl-10 pr-16 border-border text-foreground placeholder:text-muted-foreground h-11 rounded-2xl md:rounded-xl dark:bg-background/70 bg-background/90 backdrop-blur-md"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
            <Kbd.Root variant="outline" size="lg">
              <Kbd.Key>/</Kbd.Key>
            </Kbd.Root>
          </div>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {(showSuggestions || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border z-99 max-h-96 overflow-y-auto">
          {isLoading && loadingComponent}

          {!isLoading && suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 mb-1">
                Library
              </div>
              {suggestions.map((item) => (
                <SearchSuggestionItem
                  key={item.Id}
                  item={item}
                  onClick={() => handleSuggestionClick(item)}
                  formatRuntime={formatRuntime}
                />
              ))}
            </div>
          )}

          {!isLoading && seerrSuggestions.length > 0 && (
            <div className="p-2 border-t border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 mb-1 flex items-center justify-between">
                <span>Discover</span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                  Seerr
                </Badge>
              </div>
              {seerrSuggestions.map((item) => (
                <SearchSuggestionItem
                  key={`seerr-${item.id}`}
                  item={{
                    Id: item.id,
                    Name: item.title || item.name,
                    Type: item.mediaType === "movie" ? "Movie" : "Series",
                    ImageTags: { Primary: item.posterPath },
                    ProductionYear: item.releaseDate
                      ? new Date(item.releaseDate).getFullYear()
                      : undefined,
                    // Add a flag to identify Seerr item if component supports it, or handle in onClick
                  }}
                  isSeerr={true}
                  onClick={() => handleSuggestionClick(item, true)}
                />
              ))}
            </div>
          )}

          {!isLoading &&
            suggestions.length === 0 &&
            seerrSuggestions.length === 0 &&
            searchQuery.trim().length > 2 && (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}
        </div>
      )}

      {selectedSeerrItem && (
        <SeerrRequestModal
          isOpen={!!selectedSeerrItem}
          onClose={() => setSelectedSeerrItem(null)}
          tmdbId={selectedSeerrItem.id}
          mediaType={selectedSeerrItem.mediaType}
        />
      )}
    </div>
  );
}
