"use client";
import { useEffect } from "react";
import { useAuthError } from "@/src/hooks/use-auth-error";
import { AuroraBackground } from "@/src/components/aurora-background";
import { SearchBar } from "@/src/components/search-component";
import { useSeerr } from "@/src/contexts/seerr-context";
import { NotConnected } from "@/src/components/discover/not-connected";
import { DiscoverWidgets } from "@/src/components/discover-widgets";

export default function DiscoverPage() {
  const { loading, isSeerrConnected, authError } = useSeerr();

  const { handleAuthError } = useAuthError();

  useEffect(() => {
    if (authError) {
      handleAuthError(authError);
    }
  }, [authError, handleAuthError]);

  return (
      <div className="relative px-4 py-3 max-w-full overflow-hidden min-h-[calc(100vh-4rem)]">
        <AuroraBackground />

        <div className="relative z-[99] mb-8 animate-in fade-in duration-500">
          <div className="mb-6">
            <SearchBar />
          </div>
          {!loading && !isSeerrConnected ? (
            <NotConnected />
          ) : (
            <DiscoverWidgets />
          )}
        </div>
      </div>
  );
}
