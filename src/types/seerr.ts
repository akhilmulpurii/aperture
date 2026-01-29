import { components } from "./seerr.d";

export type MovieDetails = components["schemas"]["MovieDetails"];
export type TvDetails = components["schemas"]["TvDetails"];
export type MediaInfo = components["schemas"]["MediaInfo"];

export type SeerrMediaItem = (MovieDetails | TvDetails) & {
  mediaType: "movie" | "tv";
  id?: number;
  tmdbId?: number;
  title?: string;
  name?: string;
  releaseDate?: string;
  firstAirDate?: string;
  posterPath?: string;
  backdropPath?: string;
  mediaInfo?: MediaInfo;
};

export interface SeerrResponse<T> {
  page?: number;
  totalPages?: number;
  totalResults?: number;
  results: T[];
}
