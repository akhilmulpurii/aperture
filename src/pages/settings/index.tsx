import {
  useState,
} from "react";
import { useAtom } from "jotai";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { AuroraBackground } from "../../components/aurora-background";
import { SearchBar } from "../../components/search-component";
import {
  Settings2,
  ChevronDown,
  LayoutDashboard,
  ChevronRight,
  Sliders,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { themeSelectionAtom } from "../../lib/atoms";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { Switch } from "../../components/ui/switch";
import type { JellyfinUserWithToken } from "../../types/jellyfin";
import { Link } from "react-router-dom";
import { useSettings } from "../../contexts/settings-context";
import SeerrSection from "../../components/settings/seerr-section";
import ProfileSection from "../../components/settings/profile-section";
import ThemeSection from "../../components/settings/theme-section";

export default function SettingsPage() {
  const {
    enableThemeBackdrops,
    setEnableThemeBackdrops,
    enableThemeSongs,
    setEnableThemeSongs,
  } = useSettings();
  const [selectedTheme, setSelectedTheme] = useAtom(themeSelectionAtom);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);
  const [user, setUser] = useState<JellyfinUserWithToken | null>(null);

  // Mock preferences
  const preferences = [
    {
      id: "enable-theme-backdrops",
      title: "Enable Theme Backdrops",
      description: "Show dynamic background images from media.",
      checked: enableThemeBackdrops,
      onCheckedChange: setEnableThemeBackdrops,
    },
    {
      id: "enable-theme-songs",
      title: "Enable Theme Songs",
      description: "Play theme music when viewing media details.",
      checked: enableThemeSongs,
      onCheckedChange: setEnableThemeSongs,
    },
  ];

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
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      themesOpen ? "rotate-180" : "rotate-0"
                    )}
                  />
                </Link>
                <CardDescription className="w-full">
                  Manage your Jellyfin server and system settings.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          <Collapsible open={preferencesOpen} onOpenChange={setPreferencesOpen}>
            <Card className="bg-card/80 backdrop-blur">
              <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-2 font-poppins text-lg">
                  <Sliders className="h-5 w-5" />
                  User Preferences
                </CardTitle>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    aria-expanded={preferencesOpen}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                  >
                    {preferencesOpen ? "Hide" : "Show"}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        preferencesOpen ? "rotate-180" : "rotate-0"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CardDescription className="w-full">
                  Customize your playback and interface experience.
                </CardDescription>
              </CardHeader>
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-up data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-down">
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {preferences.map((pref) => (
                      <div
                        key={pref.id}
                        className="flex items-start space-x-4 rounded-2xl border border-border/60 bg-background/70 p-4"
                      >
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {pref.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pref.description}
                          </p>
                        </div>
                        <Switch
                          checked={pref.checked}
                          onCheckedChange={pref.onCheckedChange}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <ThemeSection />
        </div>
      </div>
    </div>
  );
}
