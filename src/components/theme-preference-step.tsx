import { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { useAtom } from "jotai";
import { Button } from "./ui/button";
import { THEME_VARIANTS } from "../data/theme-presets";
import { themeSelectionAtom } from "../lib/atoms";
import { cn } from "../lib/utils";

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace("#", "");
  const parsed =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((c) => c + c)
          .join("")
      : sanitized;
  const bigint = parseInt(parsed, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface ThemePreferenceStepProps {
  onComplete: () => void;
  onBack?: () => void;
}

const ThemePreview = ({ themeId }: { themeId: string }) => {
  const Panel = () => (
    <div className="flex h-16 gap-1" aria-hidden="true">
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
        <div className="flex-1 rounded-2xl border p-2 light">
          <Panel />
        </div>
        <div className="flex-1 rounded-2xl border p-2 dark">
          <Panel />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border p-2", themeId)}>
      <Panel />
    </div>
  );
};

export function ThemePreferenceStep({
  onComplete,
  onBack,
}: ThemePreferenceStepProps) {
  const { setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useAtom(themeSelectionAtom);
  const activeVariant =
    THEME_VARIANTS.variants.find(
      (variant) => variant.name === selectedTheme.variant,
    ) ?? THEME_VARIANTS.variants[0];

  const floatingOrbs = useMemo(() => {
    const palette = activeVariant?.gradient ?? [
      "#f97316",
      "#7c3aed",
      "#22d3ee",
    ];
    const [primary, secondary, tertiary] = palette;
    return [
      { size: 260, x: "12%", y: "18%", color: hexToRgba(primary, 0.35) },
      {
        size: 320,
        x: "70%",
        y: "8%",
        color: hexToRgba(secondary ?? primary, 0.3),
      },
      {
        size: 200,
        x: "58%",
        y: "72%",
        color: hexToRgba(tertiary ?? secondary ?? primary, 0.35),
      },
    ];
  }, [activeVariant]);

  const handleVariantSelect = useCallback(
    (variantName: string, themeId: string) => {
      if (
        selectedTheme.variant === variantName &&
        selectedTheme.family === THEME_VARIANTS.name
      ) {
        return;
      }

      setSelectedTheme({
        family: THEME_VARIANTS.name,
        variant: variantName,
      });
      setTheme(themeId);
    },
    [selectedTheme, setSelectedTheme, setTheme],
  );

  const screenBackground = useMemo(() => {
    const palette = activeVariant?.gradient ?? [
      "#f97316",
      "#7c3aed",
      "#22d3ee",
    ];
    const [primary, secondary, tertiary] = palette;
    return `
      radial-gradient(circle at 20% 15%, ${hexToRgba(primary, 0.4)}, transparent 55%),
      radial-gradient(circle at 80% 5%, ${hexToRgba(secondary ?? primary, 0.35)}, transparent 45%),
      radial-gradient(circle at 50% 75%, ${hexToRgba(tertiary ?? secondary ?? primary, 0.3)}, transparent 45%),
      linear-gradient(140deg, rgba(0,0,0,0.95), rgba(3,4,10,0.9))
    `;
  }, [activeVariant]);

  const baseGlow =
    "radial-gradient(circle at 20% 20%, rgba(17,24,39,0.9), transparent 45%), radial-gradient(circle at 80% 0%, rgba(99,102,241,0.4), transparent 40%), radial-gradient(circle at 50% 80%, rgba(253,186,116,0.35), transparent 35%)";

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden text-white px-4 py-10"
      style={{ backgroundColor: "#020205" }}
      animate={{ background: screenBackground }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-70"
        animate={{ background: baseGlow }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-black/40 to-black" />
      {floatingOrbs.map((orb, index) => (
        <motion.span
          key={index}
          className="pointer-events-none absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.color,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            scale: [1, 1.15, 0.9, 1],
            opacity: [0.6, 0.3, 0.8, 0.6],
          }}
          transition={{
            repeat: Infinity,
            duration: 12 + index * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-primary/80">
              <Sparkles className="h-4 w-4" />
              Personalize
            </p>
            <motion.h1
              className="mt-3 text-4xl font-semibold text-white md:text-5xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              Dial in your dashboard glow
            </motion.h1>
            <motion.p
              className="mt-3 max-w-2xl text-base text-white/70 md:text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              Every palette remixes the UI live. You&apos;re currently basking
              in{" "}
              <span className="font-semibold text-primary">
                {selectedTheme.variant}
              </span>{" "}
              — tap a card to feel a different vibe.
            </motion.p>
          </motion.div>
          {onBack ? (
            <Button
              variant="outline"
              onClick={onBack}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : null}
        </div>

        <motion.div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {THEME_VARIANTS.variants.map((variant) => {
            const isSelected = selectedTheme.variant === variant.name;

            return (
              <motion.button
                key={variant.name}
                type="button"
                onClick={() =>
                  handleVariantSelect(variant.name, variant.themeId)
                }
                whileHover={{ y: -6, rotateX: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "group relative flex h-full flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur transition-all",
                  isSelected
                    ? "border-primary/70 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                    : "hover:border-white/30",
                )}
              >
                <AnimatePresence>
                  {isSelected ? (
                    <motion.span
                      layoutId="themeHighlight"
                      className="absolute inset-0 -z-10 rounded-3xl bg-primary/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : null}
                </AnimatePresence>
                <div className="relative">
                  <ThemePreview themeId={variant.themeId} />
                  {isSelected ? (
                    <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-primary shadow-lg">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between text-base font-semibold text-white">
                  <span className="truncate">{variant.name}</span>
                  <span
                    className={cn(
                      "text-xs font-medium uppercase tracking-widest",
                      isSelected ? "text-primary" : "text-white/50",
                    )}
                  >
                    {isSelected ? "Selected" : "Preview"}
                  </span>
                </div>
                {variant.description ? (
                  <p className="text-sm text-white/60">{variant.description}</p>
                ) : null}
                <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10 opacity-0 blur-xl transition group-hover:opacity-60" />
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80 backdrop-blur"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                Selected Theme
              </p>
              <h2 className="text-2xl font-semibold text-white">
                {selectedTheme.variant}
              </h2>
            </div>
            <Button
              size="lg"
              className="bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
              onClick={onComplete}
            >
              Launch Dashboard
            </Button>
          </div>
          <p className="text-sm text-white/60">
            You can always tweak your palette later inside Settings → Dashboard
            Themes.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
