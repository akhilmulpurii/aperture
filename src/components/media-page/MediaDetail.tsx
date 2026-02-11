"use client";
import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { VibrantAuroraBackground } from "../vibrant-aurora-background";
import { useThemeMedia } from "../../hooks/useThemeMedia";
import { SearchBar } from "../search-component";
import { ThemeMediaControls } from "./ThemeMediaControls";
import { VibrantLogo } from "../vibrant-logo";
import { BackdropImage } from "./backdrop-image";
import { PosterImage } from "./poster-image";
import { TextAnimate } from "../magicui/text-animate";
import { TextScramble } from "../motion-primitives/text-scramble";
import { CastScrollArea } from "../cast-scrollarea";
import { MediaSection } from "../media-section";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface MediaDetailContextType {
  media: BaseItemDto;
  primaryImage: string;
  backdropImage: string;
  logoImage: string;
  serverUrl: string;
  themeMedia: ReturnType<typeof useThemeMedia>;
}

const MediaDetailContext = createContext<MediaDetailContextType | null>(null);

export function useMediaDetail() {
  const context = useContext(MediaDetailContext);
  if (!context) {
    throw new Error("useMediaDetail must be used within a MediaDetail.Root");
  }
  return context;
}

interface MediaDetailRootProps {
  media: BaseItemDto;
  primaryImage: string;
  backdropImage: string;
  logoImage: string;
  serverUrl: string;
  children: ReactNode;
  auroraFromPoster?: boolean;
}

/**
 * Root Component - Provides context and overall layout shell
 */
function Root({
  media,
  primaryImage,
  backdropImage,
  logoImage,
  serverUrl,
  children,
  auroraFromPoster = false,
}: MediaDetailRootProps) {
  const themeMedia = useThemeMedia(media.Id);

  const value = useMemo(
    () => ({
      media,
      primaryImage,
      backdropImage,
      logoImage,
      serverUrl,
      themeMedia,
    }),
    [media, primaryImage, backdropImage, logoImage, serverUrl, themeMedia],
  );

  return (
    <MediaDetailContext.Provider value={value}>
      <div className="min-h-screen overflow-hidden md:pr-1 pb-8">
        <VibrantAuroraBackground
          posterUrl={auroraFromPoster ? primaryImage : backdropImage}
          className="fixed inset-0 z-10 pointer-events-none opacity-50"
        />
        {children}
      </div>
    </MediaDetailContext.Provider>
  );
}

/**
 * Backdrop Component - Manages video/image switching, controls, and logo
 */
function Backdrop() {
  const { media, logoImage, backdropImage, themeMedia } = useMediaDetail();
  const {
    themeVideoUrl,
    videoRef,
    showThemeVideo,
    shouldShowBackdropImage,
    handleVideoCanPlay,
    handleVideoEnded,
    handleVideoError,
    isMuted,
    isPlaying,
    toggleMute,
    togglePlay,
    hasThemeMedia,
    isPlayerActive,
  } = themeMedia;

  return (
    <div className="relative">
      <div className="relative h-[50vh] md:h-[70vh] overflow-hidden md:rounded-xl md:mt-2.5">
        <div className="absolute inset-0 z-0">
          {themeVideoUrl && (
            <video
              key={themeVideoUrl}
              ref={videoRef}
              src={themeVideoUrl}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                showThemeVideo ? "opacity-100" : "opacity-0"
              }`}
              playsInline
              autoPlay
              onCanPlay={handleVideoCanPlay}
              onEnded={handleVideoEnded}
              onError={handleVideoError}
            />
          )}
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              shouldShowBackdropImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <BackdropImage
              movie={media}
              backdropImage={backdropImage}
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
            />
          </div>
        </div>
        <div className="absolute inset-0 z-10 bg-linear-to-b from-transparent via-black/30 to-black/90 md:rounded-xl" />
        <div className="absolute bottom-0 left-0 right-0 z-10 h-32 bg-linear-to-t from-black to-transparent md:rounded-xl" />

        {logoImage && (
          <VibrantLogo
            src={logoImage}
            alt={`${media.Name} logo`}
            movieName={media.Name || ""}
            width={300}
            height={96}
            className="absolute md:top-5/12 top-4/12 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 max-h-20 md:max-h-24 w-auto object-contain max-w-2/3 invisible md:visible"
          />
        )}
      </div>

      <ThemeMediaControls
        isMuted={isMuted}
        isPlaying={isPlaying}
        toggleMute={toggleMute}
        togglePlay={togglePlay}
        isVisible={hasThemeMedia && !isPlayerActive}
      />
      <div
        className={`absolute top-8 left-0 right-0 z-30 px-6 ${
          hasThemeMedia && !isPlayerActive ? "pr-32" : ""
        }`}
      >
        <SearchBar />
      </div>
    </div>
  );
}

/**
 * Main Content Container
 */
function Main({ children }: { children: ReactNode }) {
  const { themeMedia } = useMediaDetail();
  return (
    <motion.div
      data-slot="media-detail-main"
      className="relative z-10 md:pl-6 bg-background/95 dark:bg-background/50 backdrop-blur-xl rounded-2xl mx-4 pb-6 shadow-2xl"
      initial={{ marginTop: "-13.5rem" }}
      animate={{
        marginTop: themeMedia.showThemeVideo ? "-7.5rem" : "-13.5rem",
        filter: themeMedia.showThemeVideo
          ? "brightness(1.02)"
          : "brightness(1)",
      }}
      transition={{ duration: 0.85, ease: [0.7, 0.1, 0.1, 1] }}
    >
      <div className="flex flex-col md:flex-row mx-auto">{children}</div>
    </motion.div>
  );
}

/**
 * Poster/Image Component
 */
interface PosterProps {
  isEpisode?: boolean;
}

function Poster({ isEpisode = false }: PosterProps) {
  const { media, primaryImage } = useMediaDetail();

  if (isEpisode) {
    return (
      <div className="w-full md:w-1/3 lg:w-1/4 shrink-0 justify-center flex md:block z-50 mt-6">
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl bg-muted max-w-1/2 md:max-w-full mt-16">
          {primaryImage ? (
            <PosterImage
              movie={media}
              posterImage={primaryImage}
              className="w-full h-full object-cover"
              width={480}
              height={270}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Search className="h-12 w-12" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 shrink-0 justify-center flex md:block z-50 mt-6">
      <PosterImage
        movie={media}
        posterImage={primaryImage}
        className="w-full h-auto rounded-lg shadow-2xl max-w-1/2 md:max-w-full"
        width={500}
        height={750}
      />
    </div>
  );
}

/**
 * Content Component - Container for Info and Actions
 */
function Content({ children }: { children: ReactNode }) {
  return (
    <div className="w-full md:w-2/3 lg:w-3/4 pt-0 md:pt-8">{children}</div>
  );
}

/**
 * Info Component - Title and Badges
 */
function Info({ children }: { children?: ReactNode }) {
  const { media } = useMediaDetail();

  return (
    <div className="text-center md:text-start mt-8">
      <div className="mb-4 flex justify-center md:justify-start">
        {children || (
          <TextAnimate
            as="h1"
            className="text-4xl md:text-5xl font-semibold font-poppins text-foreground md:pl-8 drop-shadow-xl"
            animation="blurInUp"
            by="character"
            once
          >
            {media.Name || ""}
          </TextAnimate>
        )}
      </div>
    </div>
  );
}

/**
 * Actions Container
 */
function Actions({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full px-4 sm:px-8 md:pl-8 md:pt-4 md:pr-16 flex flex-col justify-center items-stretch md:items-start ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Overview / Summary Component
 */
function Overview() {
  const { media } = useMediaDetail();

  return (
    <>
      {media.Taglines && media.Taglines.length > 0 && (
        <TextScramble
          className="text-lg text-muted-foreground mb-4 max-w-4xl text-center md:text-left font-poppins drop-shadow-md"
          duration={1.2}
        >
          {media.Taglines[0]}
        </TextScramble>
      )}

      {media.Overview && (
        <span className="text-md leading-relaxed mb-6 max-w-4xl">
          {media.Overview}
        </span>
      )}
    </>
  );
}

/**
 * Metadata Section (Genres, Director, etc.)
 */
function Metadata({ children }: { children: ReactNode }) {
  return <div className="space-y-3 mb-6 max-w-4xl">{children}</div>;
}

/**
 * Generic Metadata Item
 */
function MetadataItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground min-w-fit">
        {label}:
      </span>
      {children}
    </div>
  );
}

/**
 * Cast Section
 */
function Cast() {
  const { media } = useMediaDetail();
  if (!media.People || media.People.length === 0) return null;

  return (
    <div className="mt-12 px-6">
      <CastScrollArea people={media.People} mediaId={media.Id || ""} />
    </div>
  );
}

/**
 * Similar Items Section
 */
interface SimilarProps {
  items: any[];
}

function Similar({ items }: SimilarProps) {
  const { serverUrl } = useMediaDetail();
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-8 px-6">
      <MediaSection
        sectionName="More Like This"
        mediaItems={items as BaseItemDto[]}
        serverUrl={serverUrl || ""}
      />
    </div>
  );
}

/**
 * MediaDetail Namespace
 */
export const MediaDetail = {
  Root,
  Backdrop,
  Main,
  Poster,
  Content,
  Info,
  Actions,
  Overview,
  Metadata,
  MetadataItem,
  Cast,
  Similar,
};
