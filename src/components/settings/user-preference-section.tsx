"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { cn } from "@/src/lib/utils";
import { Switch } from "@/src/components/ui/switch";
import { Sliders } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/src/contexts/settings-context";

export default function UserPreferenceSection() {
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const {
    enableThemeBackdrops,
    setEnableThemeBackdrops,
    enableThemeSongs,
    setEnableThemeSongs,
  } = useSettings();

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
                  preferencesOpen ? "rotate-180" : "rotate-0",
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
  );
}
