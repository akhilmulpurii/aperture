import { useState, SyntheticEvent, ImgHTMLAttributes, useEffect } from "react";
import { cn } from "../lib/utils";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function OptimizedImage({
  className,
  src,
  alt,
  onLoad,
  onError,
  fallbackSrc = "/placeholder.png", // We don't have a real one yet, but better than broken
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
    // Return a fallback div if image failed
    return (
        <div className={cn("flex items-center justify-center bg-gray-800 text-white/50 text-xs", className)}>
            <span>Error</span>
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
        className
      )}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
}
