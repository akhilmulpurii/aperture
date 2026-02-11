"use client";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models/base-item-dto";
import { Play, Info } from "lucide-react";
import { usePlayback } from "../../hooks/usePlayback";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { decode } from "blurhash";
import { OptimizedImage } from "../optimized-image";
import { useRouter } from "next/navigation";

interface HeroSlideProps {
  item: BaseItemDto;
  serverUrl: string;
}

export function HeroSlide({ item, serverUrl }: HeroSlideProps) {
  const { play } = usePlayback();
  const router = useRouter();
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const backdropTag = item.BackdropImageTags?.[0];
  const backdropUrl = backdropTag
    ? `${serverUrl}/Items/${item.Id}/Images/Backdrop/0?maxWidth=3840&quality=90`
    : null;

  const imageUrl =
    backdropUrl ||
    `${serverUrl}/Items/${item.Id}/Images/Primary?maxWidth=3840&quality=90`;

  const logoTag = item.ImageTags?.Logo || item.ParentLogoImageTag;
  const logoItemId = item.ImageTags?.Logo ? item.Id : item.ParentLogoItemId;
  const logoUrl =
    logoTag && logoItemId
      ? `${serverUrl}/Items/${logoItemId}/Images/Logo?maxWidth=500&quality=90&tag=${logoTag}`
      : null;

  const blurHash =
    item.ImageBlurHashes?.Backdrop?.[backdropTag || ""] ||
    item.ImageBlurHashes?.Primary?.[item.ImageTags?.Primary || ""];

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

  const handlePlay = async () => {
    if (item && item.Type !== "BoxSet") {
      play({
        id: item.Id!,
        name: item.Name!,
        type: item.Type as "Movie" | "Series" | "Episode",
        resumePositionTicks: item.UserData?.PlaybackPositionTicks,
      });
    }
  };

  const handleDetails = () => {
    const type = item.Type?.toLowerCase();
    if (type === "movie") router.push(`/movie/${item.Id}`);
    else if (type === "series") router.push(`/series/${item.Id}`);
    else if (type === "episode") router.push(`/episode/${item.Id}`);
    else if (type === "season") router.push(`/season/${item.Id}`);
  };

  return (
    <div className="relative w-full h-[60vh] min-h-100 max-h-150 overflow-hidden rounded-xl group select-none shadow-lg border border-border bg-card">
      {/* Background Image / Blur */}
      <div className="absolute inset-0 overflow-hidden rounded-xl z-0">
        {blurDataUrl && !imageLoaded && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-top transition-opacity duration-1000"
            style={{ backgroundImage: `url(${blurDataUrl})` }}
          />
        )}

        {/* Wrapper for Ken Burns Effect */}
        <div className="w-full h-full animate-ken-burns">
          <OptimizedImage
            src={imageUrl}
            alt={item.Name || "Hero Background"}
            className={`w-full h-full object-cover object-top transition-opacity duration-1000 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            draggable={false}
          />
        </div>

        {/* Cinematic Gradient Overlays */}
        {/* Complex gradient map for clearer text and interesting visual */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full px-16 py-8 md:px-20 md:py-12 lg:px-24 lg:py-16 flex flex-col items-start justify-end h-full pointer-events-none">
        <div className="max-w-4xl pointer-events-auto space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          {/* Logo or Title */}
          {logoUrl ? (
            <OptimizedImage
              src={logoUrl}
              alt={item.Name || "Logo"}
              className={`h-20 md:h-28 lg:h-32 w-auto object-contain object-bottom-left drop-shadow-2xl transition-opacity duration-700 ${
                logoLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setLogoLoaded(true)}
            />
          ) : (
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight font-poppins drop-shadow-lg">
              {item.Name}
            </h1>
          )}
          {/* Metadata Badges */}
          {!logoUrl && <div className="h-2" />} {/* Spacer if no logo */}
          <div className="flex items-center flex-wrap gap-3 text-sm font-medium text-white/90">
            {item.ProductionYear && (
              <Badge
                variant="secondary"
                className="backdrop-blur-md shadow-sm bg-white/20 text-white border-white/20 hover:bg-white/30"
              >
                {item.ProductionYear}
              </Badge>
            )}
            {item.OfficialRating && (
              <span className="px-2 py-0.5 border border-white/20 rounded text-xs uppercase bg-black/40 backdrop-blur-md shadow-sm text-white">
                {item.OfficialRating}
              </span>
            )}
            {item.CommunityRating && (
              <div className="flex items-center gap-1 text-yellow-400">
                <span>★</span>
                <span className="font-semibold text-white">
                  {item.CommunityRating.toFixed(1)}
                </span>
              </div>
            )}
            {item.RunTimeTicks && (
              <span className="text-white/70 text-xs shadow-black/50 drop-shadow-sm">
                {Math.round(item.RunTimeTicks / 600000000)} min
              </span>
            )}
          </div>
          {/* Taglines or Genres */}
          {item.Taglines && item.Taglines.length > 0 && (
            <p className="text-lg text-white/95 italic font-light drop-shadow-md">
              {item.Taglines[0]}
            </p>
          )}
          {/* Overview (Truncated) */}
          {item.Overview && (
            <p className="text-white/80 line-clamp-3 text-sm md:text-base max-w-xl leading-relaxed font-sans drop-shadow-md">
              {item.Overview}
            </p>
          )}
          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={handlePlay}
              className="font-bold px-8 h-10 rounded-lg shadow-md hover:scale-105 transition-all duration-300"
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              Play
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleDetails}
              className="border border-border backdrop-blur-md px-8 h-10 rounded-lg hover:bg-secondary/80 hover:scale-105 transition-all duration-300"
            >
              <Info className="mr-2 h-4 w-4" />
              More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
