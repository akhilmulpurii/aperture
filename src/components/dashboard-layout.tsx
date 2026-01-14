import { Outlet, useLocation } from "react-router-dom";
import { AuroraBackground } from "./aurora-background";
import { SearchBar } from "./search-component";
import _ from "lodash";
import { useMemo } from "react";

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
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2 font-poppins">
            {_.startCase(route)}
          </h2>
        </div>
        <div className="mx-auto w-full max-w-none 2xl:max-w-[1400px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
