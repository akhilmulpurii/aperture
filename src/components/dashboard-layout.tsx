import { Outlet, useLocation } from "react-router-dom";
import { AuroraBackground } from "./aurora-background";
import { SearchBar } from "./search-component";
import _ from "lodash";
import { useMemo } from "react";
import { LoaderPinwheel } from "lucide-react";
import { Badge } from "./ui/badge";

export default function DashboardLayout() {
  let location = useLocation();

  const route = useMemo(() => {
    const regex = /\/dashboard\/(.*?)(?=\/|$)/;
    const match = location.pathname.match(regex);
    return match ? match[1] : "dashboard";
  }, [location.pathname]);

  return (
    <div className="relative px-3 sm:px-6 xl:px-8 py-6 max-w-full overflow-hidden">
      {/* Main content with higher z-index */}
      <AuroraBackground />
      <div className="relative z-10">
        <div className="relative z-[99] mb-8">
          <div className="mb-6">
            <SearchBar />
          </div>
        </div>
        <div className="flex flex-row mb-10 items-center gap-4">
          <h2 className="text-3xl font-semibold text-foreground font-poppins">
            {_.startCase(route)}
          </h2>
          <Badge
            className="bg-background/90 backdrop-blur-sm px-3 py-2 flex flex-row gap-2 items-center"
            variant="outline"
          >
            <LoaderPinwheel className="animate-spin text-primary w-6 h-6" />
            <span className="text-sm">Loading...</span>
          </Badge>
        </div>
        <div className="mx-auto w-full max-w-none 2xl:max-w-[1400px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
