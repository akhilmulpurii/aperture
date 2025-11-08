export interface ThemeVariant {
  name: string;
  description?: string;
  gradient: [string, string, string?];
  themeId: string;
}

export interface ThemeVariantEntry {
  name: string;
  variants: ThemeVariant[];
}

export const THEME_VARIANTS: ThemeVariantEntry = {
  name: "Choose theme",
  variants: [
    {
      name: "Auto",
      gradient: ["#f9fafb", "#1f2937", "#38bdf8"],
      themeId: "system",
    },
    {
      name: "Light",
      description: "Stone blues with graphite shading.",
      gradient: ["#e2e8f0", "#cbd5f5", "#94a3b8"],
      themeId: "light",
    },
    {
      name: "Dark",
      gradient: ["#111827", "#1f2937", "#334155"],
      themeId: "dark",
    },
    {
      name: "Neon Grid",
      description: "Magenta to cyan arcade glow.",
      gradient: ["#f472b6", "#c084fc", "#60a5fa"],
      themeId: "neon-grid",
    },
    {
      name: "Emerald Ember",
      description: "Deep forest blacks with molten gold accents.",
      gradient: ["#022c22", "#16a34a", "#facc15"],
      themeId: "emerald-ember",
    },
    {
      name: "Sunset Blocks",
      description: "Tangerine slabs with magenta shadows.",
      gradient: ["#f97316", "#fde047", "#c026d3"],
      themeId: "sunset-blocks",
    },
    {
      name: "Crimson Obelisk",
      description: "Pitch blocks with crimson slashes.",
      gradient: ["#0f0f0f", "#ef4444", "#7f1d1d"],
      themeId: "crimson-obelisk",
    },
    {
      name: "Peach Sorbet",
      description: "Creamy peach with rosy highlights.",
      gradient: ["#fde68a", "#f9a8d4", "#fef9c3"],
      themeId: "peach-sorbet",
    },
    {
      name: "Lilac Dream",
      description: "Lavender fields with cotton candy light.",
      gradient: ["#ddd6fe", "#c4b5fd", "#f5d0fe"],
      themeId: "lilac-dream",
    },
    {
      name: "Deep Velvet",
      description: "Indigo velvet with brushed steel.",
      gradient: ["#312e81", "#4c1d95", "#64748b"],
      themeId: "deep-velvet",
    },
  ],
};
