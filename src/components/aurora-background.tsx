"use client";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { useAtom } from "jotai";
import AuroraTransition from "../components/Aurora/AuroraTransition";
import { auroraColorsAtom } from "../lib/atoms";
import { DEFAULT_PALETTE, THEME_VARIANTS } from "../data/theme-presets";
import { useSettings } from "../contexts/settings-context";

const AURORA_THEME_PRESETS: Record<
  string,
  { colors: string[]; background: string }
> = THEME_VARIANTS.variants.reduce(
  (acc, variant) => {
    acc[variant.themeId] = {
      colors: variant.aurora.colors,
      background: variant.aurora.background,
    };
    return acc;
  },
  {} as Record<string, { colors: string[]; background: string }>,
);

const AURORA_ENABLED_THEMES = new Set<string>(
  Object.keys(AURORA_THEME_PRESETS),
);

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

interface AuroraBackgroundProps {
  imageUrl?: string;
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  className?: string;
}

function AuroraBackgroundResolved({
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
      : (AURORA_THEME_PRESETS[normalizedTheme] ?? AURORA_THEME_PRESETS.system);
  const paletteBackground =
    palettePreset?.background ?? AURORA_THEME_PRESETS.system.background;

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

export function AuroraBackground({
  colorStops,
  amplitude = 0.8,
  blend = 0.4,
  className = "fixed inset-0 z-0 pointer-events-none opacity-20",
}: AuroraBackgroundProps) {
  const { enableAuroraEffect } = useSettings();
  if (!enableAuroraEffect) return null;
  return (
    <AuroraBackgroundResolved
      colorStops={colorStops}
      amplitude={amplitude}
      blend={blend}
      className={className}
    />
  );
}
