import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { JellyfinItem } from "../../types/jellyfin";
import { MediaToPlay } from "../../lib/atoms";
import { Button } from "../ui/button";
import { ProgressiveBlur } from "../motion-primitives/progressive-blur";
import DisplayEndTime from "../display-end-time";
import { formatRuntime } from "../../lib/utils";

interface PlayerLoadingOverlayProps {
  isVisible: boolean;
  mediaDetails: JellyfinItem | null;
  currentMedia: MediaToPlay;
  serverUrl: string;
  blurDataUrl: string | null;
  backdropImageLoaded: boolean;
  onBackdropLoaded: () => void;
  onClose: () => void;
  formatEndTime: (currentSeconds: number, durationSeconds: number) => string;
  ticksToSeconds: (ticks: number) => number;
}

export function PlayerLoadingOverlay({
  isVisible,
  mediaDetails,
  currentMedia,
  serverUrl,
  blurDataUrl,
  backdropImageLoaded,
  onBackdropLoaded,
  onClose,
  formatEndTime,
  ticksToSeconds,
}: PlayerLoadingOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-[1000000]">
      <Button
        variant="ghost"
        className="fixed left-4 top-4 z-10 hover:backdrop-blur-md"
        onClick={onClose}
      >
        <ArrowLeft className="h-4 w-4" />
        Go Back
      </Button>

      {mediaDetails ? (
        <div className="relative w-full h-full">
          {!backdropImageLoaded && (
            <div
              className={`w-full h-full object-cover brightness-50 absolute inset-0 transition-opacity duration-300 ${
                blurDataUrl ? "" : "bg-gray-800"
              }`}
              style={
                blurDataUrl
                  ? {
                      backgroundImage: `url(${blurDataUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "brightness(0.5)",
                    }
                  : undefined
              }
            />
          )}

          <img
            src={`${serverUrl}/Items/${
              mediaDetails?.Type === "Episode" && mediaDetails?.SeriesId
                ? mediaDetails.SeriesId
                : currentMedia.id
            }/Images/Backdrop?maxHeight=1080&maxWidth=1920&quality=95`}
            alt={currentMedia?.name}
            className={`w-full h-full object-cover brightness-50 transition-opacity duration-300 ${
              backdropImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={onBackdropLoaded}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
            ref={(img) => {
              if (img && img.complete && img.naturalHeight !== 0) {
                onBackdropLoaded();
              }
            }}
          />
          <ProgressiveBlur
            direction="bottom"
            blurLayers={6}
            blurIntensity={0.3}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="w-full h-full bg-black" />
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute bottom-8 left-8 right-8"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col w-full gap-1.5 pb-2"
        >
          {mediaDetails?.SeriesName && (
            <motion.div
              className="text-sm text-white/70 truncate font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {mediaDetails.SeriesName}
            </motion.div>
          )}

          <div className="flex items-center justify-between w-full">
            <motion.h2
              className="text-3xl font-semibold text-white truncate font-poppins"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {mediaDetails?.Type === "Episode" && mediaDetails?.IndexNumber
                ? `${mediaDetails.IndexNumber}. ${
                    mediaDetails.Name || currentMedia.name
                  }`
                : mediaDetails?.Name || currentMedia.name}
            </motion.h2>

            {mediaDetails?.RunTimeTicks && (
              <DisplayEndTime
                time={formatEndTime(
                  0,
                  ticksToSeconds(mediaDetails.RunTimeTicks)
                )}
              />
            )}
          </div>

          <motion.div
            className="flex items-center gap-3 text-sm text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {mediaDetails?.Type === "Episode" && (
              <div className="space-x-1">
                {mediaDetails?.ParentIndexNumber && (
                  <span>S{mediaDetails.ParentIndexNumber}</span>
                )}
                <span>•</span>
                {mediaDetails?.IndexNumber && (
                  <span>E{mediaDetails.IndexNumber}</span>
                )}
              </div>
            )}

            {mediaDetails?.RunTimeTicks && (
              <span>{formatRuntime(mediaDetails.RunTimeTicks)}</span>
            )}

            {mediaDetails?.ProductionYear && (
              <span>{mediaDetails.ProductionYear}</span>
            )}
          </motion.div>

          <motion.div
            className="flex items-center gap-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-sm text-white/70">Loading...</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
