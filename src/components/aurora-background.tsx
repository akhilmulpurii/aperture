"use client";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { useAtom } from "jotai";
import AuroraTransition from "../components/Aurora/AuroraTransition";
import { auroraColorsAtom } from "../lib/atoms";

const DEFAULT_PALETTE = ["#34d399", "#38bdf8", "#2dd4bf"];
const DEFAULT_BACKGROUND_GRADIENT =
  "radial-gradient(circle at 20% 20%, rgba(52, 211, 153, 0.25), transparent 55%), radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.25), transparent 45%), radial-gradient(circle at 50% 80%, rgba(244, 114, 182, 0.25), transparent 45%)";

const AURORA_THEME_PRESETS: Record<
  string,
  { colors: string[]; background: string }
> = {
  default: { colors: DEFAULT_PALETTE, background: DEFAULT_BACKGROUND_GRADIENT },
  light: {
    colors: ["#fde68a", "#f9a8d4", "#c4b5fd"],
    background:
      "radial-gradient(circle at 15% 20%, rgba(255, 214, 165, 0.45), transparent 55%), radial-gradient(circle at 80% 0%, rgba(199, 210, 254, 0.4), transparent 45%), linear-gradient(120deg, rgba(255, 248, 242, 0.95), rgba(249, 250, 255, 0.85))",
  },
  dark: {
    colors: ["#1e3a8a", "#4c1d95", "#0f172a"],
    background:
      "radial-gradient(circle at 15% 15%, rgba(37, 99, 235, 0.35), transparent 55%), radial-gradient(circle at 70% 0%, rgba(109, 40, 217, 0.35), transparent 45%), linear-gradient(130deg, rgba(3, 7, 18, 0.95), rgba(2, 6, 23, 0.9))",
  },
  "cinematic-theatre-black": {
    colors: ["#f97316", "#c1840a", "#030712"],
    background:
      "radial-gradient(circle at 10% 10%, rgba(249, 115, 22, 0.4), transparent 55%), radial-gradient(circle at 80% 0%, rgba(124, 58, 237, 0.3), transparent 50%), linear-gradient(140deg, rgba(3, 3, 7, 0.95), rgba(2, 2, 4, 0.85))",
  },
  "neon-grid": {
    colors: ["#f472b6", "#c084fc", "#60a5fa"],
    background:
      "radial-gradient(circle at 15% 15%, rgba(244, 114, 182, 0.4), transparent 55%), radial-gradient(circle at 80% 5%, rgba(96, 165, 250, 0.35), transparent 45%), linear-gradient(125deg, rgba(10, 8, 25, 0.95), rgba(15, 23, 42, 0.9))",
  },
  "emerald-ember": {
    colors: ["#16a34a", "#facc15", "#022c22"],
    background:
      "radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.4), transparent 55%), radial-gradient(circle at 70% 0%, rgba(251, 191, 36, 0.35), transparent 45%), linear-gradient(135deg, rgba(1, 12, 8, 0.95), rgba(0, 5, 3, 0.9))",
  },
  "sunset-blocks": {
    colors: ["#f97316", "#fb7185", "#facc15"],
    background:
      "radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.45), transparent 60%), radial-gradient(circle at 80% 10%, rgba(251, 113, 133, 0.35), transparent 45%), linear-gradient(140deg, rgba(67, 20, 7, 0.95), rgba(39, 12, 5, 0.9))",
  },
  "crimson-obelisk": {
    colors: ["#ef4444", "#f97316", "#0f0f0f"],
    background:
      "radial-gradient(circle at 15% 15%, rgba(239, 68, 68, 0.45), transparent 60%), radial-gradient(circle at 75% 5%, rgba(79, 18, 18, 0.9), transparent 50%), linear-gradient(135deg, rgba(5, 2, 2, 0.95), rgba(15, 4, 4, 0.9))",
  },
  "peach-sorbet": {
    colors: ["#f9a8d4", "#fde68a", "#fef3c7"],
    background:
      "radial-gradient(circle at 15% 20%, rgba(249, 168, 212, 0.45), transparent 55%), radial-gradient(circle at 80% 0%, rgba(254, 240, 138, 0.35), transparent 45%), linear-gradient(130deg, rgba(255, 248, 242, 0.95), rgba(254, 236, 226, 0.9))",
  },
  "lilac-dream": {
    colors: ["#c4b5fd", "#f472b6", "#a78bfa"],
    background:
      "radial-gradient(circle at 20% 20%, rgba(192, 132, 252, 0.4), transparent 55%), radial-gradient(circle at 75% 5%, rgba(244, 114, 182, 0.35), transparent 45%), linear-gradient(145deg, rgba(40, 0, 70, 0.88), rgba(65, 8, 95, 0.8))",
  },
  "deep-velvet": {
    colors: ["#7c3aed", "#0ea5e9", "#0f172a"],
    background:
      "radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.45), transparent 60%), radial-gradient(circle at 80% 5%, rgba(14, 165, 233, 0.35), transparent 45%), linear-gradient(135deg, rgba(7, 4, 20, 0.95), rgba(15, 10, 35, 0.9))",
  },
  glassmorphism: {
    colors: ["#60a5fa", "#a78bfa", "#38bdf8"],
    background:
      "radial-gradient(circle at 20% 25%, rgba(96, 165, 250, 0.15), transparent 50%), radial-gradient(circle at 75% 10%, rgba(167, 139, 250, 0.12), transparent 45%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.8))",
  },
};

const AURORA_ENABLED_THEMES = new Set<string>([
  "light",
  "dark",
  "cinematic-theatre-black",
  "neon-grid",
  "emerald-ember",
  "sunset-blocks",
  "crimson-obelisk",
  "peach-sorbet",
  "lilac-dream",
  "deep-velvet",
  "glassmorphism",
]);

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

interface AuroraBackgroundProps {
  imageUrl?: string;
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  className?: string;
}

export function AuroraBackground({
  colorStops,
  amplitude = 0.8,
  blend = 0.4,
  className = "fixed inset-0 z-0 pointer-events-none opacity-20",
}: AuroraBackgroundProps) {
  const [currentColors] = useAtom(auroraColorsAtom);
  const [transitionProgress, setTransitionProgress] = useState(1.0);

  const [mounted, setMounted] = useState(false);
  const [themeResolved, setThemeResolved] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const normalizedTheme =
    colorStops || !activeTheme
      ? "default"
      : activeTheme in AURORA_THEME_PRESETS
        ? activeTheme
        : "default";
  const palettePreset =
    colorStops || !activeTheme
      ? null
      : (AURORA_THEME_PRESETS[normalizedTheme] ?? AURORA_THEME_PRESETS.default);
  const paletteBackground =
    palettePreset?.background ?? AURORA_THEME_PRESETS.default.background;

  const targetPalette = useMemo(() => {
    if (colorStops && colorStops.length) {
      return colorStops;
    }
    if (palettePreset?.colors) {
      return palettePreset.colors;
    }
    return currentColors ?? DEFAULT_PALETTE;
  }, [colorStops, palettePreset, currentColors]);

  const [activePalette, setActivePalette] = useState<string[]>(
    () => targetPalette,
  );
  const [previousPalette, setPreviousPalette] = useState<string[]>(
    () => targetPalette,
  );

  useEffect(() => {
    if (!arraysEqual(targetPalette, activePalette)) {
      setPreviousPalette(activePalette);
      setActivePalette(targetPalette);
    }
  }, [targetPalette, activePalette]);

  useEffect(() => {
    if (arraysEqual(activePalette, previousPalette)) {
      setTransitionProgress(1);
      return;
    }

    setTransitionProgress(0);

    const startTime = Date.now();
    const duration = 3000;

    const animateTransition = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = progress * progress * (3 - 2 * progress);
      setTransitionProgress(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animateTransition);
      }
    };

    requestAnimationFrame(animateTransition);
  }, [activePalette, previousPalette]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for theme to be resolved
  useEffect(() => {
    const themeReady =
      theme === "system" ? Boolean(resolvedTheme) : Boolean(theme);
    if (mounted && themeReady) {
      const timer = setTimeout(() => setThemeResolved(true), 50);
      return () => clearTimeout(timer);
    }
  }, [mounted, theme, resolvedTheme]);

  const shouldShowAurora = colorStops
    ? true
    : !!(activeTheme && AURORA_ENABLED_THEMES.has(activeTheme));

  // Don't render anything if not in dark mode and theme is resolved
  if (mounted && themeResolved && !shouldShowAurora) {
    return null;
  }

  // During initialization, don't render anything to prevent hydration mismatch
  // This ensures server and client render the same content initially
  if (!mounted || !themeResolved) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        background: paletteBackground,
        transition: "background 0.8s ease, opacity 0.5s ease-in-out",
      }}
    >
      <AuroraTransition
        colorStopsFrom={previousPalette}
        colorStopsTo={activePalette}
        transition={transitionProgress}
        amplitude={amplitude}
        blend={blend}
      />
    </div>
  );
}
