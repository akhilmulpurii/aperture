
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models/base-item-dto";
import { Play, Info } from "lucide-react";
import { useMediaPlayer } from "../../contexts/MediaPlayerContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { decode } from "blurhash";

interface HeroSlideProps {
  item: BaseItemDto;
  serverUrl: string;
}

export function HeroSlide({ item, serverUrl }: HeroSlideProps) {
  const { playMedia, setIsPlayerVisible } = useMediaPlayer();
  const navigate = useNavigate();
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const backdropTag = item.BackdropImageTags?.[0];
  const backdropUrl = backdropTag
    ? `${serverUrl}/Items/${item.Id}/Images/Backdrop/0?maxWidth=3840&quality=90`
    : null;

  // Fallback to primary if no backdrop (though unlikely for movies/series)
  const imageUrl = backdropUrl || `${serverUrl}/Items/${item.Id}/Images/Primary?maxWidth=3840&quality=90`;

  const blurHash = item.ImageBlurHashes?.Backdrop?.[backdropTag || ""] || item.ImageBlurHashes?.Primary?.[item.ImageTags?.Primary || ""];

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
      await playMedia({
        id: item.Id!,
        name: item.Name!,
        type: item.Type as "Movie" | "Series" | "Episode",
        resumePositionTicks: item.UserData?.PlaybackPositionTicks,
      });
      setIsPlayerVisible(true);
    }
  };

  const handleDetails = () => {
    const type = item.Type?.toLowerCase();
    if (type === "movie") navigate(`/movie/${item.Id}`);
    else if (type === "series") navigate(`/series/${item.Id}`);
    else if (type === "episode") navigate(`/episode/${item.Id}`);
    else if (type === "season") navigate(`/season/${item.Id}`);
  };

  return (
    <div className="relative w-full h-[65vh] min-h-[500px] overflow-hidden rounded-xl group select-none">
       {/* Background Image / Blur */}
       <div className="absolute inset-0">
          {blurDataUrl && !imageLoaded && (
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-700"
              style={{ backgroundImage: `url(${blurDataUrl})` }}
            />
          )}
          <img
            src={imageUrl}
            alt={item.Name || "Hero Background"}
            className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
            draggable={false}
          />
           {/* Gradient Overlays for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
       </div>

       {/* Content */}
       <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 lg:p-16 flex flex-col items-start justify-end h-full pointer-events-none">
          <div className="max-w-2xl pointer-events-auto space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
             {/* Metadata Badges */}
             <div className="flex items-center gap-3 text-sm font-medium text-white/90">
                {item.ProductionYear && (
                  <Badge variant="outline" className="border-white/30 bg-black/20 backdrop-blur-md text-white">
                    {item.ProductionYear}
                  </Badge>
                )}
                {item.OfficialRating && (
                   <span className="px-2 py-0.5 border border-white/30 rounded text-xs uppercase bg-black/20 backdrop-blur-md">
                      {item.OfficialRating}
                   </span>
                )}
                {item.CommunityRating && (
                    <div className="flex items-center gap-1 text-yellow-400">
                        <span>★</span>
                        <span>{item.CommunityRating.toFixed(1)}</span>
                    </div>
                )}
             </div>

             {/* Title */}
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-lg leading-tight">
                {item.Name}
             </h1>

              {/* Taglines or Genres */}
              {item.Taglines && item.Taglines.length > 0 && (
                  <p className="text-lg text-white/90 italic font-light drop-shadow-md">
                      {item.Taglines[0]}
                  </p>
              )}


             {/* Overview (Truncated) */}
             {item.Overview && (
                <p className="text-white/80 line-clamp-3 text-base md:text-lg max-w-xl drop-shadow-md leading-relaxed">
                   {item.Overview}
                </p>
             )}

             {/* Action Buttons */}
             <div className="flex items-center gap-4 pt-4">
                <Button 
                   size="lg" 
                   onClick={handlePlay}
                   className="bg-white text-black hover:bg-white/90 font-semibold px-8 h-12 rounded-full transition-transform active:scale-95 shadow-xl hover:shadow-2xl hover:shadow-white/10"
                >
                   <Play className="mr-2 h-5 w-5 fill-black" />
                   Play
                </Button>
                <Button 
                   size="lg" 
                   variant="outline" 
                   onClick={handleDetails}
                   className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 px-8 h-12 rounded-full transition-transform active:scale-95"
                >
                   <Info className="mr-2 h-5 w-5" />
                   More Info
                </Button>
             </div>
          </div>
       </div>
    </div>
  );
}
