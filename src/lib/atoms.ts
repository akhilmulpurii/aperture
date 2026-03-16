import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models/base-item-dto";
import { JellyfinItem } from "@/src/types/jellyfin";

// Global loading state for dashboard
export const dashboardLoadingAtom = atom(false);

// Global auth error state
export const globalAuthErrorAtom = atom<any | null>(null);

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

// Home page data, to persist navigation state within the session
export const homeServerUrlAtom = atom<string | null>(null);
export const homeUserAtom = atom<any | null>(null);
export const homeResumeItemsAtom = atom<any[]>([]);
export const homeNextupItemsAtom = atom<JellyfinItem[]>([]);
export const homeLibrariesAtom = atom<
  {
    library: any;
    items: BaseItemDto[];
  }[]
>([]);
export const homeLastVisitedTimeAtom = atom(0); // Last visited time for homepage
export const heroItemsAtom = atom<BaseItemDto[]>([]);
export const heroLastVisitedTimeAtom = atom(0); // Last visited time for hero section
