"use client"
import React, { useMemo, useState, useCallback } from "react";
import { OptimizedImage } from "./optimized-image";
import { SeerrMediaItem } from "../types/seerr-types";
import { Badge } from "./ui/badge";
import { Check, Clock } from "lucide-react";
import { SeerrRequestModal } from "./seerr-request-modal";
import Link from "next/link";

interface SeerrCardProps {
  item: SeerrMediaItem;
  width?: string;
  aspectRatio?: string;
}

export const SeerrCard = React.memo(function SeerrCard({
  item,
  width = "w-36",
  aspectRatio = "aspect-[2/3]",
}: SeerrCardProps) {
  const [_, setImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const title = item.title || item.name || "Unknown Title";
  const date = item.releaseDate || item.firstAirDate;
  const year = date ? new Date(date).getFullYear() : undefined;

  const posterUrl = item.posterPath
    ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
    : undefined;

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const getStatusBadge = () => {
    if (item.mediaType === "tv" && item.mediaInfo?.status === 4) {
      return (
        <div className="absolute top-2 right-2 z-20">
          <Badge
            variant="secondary"
            className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-yellow-500/80 backdrop-blur-sm text-white border-none"
          >
            <Clock className="h-3.5 w-3.5" />
          </Badge>
        </div>
      );
    }

    if (
      item.mediaInfo?.jellyfinMediaId ||
      item.mediaInfo?.status === 4 ||
      item.mediaInfo?.status === 5
    ) {
      return (
        <div className="absolute top-2 right-2 z-20">
          <Badge
            variant="secondary"
            className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-green-500/80 backdrop-blur-sm text-white border-none"
          >
            <Check className="h-3.5 w-3.5" />
          </Badge>
        </div>
      );
    }

    return null;
  };

  const linkHref = useMemo(() => {
    if (item.mediaInfo?.jellyfinMediaId) {
      if (item.mediaType === "movie") {
        return `/movie/${item.mediaInfo.jellyfinMediaId}`;
      } else if (item.mediaType === "tv") {
        return `/series/${item.mediaInfo.jellyfinMediaId}`;
      }
    }
    return "#";
  }, [item]);

  const handleClick = (e: React.MouseEvent) => {
    if (linkHref === "#") {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={`cursor-pointer group overflow-hidden transition select-none ${width}`}
      >
        <div
          className={`relative w-full border rounded-md overflow-hidden active:scale-[0.98] transition bg-muted ${aspectRatio}`}
        >
          <Link
            href={linkHref}
            onClick={handleClick}
            draggable={false}
            className="block w-full h-full"
          >
            <div className="absolute top-2 left-2 z-20">
              <Badge
                variant="outline"
                className="bg-black/60 text-white border-white/20 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 h-6 rounded-md uppercase tracking-wide"
              >
                {item.mediaType === "tv" ? "TV" : "Movie"}
              </Badge>
            </div>
            {getStatusBadge()}

            {posterUrl ? (
              <OptimizedImage
                src={posterUrl}
                alt={title}
                className="w-full h-full object-cover transition-opacity duration-300 shadow-lg group-hover:shadow-md rounded-md"
                onLoad={handleImageLoad}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-card text-muted-foreground p-2 text-center text-xs">
                {title}
              </div>
            )}

            <div
              className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 pointer-events-none rounded-md`}
            />
          </Link>
        </div>

        <Link href={linkHref} onClick={handleClick} draggable={false}>
          <div className="px-1">
            <div className="mt-2.5 text-sm font-medium text-foreground truncate group-hover:underline">
              {title}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {year || (item.mediaType === "tv" ? "Series" : "Movie")}
            </div>
          </div>
        </Link>
      </div>

      <SeerrRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tmdbId={(item.tmdbId || item.id) ?? 0}
        mediaType={item.mediaType || "movie"}
      />
    </>
  );
});
