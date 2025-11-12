import { useMemo } from "react";
import { motion } from "framer-motion";

export type LogoVariant =
  | "minimalist"
  | "stacked"
  | "gradient-text"
  | "neon-glow"
  | "outline-stroke"
  | "bold-underline"
  | "layered-shadow"
  | "single-word";

export interface ColorScheme {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientVia?: string;
}

interface DynamicLogoProps {
  text: string;
  variant?: LogoVariant;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  colors?: ColorScheme;
}

export function DynamicLogo({
  text,
  variant = "minimalist",
  size = "md",
  className = "",
  colors,
}: DynamicLogoProps) {
  const parsed = useMemo(() => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const isSingleWord = words.length === 1;
    const firstWord = words[0] || "";
    const restWords = words.slice(1);

    return { words, isSingleWord, firstWord, restWords, fullText: text };
  }, [text]);

  const sizeClasses = {
    sm: "w-32 h-32 text-base",
    md: "w-40 h-40 text-lg",
    lg: "w-56 h-56 text-2xl",
    xl: "w-72 h-72 text-3xl",
  };

  const baseClass = `${sizeClasses[size]} ${className}`;

  if (parsed.isSingleWord && variant !== "single-word") {
    return (
      <SingleWordLogo
        text={parsed.firstWord}
        size={size}
        className={className}
        colors={colors}
      />
    );
  }

  switch (variant) {
    case "minimalist":
      return <Minimalist text={text} baseClass={baseClass} colors={colors} />;
    case "stacked":
      return (
        <Stacked words={parsed.words} baseClass={baseClass} colors={colors} />
      );
    case "gradient-text":
      return <GradientText text={text} baseClass={baseClass} colors={colors} />;
    case "neon-glow":
      return <NeonGlow text={text} baseClass={baseClass} colors={colors} />;
    case "outline-stroke":
      return (
        <OutlineStroke text={text} baseClass={baseClass} colors={colors} />
      );
    case "bold-underline":
      return (
        <BoldUnderline
          firstWord={parsed.firstWord}
          restWords={parsed.restWords}
          baseClass={baseClass}
          colors={colors}
        />
      );
    case "layered-shadow":
      return (
        <LayeredShadow text={text} baseClass={baseClass} colors={colors} />
      );
    case "single-word":
      return (
        <SingleWordLogo
          text={parsed.firstWord}
          size={size}
          className={className}
          colors={colors}
        />
      );
    default:
      return <Minimalist text={text} baseClass={baseClass} colors={colors} />;
  }
}

function Minimalist({
  text,
  baseClass,
  colors,
}: {
  text: string;
  baseClass: string;
  colors?: ColorScheme;
}) {
  const textColor = colors?.text || "text-foreground";
  const borderColor = colors?.primary || "border-border";

  return (
    <motion.div
      className={`${baseClass}  border ${borderColor} rounded-md flex items-center justify-center p-6`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span
        className={`text-xl font-semibold ${textColor} uppercase text-center leading-tight`}
        style={{ letterSpacing: "0.15em" }}
      >
        {text}
      </span>
    </motion.div>
  );
}

function Stacked({
  words,
  baseClass,
  colors,
}: {
  words: string[];
  baseClass: string;
  colors?: ColorScheme;
}) {
  const gradientFrom = colors?.gradientFrom || "from-secondary";
  const gradientTo = colors?.gradientTo || "to-accent";
  const primaryText = colors?.text || "text-foreground";
  const secondaryText = colors?.secondary || "text-foreground/80";

  return (
    <motion.div
      className={`${baseClass} bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg flex flex-col items-center justify-center gap-1 p-6`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className={`uppercase text-center leading-none ${
            index === 0
              ? `text-3xl font-black ${primaryText}`
              : `text-base font-medium ${secondaryText}`
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

function GradientText({
  text,
  baseClass,
  colors,
}: {
  text: string;
  baseClass: string;
  colors?: ColorScheme;
}) {
  const bgColor = colors?.background || "bg-card";
  const borderColor = colors?.primary || "border-card-border";
  const gradientFrom = colors?.gradientFrom || "from-primary";
  const gradientVia = colors?.gradientVia || "via-chart-2";
  const gradientTo = colors?.gradientTo || "to-chart-3";

  return (
    <motion.div
      className={`${baseClass} ${bgColor} border ${borderColor} rounded-lg flex items-center justify-center p-6 overflow-hidden`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className={`text-3xl font-black uppercase text-center leading-tight bg-gradient-to-r ${gradientFrom} ${gradientVia} ${gradientTo} bg-clip-text text-transparent`}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ backgroundSize: "200% 200%" }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}

function NeonGlow({
  text,
  baseClass,
  colors,
}: {
  text: string;
  baseClass: string;
  colors?: ColorScheme;
}) {
  const bgColor = colors?.background || "bg-black";
  const glowColor = colors?.primary || "text-primary";
  const glowColorValue = colors?.primary
    ? colors.primary.replace("text-", "")
    : "var(--primary)";

  return (
    <motion.div
      className={`${baseClass} ${bgColor} rounded-lg flex items-center justify-center p-6 relative overflow-hidden`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.span
        className={`text-2xl font-bold uppercase text-center leading-tight ${glowColor} relative z-10`}
        style={{
          textShadow: `0 0 10px hsl(${glowColorValue}), 0 0 20px hsl(${glowColorValue}), 0 0 30px hsl(${glowColorValue})`,
        }}
        animate={{
          textShadow: [
            `0 0 10px hsl(${glowColorValue}), 0 0 20px hsl(${glowColorValue}), 0 0 30px hsl(${glowColorValue})`,
            `0 0 15px hsl(${glowColorValue}), 0 0 30px hsl(${glowColorValue}), 0 0 45px hsl(${glowColorValue})`,
            `0 0 10px hsl(${glowColorValue}), 0 0 20px hsl(${glowColorValue}), 0 0 30px hsl(${glowColorValue})`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {text}
      </motion.span>
      <div className={`absolute inset-0 ${glowColor}/5`} />
    </motion.div>
  );
}

function OutlineStroke({
  text,
  baseClass,
  colors,
}: {
  text: string;
  baseClass: string;
  colors?: ColorScheme;
}) {
  const bgColor = colors?.background || "bg-background";
  const strokeColorValue = colors?.primary
    ? colors.primary.replace("text-", "")
    : "var(--primary)";

  return (
    <motion.div
      className={`${baseClass} ${bgColor} rounded-lg flex items-center justify-center p-6 relative overflow-hidden`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.span
        className="text-3xl font-black uppercase text-center leading-tight relative"
        style={{
          WebkitTextStroke: `2px hsl(${strokeColorValue})`,
          WebkitTextFillColor: "transparent",
          paintOrder: "stroke fill",
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}

function BoldUnderline({
  firstWord,
  restWords,
  baseClass,
  colors,
}: {
  firstWord: string;
  restWords: string[];
  baseClass: string;
  colors?: ColorScheme;
}) {
  const bgColor = colors?.background || "bg-card";
  const borderColor = colors?.primary || "border-card-border";
  const primaryText = colors?.text || "text-foreground";
  const secondaryText = colors?.secondary || "text-muted-foreground";
  const accentColor = colors?.accent || "bg-primary";

  return (
    <motion.div
      className={`${baseClass} ${bgColor} border ${borderColor} rounded-lg flex flex-col items-center justify-center gap-3 p-6`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col items-start gap-2">
        <motion.span
          className={`text-3xl font-black ${primaryText} uppercase tracking-tight relative`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {firstWord}
          <motion.div
            className={`absolute -bottom-1 left-0 right-0 h-1 ${accentColor} rounded-full`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          />
        </motion.span>
        {restWords.length > 0 && (
          <motion.span
            className={`text-base font-medium ${secondaryText} uppercase tracking-tight`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {restWords.join(" ")}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

function LayeredShadow({
  text,
  baseClass,
  colors,
}: {
  text: string;
  baseClass: string;
  colors?: ColorScheme;
}) {
  const gradientFrom = colors?.gradientFrom || "from-card";
  const gradientTo = colors?.gradientTo || "to-muted";
  const primaryText = colors?.text || "text-foreground";
  const shadow1 = colors?.primary || "text-chart-1/30";
  const shadow2 = colors?.secondary || "text-chart-2/20";

  return (
    <motion.div
      className={`${baseClass} bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg flex items-center justify-center p-6 relative overflow-hidden`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative">
        <span
          className={`absolute top-0 left-0 text-3xl font-black uppercase ${shadow1} blur-sm`}
          style={{ transform: "translate(3px, 3px)" }}
        >
          {text}
        </span>
        <span
          className={`absolute top-0 left-0 text-3xl font-black uppercase ${shadow2} blur-sm`}
          style={{ transform: "translate(6px, 6px)" }}
        >
          {text}
        </span>
        <motion.span
          className={`relative text-3xl font-black uppercase ${primaryText} z-10`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.span>
      </div>
    </motion.div>
  );
}

function SingleWordLogo({
  text,
  size,
  className,
  colors,
}: {
  text: string;
  size: "sm" | "md" | "lg" | "xl";
  className: string;
  colors?: ColorScheme;
}) {
  const sizeClasses = {
    sm: "w-32 h-32 text-2xl",
    md: "w-40 h-40 text-3xl",
    lg: "w-56 h-56 text-5xl",
    xl: "w-72 h-72 text-6xl",
  };

  const gradientFrom = colors?.gradientFrom || "from-primary";
  const gradientTo = colors?.gradientTo || "to-chart-2";
  const textColor = colors?.text || "text-white";

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg flex items-center justify-center shadow-lg`}
      initial={{ opacity: 0, rotate: -5 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.05, rotate: 2 }}
    >
      <span
        className={`font-black ${textColor} uppercase text-center leading-none tracking-tight px-4`}
      >
        {text}
      </span>
    </motion.div>
  );
}
