import { useCallback, useEffect } from "react";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { AuroraBackground } from "../../components/aurora-background";
import { SearchBar } from "../../components/search-component";
import { Badge } from "../../components/ui/badge";
import { Settings2, Palette, Check } from "lucide-react";
import { THEME_VARIANTS } from "../../data/theme-presets";
import { cn } from "../../lib/utils";
import { themeSelectionAtom } from "../../lib/atoms";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useAtom(themeSelectionAtom);

  useEffect(() => {
    if (!theme) return;

    const variantFromTheme = THEME_VARIANTS.variants.find(
      (variant) => variant.themeId === theme
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
    [selectedTheme.family, selectedTheme.variant, setSelectedTheme, setTheme]
  );

  return (
    <div className="relative px-4 py-6 max-w-full overflow-hidden">
      <AuroraBackground colorStops={["#34d399", "#38bdf8", "#2dd4bf"]} />
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
          <Card className="bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-lg">
                <Palette className="h-5 w-5" />
                Dashboard Themes
              </CardTitle>
              <CardDescription>
                Explore the palette families that power the dashboard theming
                system and apply any variant instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {THEME_VARIANTS.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Quickly preview each palette and lock in your favorite look.
                  </p>
                </div>
                <Badge variant="secondary" className="text-[11px]">
                  {THEME_VARIANTS.variants.length} variant
                  {THEME_VARIANTS.variants.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {THEME_VARIANTS.variants.map((variant) => {
                  const isSelected = selectedTheme?.variant === variant.name;
                  const gradient = `linear-gradient(135deg, ${variant.gradient.join(
                    ", "
                  )})`;

                  return (
                    <button
                      key={`${THEME_VARIANTS.name}-${variant.name}`}
                      type="button"
                      onClick={() =>
                        handleVariantSelect(variant.name, variant.themeId)
                      }
                      className={cn(
                        "group flex flex-col gap-2 rounded-2xl border bg-background/60 p-3 text-left transition focus-visible:outline focus-visible:outline-primary/40",
                        isSelected
                          ? "border-primary/60 bg-primary/5 shadow-[0_0_0_1px_rgba(59,130,246,0.2)]"
                          : "border-border/60 hover:-translate-y-0.5 hover:border-primary/40"
                      )}
                    >
                      <div className="relative h-20 overflow-hidden rounded-xl border border-white/15 bg-muted/40">
                        <span
                          className="absolute inset-0"
                          style={{ background: gradient }}
                        />
                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/25 opacity-0 transition duration-300 group-hover:opacity-100" />
                        {isSelected ? (
                          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-primary shadow">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between text-sm font-medium text-foreground">
                        {variant.name}
                        <span
                          className={cn(
                            "text-[11px]",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {isSelected ? "Active" : "Preview"}
                        </span>
                      </div>
                      {variant.description ? (
                        <p className="text-xs text-muted-foreground leading-snug">
                          {variant.description}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
