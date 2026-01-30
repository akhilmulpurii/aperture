import { AuthErrorHandler } from "../../components/auth-error-handler";
import { AuroraBackground } from "../../components/aurora-background";
import { SearchBar } from "../../components/search-component";
import { useSeerr } from "../../contexts/seerr-context";
import { Loader2 } from "lucide-react";
import { NotConnected } from "../../components/discover/not-connected";
import { DiscoverWidgets } from "./discover-widgets";

export default function DiscoverPage() {
  const { loading, isSeerrConnected, authError } = useSeerr();

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
            <DiscoverWidgets />
          )}
        </div>
      </div>
    </AuthErrorHandler>
  );
}
