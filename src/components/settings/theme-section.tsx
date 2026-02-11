"use client";
import { useAtom } from "jotai";
import { useSettings } from "../../contexts/settings-context";
import { useCallback, useEffect, useState } from "react";
import { themeSelectionAtom } from "../../lib/atoms";
import { JellyfinUserWithToken } from "../../types/jellyfin";
import { useTheme } from "next-themes";
import { cn } from "../../lib/utils";
import { THEME_VARIANTS } from "../../data/theme-presets";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Check, ChevronDown, Palette } from "lucide-react";
import { Badge } from "../ui/badge";

export default function ThemeSection() {
  const { theme, setTheme } = useTheme();
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

  const ThemePreview = ({ themeId }: { themeId: string }) => {
    const Panel = () => (
      <div className="flex h-10 gap-1" aria-hidden="true">
        <div
          className="flex-1 rounded-md border"
          style={{
            background: "var(--background)",
            borderColor: "var(--border)",
          }}
        />
        <div
          className="flex-1 rounded-md border"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        />
        <div
          className="w-3 rounded-md border"
          style={{
            background: "var(--primary)",
            borderColor: "var(--primary)",
          }}
        />
      </div>
    );

    if (themeId === "system") {
      return (
        <div className="flex gap-1">
          <div className="flex-1 rounded-lg border p-1 light">
            <Panel />
          </div>
          <div className="flex-1 rounded-lg border p-1 dark">
            <Panel />
          </div>
        </div>
      );
    }

    const previewClass =
      themeId === "light" || themeId === "dark" ? themeId : themeId || "";

    return (
      <div className={cn("rounded-lg border p-1", previewClass)}>
        <Panel />
      </div>
    );
  };

  useEffect(() => {
    if (!theme) return;

    const variantFromTheme = THEME_VARIANTS.variants.find(
      (variant) => variant.themeId === theme,
    );

    if (
      variantFromTheme &&
      (selectedTheme.variant !== variantFromTheme.name ||
        selectedTheme.family !== THEME_VARIANTS.name)
    ) {
      setSelectedTheme({
        family: THEME_VARIANTS.name,
        variant: variantFromTheme.name,
      });
    }
  }, [theme, selectedTheme.family, selectedTheme.variant, setSelectedTheme]);

  const handleVariantSelect = useCallback(
    (variantName: string, themeId: string) => {
      if (
        selectedTheme.family === THEME_VARIANTS.name &&
        selectedTheme.variant === variantName
      ) {
        return;
      }

      setSelectedTheme({
        family: THEME_VARIANTS.name,
        variant: variantName,
      });
      setTheme(themeId);
    },
    [selectedTheme.family, selectedTheme.variant, setSelectedTheme, setTheme],
  );

  return (
    <Collapsible open={themesOpen} onOpenChange={setThemesOpen}>
      <Card className="bg-card/80 backdrop-blur">
        <CardHeader className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 font-poppins text-lg">
            <Palette className="h-5 w-5" />
            Themes
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[11px]">
              {THEME_VARIANTS.variants.length} variant
              {THEME_VARIANTS.variants.length !== 1 ? "s" : ""}
            </Badge>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={themesOpen}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
              >
                {themesOpen ? "Hide" : "Show"}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    themesOpen ? "rotate-180" : "rotate-0",
                  )}
                />
              </button>
            </CollapsibleTrigger>
          </div>
          <CardDescription className="w-full">
            Explore the palette families that power the dashboard theming system
            and apply any variant instantly.
          </CardDescription>
        </CardHeader>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-up data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-down">
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {THEME_VARIANTS.variants.map((variant) => {
                const isSelected = selectedTheme?.variant === variant.name;

                return (
                  <button
                    key={`${THEME_VARIANTS.name}-${variant.name}`}
                    type="button"
                    onClick={() =>
                      handleVariantSelect(variant.name, variant.themeId)
                    }
                    className={cn(
                      "group flex flex-col gap-1.5 rounded-2xl border bg-background/70 p-2.5 text-left transition focus-visible:outline focus-visible:outline-primary/40",
                      isSelected
                        ? "border-primary/60 bg-primary/5 shadow-[0_0_0_1px_rgba(59,130,246,0.2)]"
                        : "border-border/60 hover:-translate-y-0.5 hover:border-primary/40",
                    )}
                  >
                    <div className="relative">
                      <ThemePreview themeId={variant.themeId} />
                      {isSelected ? (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-primary shadow">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm font-medium text-foreground">
                      <span className="truncate">{variant.name}</span>
                      <span
                        className={cn(
                          "text-[11px] font-normal",
                          isSelected ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {isSelected ? "Active" : "Preview"}
                      </span>
                    </div>
                    {variant.description ? (
                      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                        {variant.description}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
