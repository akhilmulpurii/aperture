import { useEffect } from "react";
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
  const { setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useAtom(themeSelectionAtom);

  useEffect(() => {
    if (selectedTheme.family !== "Default") return;

    switch (selectedTheme.variant) {
      case "Light":
        setTheme("light");
        break;
      case "Dark":
        setTheme("dark");
        break;
      case "Auto":
      default:
        setTheme("system");
        break;
    }
  }, [selectedTheme, setTheme]);

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
                Explore the theme families that will power the upcoming
                dashboard theming system. Variant switching is under
                development, but you can preview the lineup here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div
                  key={THEME_VARIANTS.name}
                  className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm transition hover:border-primary/60 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {THEME_VARIANTS.name}
                      </h3>
                    </div>
                    <Badge variant="secondary" className="text-[11px]">
                      {THEME_VARIANTS.variants.length} variant
                      {THEME_VARIANTS.variants.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    {THEME_VARIANTS.variants.map((variant) => {
                      const isSelected =
                        selectedTheme?.family === THEME_VARIANTS.name &&
                        selectedTheme.variant === variant.name;
                      const gradient = `linear-gradient(135deg, ${variant.gradient.join(
                        ", "
                      )})`;

                      return (
                        <button
                          key={`${THEME_VARIANTS.name}-${variant.name}`}
                          onClick={() =>
                            setSelectedTheme({
                              family: THEME_VARIANTS.name,
                              variant: variant.name,
                            })
                          }
                          className={cn(
                            "flex items-center justify-between rounded-xl border px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-primary/40",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary-foreground"
                              : "border-border bg-background/60 hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-8 w-8 rounded-full border border-white/40 shadow-inner"
                              style={{ background: gradient }}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {variant.name}
                              </span>
                              {variant.description && (
                                <span className="text-xs text-muted-foreground">
                                  {variant.description}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
