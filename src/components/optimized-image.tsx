"use client";
import { useState, SyntheticEvent, ImgHTMLAttributes, useEffect } from "react";
import { cn } from "../lib/utils";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  showMissingLabel?: boolean;
}

export function OptimizedImage({
  className,
  src,
  alt,
  onLoad,
  onError,
  fallbackSrc,
  showMissingLabel = false,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(e);
  };

  if (hasError) {
    // If a fallback image/data-url was provided, render it; otherwise show a neutral placeholder
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          loading="lazy"
          className={cn("transition-opacity duration-500 opacity-100", className)}
          onError={() => setHasError(true)}
          {...props}
        />
      );
    }

    return (
      <div
        className={cn(
          "flex items-center justify-center bg-black text-white text-sm font-bold",
          className,
        )}
      >
        <span className="select-none">{showMissingLabel ? "MISSING EPISODE" : "No image"}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn(
        "transition-opacity duration-500",
        isLoaded ? "opacity-100" : "opacity-0",
        className,
      )}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
}
