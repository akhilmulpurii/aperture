import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { AuroraBackground } from "../../components/aurora-background";
import { SearchBar } from "../../components/search-component";
import { Settings2, LayoutDashboard } from "lucide-react";
import type { JellyfinUserWithToken } from "../../types/jellyfin";
import { Link } from "react-router-dom";
import SeerrSection from "../../components/settings/seerr-section";
import ProfileSection from "../../components/settings/profile-section";
import ThemeSection from "../../components/settings/theme-section";
import UserPreferenceSection from "../../components/settings/user-preference-section";

export default function SettingsPage() {
  const [user, setUser] = useState<JellyfinUserWithToken | null>(null);

  return (
    <div className="relative px-4 py-6 max-w-full overflow-hidden">
      <AuroraBackground />
      <div className="relative z-10">
        <div className="mb-6">
          <SearchBar />
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2 font-poppins flex items-center gap-2">
            <Settings2 className="h-8 w-8" />
            Settings
          </h2>
          <p className="text-muted-foreground">
            Customize the interface and preview upcoming dashboard themes.
          </p>
        </div>

        <div className="grid gap-6">
          <ProfileSection />
          <SeerrSection />

          {user?.Policy?.IsAdministrator ? (
            <Card className="bg-card/80 backdrop-blur ">
              <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-2 font-poppins text-lg">
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </CardTitle>
                <Link
                  to={"/dashboard"}
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  Open Dashboard
                </Link>
                <CardDescription className="w-full">
                  Manage your Jellyfin server and system settings.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          <UserPreferenceSection />

          <ThemeSection />
        </div>
      </div>
    </div>
  );
}
