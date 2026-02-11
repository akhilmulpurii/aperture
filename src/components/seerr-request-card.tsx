"use client"
import React, { Fragment, useState } from "react";
import { SeerrRequestModal } from "./seerr-request-modal";
import { useSeerr } from "@/src/contexts/seerr-context";
import { SeerrRequestItem } from "@/src/types/seerr-types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { OptimizedImage } from "./optimized-image";
import { useRouter } from "next/navigation";

interface SeerrRequestCardProps {
  item: SeerrRequestItem;
}

export function SeerrRequestCard({ item }: SeerrRequestCardProps) {
  const { canManageRequests, serverUrl } = useSeerr();
  const router = useRouter();
  const [_, setIsLoaded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(item.status);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const avatarUrl = item.requestedBy?.avatar?.startsWith("http")
    ? item.requestedBy.avatar
    : `${serverUrl}${item.requestedBy?.avatar}`;
  const mediaVal = (item.mediaMetadata || item.media) as any;
  const mediaInfo = item.media;
  const title = mediaVal?.title || mediaVal?.name || "Unknown Title";
  const date = mediaVal?.releaseDate || mediaVal?.firstAirDate;
  const year = date ? new Date(date).getFullYear() : undefined;
  const tmdbId = mediaVal?.tmdbId || mediaVal?.id || mediaInfo?.tmdbId;

  const handleCardClick = () => {
    if (
      (mediaInfo?.status === 4 || mediaInfo?.status === 5) &&
      mediaInfo.jellyfinMediaId
    ) {
      if (item.type === "movie") {
        router.push(`/movie/${mediaInfo.jellyfinMediaId}`);
        return;
      } else if (item.type === "tv") {
        router.push(`/series/${mediaInfo.jellyfinMediaId}`);
        return;
      }
    }

    setIsModalOpen(true);
  };

  const imageUrl = mediaVal?.backdropPath
    ? `https://image.tmdb.org/t/p/w780${mediaVal.backdropPath}`
    : mediaVal?.posterPath
      ? `https://image.tmdb.org/t/p/w500${mediaVal.posterPath}`
      : undefined;

  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const { approveSeerrRequest } = await import("../actions/seerr");
      await approveSeerrRequest(item.id);
      setLocalStatus(2); // 2 = APPROVED
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const { declineSeerrRequest } = await import("../actions/seerr");
      await declineSeerrRequest(item.id);
      setLocalStatus(3); // 3 = DECLINED
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusElement = () => {
    // Media Status (Availability)
    if (mediaInfo?.status === 5) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          Available
        </Badge>
      );
    }
    if (mediaInfo?.status === 4) {
      return (
        <Badge
          variant="secondary"
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Partially Available
        </Badge>
      );
    }

    // Request Status
    if (localStatus === 1) {
      const pendingBadge = (
        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
          Pending
        </Badge>
      );

      if (canManageRequests) {
        return (
          <div className="flex items-center gap-2">
            {pendingBadge}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                onClick={handleApprove}
                disabled={actionLoading}
                title="Approve"
              >
                <div className="flex items-center justify-center rounded-full border border-current p-0.5">
                  <Check className="h-3 w-3" />
                </div>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={handleDecline}
                disabled={actionLoading}
                title="Decline"
              >
                <div className="flex items-center justify-center rounded-full border border-current p-0.5">
                  <div className="h-3 w-3 flex items-center justify-center font-bold leading-none">
                    ✕
                  </div>
                </div>
              </Button>
            </div>
          </div>
        );
      }
      return pendingBadge;
    }
    switch (localStatus) {
      case 2:
        return (
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            Approved
          </Badge>
        );
      case 3:
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return null;
    }
  };

  return (
    <Fragment>
      <div
        onClick={handleCardClick}
        className="block group w-72 flex-shrink-0 cursor-pointer"
      >
        <div className="relative aspect-[16/9] overflow-hidden rounded-md border bg-muted">
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={() => setIsLoaded(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-card text-muted-foreground">
              {title}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
            {/* Content placed over image for improved aesthetics in landscape card */}
          </div>
        </div>

        <div className="mt-3 space-y-1.5 px-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {year}
            </span>
            {getStatusElement()}
          </div>

          <h3
            className="font-semibold text-foreground truncate leading-tight"
            title={title}
          >
            {title}
          </h3>

          <div className="flex items-center gap-2 pt-1">
            <Avatar className="h-5 w-5 border border-border">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-[9px]">
                {item.requestedBy?.displayName?.substring(0, 2).toUpperCase() ||
                  "??"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              Requested by{" "}
              <span className="font-medium text-foreground">
                {item.requestedBy?.displayName}
              </span>
            </span>
          </div>
        </div>
      </div>

      <SeerrRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tmdbId={tmdbId}
        mediaType={item.type as "movie" | "tv"}
      />
    </Fragment>
  );
}
