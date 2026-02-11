"use client";
import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { Vibrant } from "node-vibrant/browser";

interface VibrantLogoProps {
  src: string;
  alt: string;
  movieName: string;
  className?: string;
  width?: number;
  height?: number;
}

export function VibrantLogo({
  src,
  alt,
  className = "max-h-20 md:max-h-24 w-auto object-contain",
  width = 300,
  height = 96,
}: VibrantLogoProps) {
  const [shadowColor, setShadowColor] = useState<string>("");

  useEffect(() => {
    const extractColors = async () => {
      try {
        const vibrant = new Vibrant(src);
        const palette = await vibrant.getPalette();

        // Get the LightVibrant color, fallback to Vibrant if not available
        const lightVibrant = palette.LightVibrant?.hex || palette.Vibrant?.hex;

        if (lightVibrant) {
          setShadowColor(lightVibrant);
        }
      } catch (error) {
        console.error("Error extracting colors from logo:", error);
      }
    };

    if (src) {
      extractColors();
    }
  }, [src]);

  // memoized style object to prevent unnecessary re-renders
  const dynamicStyle = useMemo(() => {
    if (!shadowColor) return {};

    // Detect if the browser is Safari to avoid the drop-shadow "boxed" clipping effect
    const isSafari =
      typeof navigator !== "undefined" &&
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) return {};

    return {
      filter: `drop-shadow(0 8px 60px ${shadowColor}80) drop-shadow(0 16px 120px ${shadowColor}60) drop-shadow(0 32px 200px ${shadowColor}40)`,
      transition: "filter 0.3s ease-in-out",
    };
  }, [shadowColor]);

  function handleImageLoadError(e: SyntheticEvent<HTMLImageElement, Event>) {
    e.currentTarget.style.display = "none";
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={dynamicStyle}
      onError={handleImageLoadError}
      onLoad={() => {
        // Re-extract colors when image loads to ensure accuracy
        if (!shadowColor) {
          const extractColors = async () => {
            try {
              const vibrant = new Vibrant(src);
              const palette = await vibrant.getPalette();
              const lightVibrant =
                palette.LightVibrant?.hex || palette.Vibrant?.hex;
              if (lightVibrant) {
                setShadowColor(lightVibrant);
              }
            } catch (error) {
              console.error("Error extracting colors from logo:", error);
            }
          };
          extractColors();
        }
      }}
    />
  );
}
