import React, { useEffect, useState } from "react";
import {
  BaseItemDto,
  BaseItemKind,
} from "@jellyfin/sdk/lib/generated-client/models";
import { getImageUrl } from "../../actions";
import { Loader2, ArrowLeft } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import { TextScramble } from "../../components/motion-primitives/text-scramble";
import { Button } from "../../components/ui/button";

interface VideoSplashLoaderProps {
  item: BaseItemDto | null;
  isVisible: boolean;
  onClose?: () => void;
}

export const VideoSplashLoader: React.FC<VideoSplashLoaderProps> = ({
  item,
  isVisible,
  onClose,
}) => {
  const [backdropUrl, setBackdropUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const itemId = [
      BaseItemKind.Series,
      BaseItemKind.Season,
      BaseItemKind.Episode,
    ].includes(item?.Type as any)
      ? item?.SeriesId
      : item?.Id;
    if (itemId) {
      getImageUrl(itemId, "Backdrop").then(setBackdropUrl);
      getImageUrl(itemId, "Logo").then(setLogoUrl);
    }
  }, [item?.Id, item?.SeriesId, item?.Type]);

  return (
    <AnimatePresence>
      {isVisible && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="absolute inset-0 z-60 bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Back Button */}
          <div className="absolute top-4 left-4 z-50">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="w-8 h-8 text-white" />
            </Button>
          </div>

          {/* Backdrop */}
          {backdropUrl && (
            <div className="absolute inset-0 z-0">
              <img
                src={backdropUrl}
                alt=""
                className="w-full h-full object-cover opacity-40 blur-sm scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-radial-gradient from-transparent to-black" />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center max-w-4xl">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={item.Name || ""}
                className="h-24 md:h-32 object-contain drop-shadow-2xl"
              />
            ) : (
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-2xl">
                {item.Name}
              </h1>
            )}

            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 text-white/70 animate-spin" />
              {item.Taglines && item.Taglines.length > 0 ? (
                <TextScramble className="text-sm font-medium text-white/70 tracking-widest uppercase">
                  {item.Taglines[0]}
                </TextScramble>
              ) : (
                <span className="text-sm font-medium text-white/70 tracking-widest uppercase">
                  Loading Stream
                </span>
              )}
            </div>

            {/* Tech Specs Badges (Mock/Real) */}
            <div className="flex gap-2 opacity-50">
              {item.ProductionYear && (
                <Badge
                  variant="outline"
                  className="text-xs border-white/20 text-white/60"
                >
                  {item.ProductionYear}
                </Badge>
              )}
              {(item as any).OfficialRating && (
                <Badge
                  variant="outline"
                  className="text-xs border-white/20 text-white/60"
                >
                  {(item as any).OfficialRating}
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
