"use client";
import {
  fetchMediaDetails,
  getImageUrl,
  fetchSimilarItems,
  getServerUrl,
} from "@/src/actions";
import { MediaActions } from "@/src/components/media-actions";
import { Star } from "lucide-react";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { RottenTomatoesIcon } from "@/src/components/icons/rotten-tomatoes";
import { Badge } from "@/src/components/ui/badge";
import { useEffect, useState, useMemo } from "react";
import LoadingSpinner from "@/src/components/loading-spinner";
import { MediaDetail } from "@/src/components/media-page/MediaDetail";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function Movie() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<BaseItemDto | null>(null);
  const [primaryImage, setPrimaryImage] = useState<string>("");
  const [backdropImage, setBackdropImage] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");
  const [similarItems, setSimilarItems] = useState<any[]>([]);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const movieDetails = await fetchMediaDetails(id);
        if (!movieDetails) return;

        setMovie(movieDetails);

        const [pi, bi, li, simItems, server] = await Promise.all([
          getImageUrl(id, "Primary"),
          getImageUrl(id, "Backdrop"),
          getImageUrl(id, "Logo"),
          fetchSimilarItems(id, 12),
          getServerUrl(),
        ]);

        setPrimaryImage(pi);
        setBackdropImage(bi);
        setLogoImage(li);
        setSimilarItems(simItems);
        setServerUrl(server);
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

  const movieBadges = useMemo(() => {
    if (!movie) return null;
    return (
      <div className="flex flex-wrap items-center gap-2 mb-2 justify-center md:justify-start md:pl-8">
        {movie.ProductionYear && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm"
          >
            {movie.ProductionYear}
          </Badge>
        )}
        {movie.OfficialRating && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm"
          >
            {movie.OfficialRating}
          </Badge>
        )}
        {movie.RunTimeTicks && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm"
          >
            {Math.round(movie.RunTimeTicks / 600000000)} min
          </Badge>
        )}
        {movie.CommunityRating && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm flex items-center gap-1"
          >
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {movie.CommunityRating.toFixed(1)}
          </Badge>
        )}
        {movie.CriticRating && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm flex items-center gap-1"
          >
            <RottenTomatoesIcon size={12} />
            {movie.CriticRating}%
          </Badge>
        )}
      </div>
    );
  }, [movie]);

  if (loading) return <LoadingSpinner />;
  if (!movie || !id || !serverUrl)
    return <div className="p-4">Error loading Movie. Please try again.</div>;

  return (
    <MediaDetail.Root
      media={movie}
      primaryImage={primaryImage}
      backdropImage={backdropImage}
      logoImage={logoImage}
      serverUrl={serverUrl}
      auroraFromPoster
    >
      <MediaDetail.Backdrop />
      <MediaDetail.Main>
        <MediaDetail.Poster />
        <MediaDetail.Content>
          <MediaDetail.Info>
            <div className="flex flex-col">
              <h1 className="text-4xl md:text-5xl font-semibold font-poppins text-foreground md:pl-8 drop-shadow-xl mb-4">
                {movie.Name}
              </h1>
              {movieBadges}
            </div>
          </MediaDetail.Info>

          <MediaDetail.Actions>
            <MediaActions
              movie={movie}
              onBeforePlay={
                MediaDetail.Backdrop.name === "Backdrop" ? undefined : undefined
              }
            />
            <MediaDetail.Overview />

            <MediaDetail.Metadata>
              {movie.Genres && movie.Genres.length > 0 && (
                <MediaDetail.MetadataItem label="Genres">
                  <div className="flex flex-wrap gap-1">
                    {movie.Genres.map((genre) => (
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

              {movie.People && (
                <>
                  {movie.People.filter((p) => p.Type === "Director").length >
                    0 && (
                    <MediaDetail.MetadataItem label="Director">
                      <div className="flex flex-wrap gap-1">
                        {movie.People.filter((p) => p.Type === "Director").map(
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

                  {movie.People.filter((p) => p.Type === "Writer").length >
                    0 && (
                    <MediaDetail.MetadataItem label="Writers">
                      <div className="flex flex-wrap gap-1">
                        {movie.People.filter((p) => p.Type === "Writer").map(
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

              {movie.Studios && movie.Studios.length > 0 && (
                <MediaDetail.MetadataItem label="Studio">
                  <span className="text-sm">
                    {movie.Studios.map((s: any) => s.Name || s).join(", ")}
                  </span>
                </MediaDetail.MetadataItem>
              )}
            </MediaDetail.Metadata>
          </MediaDetail.Actions>
        </MediaDetail.Content>
      </MediaDetail.Main>

      <MediaDetail.Cast />
      <MediaDetail.Similar items={similarItems} />
    </MediaDetail.Root>
  );
}
