import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuroraBackground } from "./aurora-background";
import { SearchBar } from "./search-component";
import _ from "lodash";
import { useEffect, useMemo } from "react";
import { LoaderPinwheel } from "lucide-react";
import { Badge } from "./ui/badge";
import { useAtomValue } from "jotai";
import { dashboardLoadingAtom } from "../lib/atoms";
import { StoreAuthData } from "../actions/store/store-auth-data";
import { toast } from "sonner";

export default function DashboardLayout() {
  let location = useLocation();
  const isLoading = useAtomValue(dashboardLoadingAtom);
  const navigate = useNavigate();

  const route = useMemo(() => {
    const regex = /\/dashboard\/(.*?)(?=\/|$)/;
    const match = location.pathname.match(regex);
    return match ? match[1] : "dashboard";
  }, [location.pathname]);

  useEffect(() => {
    const validateAdministrator = async () => {
      const authData = await StoreAuthData.get();
      // @ts-ignore
      if (authData?.user?.Policy?.IsAdministrator) {
        // Do nothing
      } else {
        toast.error("You are not authorized to access this page");
        navigate("/");
      }
    };
    validateAdministrator();
  }, [location.pathname]);

  return (
    <div className="relative px-3 sm:px-6 xl:px-8 py-6 max-w-full overflow-hidden">
      {/* Main content with higher z-index */}
      <AuroraBackground />
      <div className="relative z-10">
        <div className="relative z-[1] mb-8">
          <div className="mb-6">
            <SearchBar />
          </div>
        </div>
        <div className="flex flex-row mb-10 items-center gap-4">
          <h2 className="text-3xl font-semibold text-foreground font-poppins">
            {_.startCase(route)}
          </h2>
          {isLoading && (
            <Badge
              className="bg-background/90 backdrop-blur-sm px-3 py-2 flex flex-row gap-2 items-center"
              variant="outline"
            >
              <LoaderPinwheel className="animate-spin text-primary w-6 h-6" />
              <span className="text-sm">Loading...</span>
            </Badge>
          )}
        </div>
        <div className="mx-auto w-full max-w-none 2xl:max-w-[1400px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
