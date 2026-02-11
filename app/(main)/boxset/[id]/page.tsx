"use client";
import {
  fetchMediaDetails,
  getImageUrl,
  fetchSimilarItems,
  getServerUrl,
  fetchMovieByCollection,
} from "@/src/actions";
import { MediaActions } from "@/src/components/media-actions";
import { Star } from "lucide-react";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { RottenTomatoesIcon } from "@/src/components/icons/rotten-tomatoes";
import { Badge } from "@/src/components/ui/badge";
import { MediaCard } from "@/src/components/media-card";
import { useEffect, useState, useMemo } from "react";
import LoadingSpinner from "@/src/components/loading-spinner";
import { MediaDetail } from "@/src/components/media-page/MediaDetail";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function BoxSet() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [boxset, setBoxset] = useState<BaseItemDto | null>(null);
  const [collectionMovies, setCollectionMovies] = useState<BaseItemDto[]>([]);
  const [similarItems, setSimilarItems] = useState<any[]>([]);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [primaryImage, setPrimaryImage] = useState<string>("");
  const [backdropImage, setBackdropImage] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!id?.trim()) return;
        const boxsetData = await fetchMediaDetails(id);
        const collectionData = await fetchMovieByCollection(id);

        if (!boxsetData || !collectionData) return;

        const [primaryImg, backdropImg, logoImg, similar, srvUrl] =
          await Promise.all([
            getImageUrl(id, "Primary"),
            getImageUrl(id, "Backdrop"),
            boxsetData.ImageTags?.Logo
              ? getImageUrl(id, "Logo")
              : Promise.resolve(""),
            fetchSimilarItems(id, 12),
            getServerUrl(),
          ]);

        setBoxset(boxsetData);
        setCollectionMovies(collectionData);
        setPrimaryImage(primaryImg);
        setBackdropImage(backdropImg);
        setLogoImage(logoImg);
        setSimilarItems(similar);
        setServerUrl(srvUrl);
      } catch (err: any) {
        console.error(err);
        if (err.message?.includes("Authentication expired")) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }
    if (id?.trim()) fetchData();
  }, [id, router]);

  const boxsetBadges = useMemo(() => {
    if (!boxset) return null;
    return (
      <div className="flex flex-wrap items-center gap-2 mb-2 justify-center md:justify-start md:pl-8">
        {boxset.ProductionYear && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm"
          >
            {boxset.ProductionYear}
          </Badge>
        )}
        {boxset.OfficialRating && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm"
          >
            {boxset.OfficialRating}
          </Badge>
        )}
        {boxset.CommunityRating && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm flex items-center gap-1"
          >
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {boxset.CommunityRating.toFixed(1)}
          </Badge>
        )}
        {boxset.CriticRating && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm flex items-center gap-1"
          >
            <RottenTomatoesIcon size={12} />
            {boxset.CriticRating}%
          </Badge>
        )}
      </div>
    );
  }, [boxset]);

  if (loading) return <LoadingSpinner />;
  if (!boxset || !id || !serverUrl)
    return <div className="p-4">Error loading boxset. Please try again.</div>;

  return (
    <MediaDetail.Root
      media={boxset}
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
                {boxset.Name}
              </h1>
              {boxsetBadges}
            </div>
          </MediaDetail.Info>

          <MediaDetail.Actions>
            <MediaActions movie={boxset} onBeforePlay={() => {}} />
            <MediaDetail.Overview />

            <MediaDetail.Metadata>
              {boxset.Genres && boxset.Genres.length > 0 && (
                <MediaDetail.MetadataItem label="Genres">
                  <div className="flex flex-wrap gap-1">
                    {boxset.Genres.map((genre) => (
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

              {boxset.People && (
                <>
                  {boxset.People.filter((p) => p.Type === "Director").length >
                    0 && (
                    <MediaDetail.MetadataItem label="Director">
                      <div className="flex flex-wrap gap-1">
                        {boxset.People.filter((p) => p.Type === "Director").map(
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

                  {boxset.People.filter((p) => p.Type === "Writer").length >
                    0 && (
                    <MediaDetail.MetadataItem label="Writers">
                      <div className="flex flex-wrap gap-1">
                        {boxset.People.filter((p) => p.Type === "Writer").map(
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

              {boxset.Studios && boxset.Studios.length > 0 && (
                <MediaDetail.MetadataItem label="Studio">
                  <span className="text-sm">
                    {boxset.Studios.map((s: any) => s.Name || s).join(", ")}
                  </span>
                </MediaDetail.MetadataItem>
              )}
            </MediaDetail.Metadata>
          </MediaDetail.Actions>
        </MediaDetail.Content>
      </MediaDetail.Main>

      <div className="px-6 mx-auto">
        <h2 className="text-3xl font-semibold font-poppins text-foreground mt-12 mb-6 text-center md:text-left">
          Movies
        </h2>
        <div className="mt-8 flex flex-row flex-wrap gap-8 justify-center md:justify-start">
          {collectionMovies.map((movie) => (
            <MediaCard
              key={movie.Id}
              item={{
                Id: movie.Id,
                Name: movie.Name || `Movie ${movie.IndexNumber}`,
                Type: "Movie",
                ProductionYear: movie.ProductionYear,
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
