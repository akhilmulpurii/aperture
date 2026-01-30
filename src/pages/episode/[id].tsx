import {
  fetchMediaDetails,
  getImageUrl,
  getServerUrl,
} from "../../actions";
import { MediaActions } from "../../components/media-actions";
import { Star } from "lucide-react";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { RottenTomatoesIcon } from "../../components/icons/rotten-tomatoes";
import { Badge } from "../../components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import LoadingSpinner from "../../components/loading-spinner";
import { MediaDetail } from "../../components/media-page/MediaDetail";
import { SeasonEpisodes } from "../../components/season-episodes";

export default function Episode() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<BaseItemDto | null>(null);
  const [primaryImage, setPrimaryImage] = useState<string>("");
  const [backdropImage, setBackdropImage] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const episodeDetails = await fetchMediaDetails(id);
        if (!episodeDetails) return;

        setEpisode(episodeDetails);

        const [pi, bi, li, server] = await Promise.all([
          getImageUrl(id, "Primary"),
          getImageUrl(id, "Backdrop"),
          getImageUrl(episodeDetails.SeriesId || id, "Logo"),
          getServerUrl(),
        ]);

        setPrimaryImage(pi);
        setBackdropImage(bi || pi); // Episode backdrop is often missing, fallback to primary (landscape thumb)
        setLogoImage(li);
        setServerUrl(server);
      } catch (err: any) {
        console.error(err);
        if (err.message?.includes("Authentication expired")) {
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, navigate]);

  const episodeBadges = useMemo(() => {
    if (!episode) return null;
    return (
      <div className="flex flex-wrap items-center gap-2 mb-2 justify-center md:justify-start md:pl-8">
        {episode.ProductionYear && (
          <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
            {episode.ProductionYear}
          </Badge>
        )}
        {episode.OfficialRating && (
          <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
            {episode.OfficialRating}
          </Badge>
        )}
        {episode.RunTimeTicks && (
          <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
            {Math.round(episode.RunTimeTicks / 600000000)} min
          </Badge>
        )}
        {episode.CommunityRating && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm flex items-center gap-1"
          >
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {episode.CommunityRating.toFixed(1)}
          </Badge>
        )}
        {episode.CriticRating && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm flex items-center gap-1"
          >
            <RottenTomatoesIcon size={12} />
            {episode.CriticRating}%
          </Badge>
        )}
      </div>
    );
  }, [episode]);

  if (loading) return <LoadingSpinner />;
  if (!episode || !id || !serverUrl)
    return <div className="p-4">Error loading Episode. Please try again.</div>;

  return (
    <MediaDetail.Root
      media={episode}
      primaryImage={primaryImage}
      backdropImage={backdropImage}
      logoImage={logoImage}
      serverUrl={serverUrl}
    >
      <MediaDetail.Backdrop />
      <MediaDetail.Main>
        <MediaDetail.Poster />
        <MediaDetail.Content>
          <MediaDetail.Info>
            <div className="flex flex-col">
              <h2 className="text-xl md:text-2xl font-medium text-muted-foreground md:pl-8 mb-1">
                {episode.SeriesName} — S{episode.ParentIndexNumber} E{episode.IndexNumber}
              </h2>
              <h1 className="text-4xl md:text-5xl font-semibold font-poppins text-foreground md:pl-8 drop-shadow-xl mb-4">
                {episode.Name}
              </h1>
              {episodeBadges}
            </div>
          </MediaDetail.Info>

          <MediaDetail.Actions>
            <MediaActions movie={episode} onBeforePlay={() => {}} />
            <MediaDetail.Overview />

            <MediaDetail.Metadata>
              {episode.Studios && episode.Studios.length > 0 && (
                <MediaDetail.MetadataItem label="Studio">
                  <span className="text-sm">
                    {episode.Studios.map((s: any) => s.Name || s).join(", ")}
                  </span>
                </MediaDetail.MetadataItem>
              )}
            </MediaDetail.Metadata>
          </MediaDetail.Actions>
        </MediaDetail.Content>
      </MediaDetail.Main>
      {
        episode.SeasonId && episode.SeriesId &&
        <div className="relative z-10 pl-6 bg-background/95 dark:bg-background/50 backdrop-blur-xl rounded-2xl m-4 py-2 shadow-2xl">
          <SeasonEpisodes showId={episode.SeriesId} currentSeasonId={episode.SeasonId} />
        </div>
      }
      <MediaDetail.Cast />
    </MediaDetail.Root>
  );
}
