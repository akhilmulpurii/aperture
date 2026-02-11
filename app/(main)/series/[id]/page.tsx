"use client";
import {
  fetchMediaDetails,
  getImageUrl,
  fetchSimilarItems,
  getServerUrl,
} from "@/src/actions";
import { MediaActions } from "@/src/components/media-actions";
import { SeriesPlayButton } from "@/src/components/series-play-button";
import { Star } from "lucide-react";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { RottenTomatoesIcon } from "@/src/components/icons/rotten-tomatoes";
import { Badge } from "@/src/components/ui/badge";
import { fetchSeasons } from "@/src/actions";
import { MediaCard } from "@/src/components/media-card";
import { useEffect, useState, useMemo } from "react";
import LoadingSpinner from "@/src/components/loading-spinner";
import { MediaDetail } from "@/src/components/media-page/MediaDetail";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function Show() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [show, setShow] = useState<BaseItemDto | null>(null);
  const [seasons, setSeasons] = useState<BaseItemDto[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string>("");
  const [backdropImage, setBackdropImage] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");
  const [similarItems, setSimilarItems] = useState<BaseItemDto[]>([]);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const url = await getServerUrl();
        setServerUrl(url);

        const showData = await fetchMediaDetails(id);
        console.log("Show data:", showData);
        const seasonsData = await fetchSeasons(id);
        console.log("Seasons data:", seasonsData);
        if (!showData || !seasonsData) return;

        setShow(showData);
        setSeasons(seasonsData);

        const pi = await getImageUrl(id, "Primary");
        const bi = await getImageUrl(id, "Backdrop");
        const li = await getImageUrl(id, "Logo");

        setPrimaryImage(pi);
        setBackdropImage(bi);
        setLogoImage(li);

        const simItems = await fetchSimilarItems(id, 12);
        setSimilarItems(simItems);
      } catch (err: any) {
        console.error(err);
        if (err.message?.includes("Authentication expired")) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, router]);

  const showBadges = useMemo(() => {
    if (!show) return null;
    return (
      <div className="flex flex-wrap items-center gap-2 mb-2 justify-center md:justify-start md:pl-8">
        {show.ProductionYear && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm"
          >
            {show.ProductionYear}
          </Badge>
        )}
        {show.OfficialRating && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm"
          >
            {show.OfficialRating}
          </Badge>
        )}
        {show.CommunityRating && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm flex items-center gap-1"
          >
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {show.CommunityRating.toFixed(1)}
          </Badge>
        )}
        {show.CriticRating && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm flex items-center gap-1"
          >
            <RottenTomatoesIcon size={12} />
            {show.CriticRating}%
          </Badge>
        )}
      </div>
    );
  }, [show]);

  if (loading) return <LoadingSpinner />;
  if (!show || !id || !serverUrl)
    return <div className="p-4">Error loading Series. Please try again.</div>;

  return (
    <MediaDetail.Root
      media={show}
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
              <h1 className="text-4xl md:text-5xl font-semibold font-poppins text-foreground md:pl-8 drop-shadow-xl mb-4">
                {show.Name}
              </h1>
              {showBadges}
            </div>
          </MediaDetail.Info>

          <MediaDetail.Actions>
            <div className="flex items-center gap-2 mb-4 w-full justify-center md:justify-start">
              <SeriesPlayButton series={show} onBeforePlay={() => {}} />
            </div>
            <MediaActions movie={show} onBeforePlay={() => {}} />
            <MediaDetail.Overview />

            <MediaDetail.Metadata>
              {show.Genres && show.Genres.length > 0 && (
                <MediaDetail.MetadataItem label="Genres">
                  <div className="flex flex-wrap gap-1">
                    {show.Genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="text-xs"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </MediaDetail.MetadataItem>
              )}

              {show.People && (
                <>
                  {show.People.filter((p) => p.Type === "Director").length >
                    0 && (
                    <MediaDetail.MetadataItem label="Director">
                      <div className="flex flex-wrap gap-1">
                        {show.People.filter((p) => p.Type === "Director").map(
                          (director, i, arr) => (
                            <span key={director.Id} className="text-sm">
                              <Link
                                href={`/person/${director.Id}`}
                                className="hover:underline cursor-pointer"
                              >
                                {director.Name}
                              </Link>
                              {i < arr.length - 1 && ", "}
                            </span>
                          ),
                        )}
                      </div>
                    </MediaDetail.MetadataItem>
                  )}

                  {show.People.filter((p) => p.Type === "Writer").length >
                    0 && (
                    <MediaDetail.MetadataItem label="Writers">
                      <div className="flex flex-wrap gap-1">
                        {show.People.filter((p) => p.Type === "Writer").map(
                          (writer, i, arr) => (
                            <span key={writer.Id} className="text-sm">
                              <Link
                                href={`/person/${writer.Id}`}
                                className="hover:underline cursor-pointer"
                              >
                                {writer.Name}
                              </Link>
                              {i < arr.length - 1 && ", "}
                            </span>
                          ),
                        )}
                      </div>
                    </MediaDetail.MetadataItem>
                  )}
                </>
              )}

              {show.Studios && show.Studios.length > 0 && (
                <MediaDetail.MetadataItem label="Studio">
                  <span className="text-sm">
                    {show.Studios.map((s: any) => s.Name || s).join(", ")}
                  </span>
                </MediaDetail.MetadataItem>
              )}
            </MediaDetail.Metadata>
          </MediaDetail.Actions>
        </MediaDetail.Content>
      </MediaDetail.Main>

      <div className="px-6 mx-auto">
        <h2 className="text-3xl font-semibold font-poppins text-foreground mt-12 mb-6 text-center md:text-left">
          Seasons
        </h2>
        <div className="mt-8 flex flex-row flex-wrap gap-8 justify-center md:justify-start">
          {seasons.map((season) => (
            <MediaCard
              key={season.Id}
              item={{
                Id: season.Id,
                Name: season.Name || `Season ${season.IndexNumber}`,
                Type: "Season",
                ProductionYear: season.ProductionYear,
              }}
              serverUrl={serverUrl}
            />
          ))}
        </div>
      </div>

      <MediaDetail.Cast />
      <MediaDetail.Similar items={similarItems} />
    </MediaDetail.Root>
  );
}
