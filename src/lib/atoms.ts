import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Global loading state for dashboard
export const dashboardLoadingAtom = atom(false);

// Fullscreen state
export const isFullscreenAtom = atom(false);

// Aurora background colors with transition support
export const auroraColorsAtom = atom<string[]>([
  "#AA5CC3",
  "#00A4DC",
  "#AA5CC3",
]);

export const previousAuroraColorsAtom = atom<string[]>([
  "#AA5CC3",
  "#00A4DC",
  "#AA5CC3",
]);

// Derived atom for updating colors with transition
export const updateAuroraColorsAtom = atom(
  null,
  (get, set, newColors: string[]) => {
    const currentColors = get(auroraColorsAtom);
    set(previousAuroraColorsAtom, currentColors);
    set(auroraColorsAtom, newColors);
  },
);

export interface ThemePresetSelection {
  family: string;
  variant: string;
}

const defaultThemeSelection: ThemePresetSelection = {
  family: "Choose theme",
  variant: "Auto",
};

export const themeSelectionAtom = atomWithStorage<ThemePresetSelection>(
  "aperture-dashboard-theme",
  defaultThemeSelection,
);
