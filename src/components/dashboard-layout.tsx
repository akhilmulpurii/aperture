import { Outlet, useLocation } from "react-router-dom";
import { AuroraBackground } from "./aurora-background";
import { SearchBar } from "./search-component";
import _ from "lodash";
import { useMemo } from "react";

export default function DashboardLayout() {
  let location = useLocation();

  const route = useMemo(() => {
    const path = location.pathname.split("/dashboard/")[1];
    return path || "dashboard";
  }, [location.pathname]);

  return (
    <div className="relative px-4 py-6 max-w-full overflow-hidden">
      {/* Main content with higher z-index */}
      <AuroraBackground />
      <div className="relative z-10">
        <div className="relative z-[99] mb-8">
          <div className="mb-6">
            <SearchBar />
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2 font-poppins">
            {_.startCase(route)}
          </h2>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
