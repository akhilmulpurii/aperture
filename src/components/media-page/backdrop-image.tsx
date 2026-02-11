"use client";
import React, { useState, useEffect } from "react";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { decode } from "blurhash";
import { OptimizedImage } from "../optimized-image";

interface BackdropImageProps {
  movie: BaseItemDto;
  backdropImage: string;
  className?: string;
  width?: number;
  height?: number;
}

export function BackdropImage({
  movie,
  backdropImage,
  className = "w-full h-full object-cover",
  width = 1920,
  height = 1080,
}: BackdropImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null);

  // Get blur hash for backdrop
  // Use ParentBackdropImageTags for episodes, BackdropImageTags for other media types
  const backdropImageTag =
    movie.Type === "Episode"
      ? movie.ParentBackdropImageTags?.[0]
      : movie.BackdropImageTags?.[0];
  const blurHash =
    movie.ImageBlurHashes?.["Backdrop"]?.[backdropImageTag!] || "";

  // Decode blur hash
  useEffect(() => {
    if (blurHash && !blurDataUrl) {
      try {
        const pixels = decode(blurHash, 32, 32);
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const imageData = ctx.createImageData(32, 32);
          imageData.data.set(pixels);
          ctx.putImageData(imageData, 0, 0);
          setBlurDataUrl(canvas.toDataURL());
        }
      } catch (error) {
        console.error("Error decoding blur hash:", error);
      }
    }
  }, [blurHash, blurDataUrl]);

  return (
    <>
      {/* Blur hash placeholder or loading placeholder */}
      {!imageLoaded && (
        <div
          className={`${className} absolute inset-0 transition-opacity duration-300 ${
            blurDataUrl ? "" : "bg-gray-800"
          }`}
          style={
            blurDataUrl
              ? {
                  backgroundImage: `url(${blurDataUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(0px)",
                }
              : undefined
          }
        />
      )}

      {/* Actual backdrop image */}
      <OptimizedImage
        className={`${className} transition-opacity duration-300`}
        src={backdropImage}
        alt={`${movie.Name} backdrop`}
        width={width}
        height={height}
        onLoad={() => {
          setImageLoaded(true);
        }}
        onError={() => {
          console.error("Failed to load backdrop image");
        }}
      />
    </>
  );
}
