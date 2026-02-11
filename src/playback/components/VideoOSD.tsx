import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { isFullscreenAtom } from "../../lib/atoms";
import { PlaybackContextValue } from "../hooks/usePlaybackManager";
import { Slider } from "../../components/ui/slider";
import { useTrickplay } from "../../hooks/useTrickplay";
import { useSkipSegments } from "../../hooks/useSkipSegments";
import { VideoSplashLoader } from "./VideoSplashLoader";
import { Button } from "../../components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Heart,
  SkipForward,
  PictureInPicture,
} from "lucide-react";
import { formatVideoTime } from "../../lib/utils";
import { SettingsMenu } from "./SettingsMenu";

interface VideoOSDProps {
  manager: PlaybackContextValue;
  className?: string;
}

const dateObject = Date.now();

export const VideoOSD: React.FC<VideoOSDProps> = ({ manager }) => {
  const { playbackState } = manager;
  const {
    paused,
    currentTime,
    duration,
    currentItem,
    currentMediaSource,
    volume,
    muted,
    isMiniPlayer,
    isLoading,
    isBuffering,
  } = playbackState;
  const { initializeTrickplay, renderThumbnail } = useTrickplay();
  const { checkSegment } = useSkipSegments(currentItem?.Id);
  const activeSegment = checkSegment(currentTime);

  useEffect(() => {
    if (currentItem) {
      initializeTrickplay(currentItem as any, currentMediaSource || null);
    }
  }, [currentItem, currentMediaSource, initializeTrickplay]);

  const [isHovering, setIsHovering] = useState(false);
  const [lastActivity, setLastActivity] = useState(dateObject);

  // Hide OSD logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (!paused && Date.now() - lastActivity > 3000) {
        setIsHovering(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, lastActivity]);

  const handleMouseMove = () => {
    setLastActivity(Date.now());
    setIsHovering(true);
  };

  const [scrubbingValue, setScrubbingValue] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [timelineWidth, setTimelineWidth] = useState(0);

  const handleSeek = (value: number[]) => {
    setScrubbingValue(null);
    manager.seek(value[0] * 10000000); // convert seconds to ticks
  };

  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTimelineWidth(rect.width);
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    setHoverTime(percentage * duration);
  };

  const handleTimelineLeave = () => {
    setHoverTime(null);
  };

  // Convert ticks to seconds for slider
  const currentSeconds = currentTime; // playbackState.currentTime is in seconds
  const durationSeconds = duration; // playbackState.duration is in seconds

  const displayTime = scrubbingValue !== null ? scrubbingValue : currentSeconds;
  const activeThumbTime = scrubbingValue !== null ? scrubbingValue : hoverTime;
  const thumbnail =
    activeThumbTime !== null ? renderThumbnail(activeThumbTime) : null;

  // Calculate Active Chapter
  const chapters = (currentItem as any)?.Chapters || [];
  const activeChapter =
    activeThumbTime !== null
      ? chapters.find((ch: any, i: number) => {
          const start = ch.StartPositionTicks / 10000000;
          const nextCh = chapters[i + 1];
          const end = nextCh
            ? nextCh.StartPositionTicks / 10000000
            : durationSeconds;
          return activeThumbTime >= start && activeThumbTime < end;
        })
      : null;

  let thumbStyle: React.CSSProperties = {};
  if (thumbnail) {
    thumbStyle = {
      width: thumbnail.coords[2],
      height: thumbnail.coords[3],
      backgroundImage: `url(${thumbnail.src})`,
      backgroundPosition: `-${thumbnail.coords[0]}px -${thumbnail.coords[1]}px`,
    };

    if (timelineWidth > 0 && durationSeconds > 0 && activeThumbTime !== null) {
      const ratio = activeThumbTime / durationSeconds;
      const centerPx = ratio * timelineWidth;
      const halfWidth = thumbnail.coords[2] / 2;
      const clampedCenter = Math.max(
        halfWidth,
        Math.min(timelineWidth - halfWidth, centerPx),
      );
      thumbStyle.left = `${clampedCenter}px`;
      thumbStyle.transform = "translateX(-50%)";
    } else if (durationSeconds > 0 && activeThumbTime !== null) {
      thumbStyle.left = `${(activeThumbTime / durationSeconds) * 100}%`;
      thumbStyle.transform = "translateX(-50%)";
    }
  }

  const isVisible = isHovering || paused;

  const handleOverlayClick = () => {
    handleMouseMove();
    if (paused) {
      manager.unpause();
    } else {
      manager.pause();
    }
  };

  const [isFullscreen] = useAtom(isFullscreenAtom);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((e) => console.error("Fullscreen error:", e));
    } else {
      document
        .exitFullscreen()
        .catch((e) => console.error("Exit fullscreen error:", e));
    }
  };

  // Stop propagation for controls so they don't trigger the overlay click
  const handleControlsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMouseMove();
  };

  if (isMiniPlayer) {
    return (
      <div
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all duration-300 cursor-pointer group"
        onClick={manager.toggleMiniPlayer}
      >
        <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
          <Maximize className="w-6 h-6 text-white" />
        </div>
      </div>
    );
  }

  return (
    <>
      <VideoSplashLoader
        item={currentItem}
        isVisible={isLoading || isBuffering || false}
        onClose={() => manager.stop()}
      />
      <div
        className={`absolute inset-0 z-50 flex flex-col justify-between transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 cursor-none"}`}
        onMouseMove={handleMouseMove}
        onClick={handleOverlayClick}
      >
        {/* Top Bar */}
        <div
          className={`relative flex px-4 pt-4 items-center justify-between transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
          onClick={handleControlsClick}
        >
          <div className="flex items-center gap-4 z-10">
            <Button variant="ghost" size="icon" onClick={() => manager.stop()}>
              <ArrowLeft className="w-8 h-8 text-white" />
            </Button>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-[60%] pointer-events-none">
            <h2 className="text-xl font-bold text-white drop-shadow-md truncate">
              {currentItem?.Name}
            </h2>
            {currentItem?.SeriesName && (
              <p className="text-sm text-gray-300 drop-shadow-md truncate">
                {currentItem.SeriesName}
              </p>
            )}
          </div>

          <div className="min-w-10 flex justify-end z-10">
            {durationSeconds > 0 && (
              <span className="text-sm font-medium text-white/80 drop-shadow-md whitespace-nowrap">
                Ends at{" "}
                {new Date(
                  dateObject + (durationSeconds - currentSeconds) * 1000,
                ).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Center Play/Pause (optional, large icon) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {paused && (
            <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
              <Play className="w-16 h-16 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Skip Button */}
        {activeSegment && isVisible && (
          <div className="absolute bottom-32 right-8 z-50 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Button
              variant="ghost"
              className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 gap-2 pl-4 pr-6 py-6 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                manager.seek(activeSegment.EndTicks);
              }}
            >
              <SkipForward className="w-5 h-5 fill-white" />
              <span className="font-semibold tracking-wide">
                SKIP {activeSegment.Type === "Intro" ? "INTRO" : "CREDITS"}
              </span>
            </Button>
          </div>
        )}

        {/* Bottom Controls */}
        <div
          className={`bg-linear-to-t from-black/90 to-transparent p-4 pb-4 transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-full"}`}
          onClick={handleControlsClick}
        >
          {/* Timeline */}
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <span className="text-xs font-mono text-gray-300">
              {formatVideoTime(
                displayTime * 10000000,
                durationSeconds * 10000000,
              )}
            </span>

            <div
              className="flex-1 relative flex items-center h-8 group/slider cursor-pointer"
              onMouseMove={handleTimelineHover}
              onMouseLeave={handleTimelineLeave}
            >
              {/* Trickplay Thumbnail */}
              {thumbnail && activeThumbTime !== null && durationSeconds > 0 && (
                <div
                  className="absolute bottom-10 border-2 border-white rounded-md overflow-hidden shadow-lg bg-black z-30 pointer-events-none transition-opacity duration-200"
                  style={thumbStyle}
                >
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-full px-2">
                    {activeChapter && (
                      <span className="text-[10px] text-white/90 font-medium truncate max-w-full drop-shadow-md text-center">
                        {activeChapter.Name}
                      </span>
                    )}
                    <div className="bg-black/70 px-1 rounded text-[10px] text-white font-mono">
                      {
                        formatVideoTime(
                          activeThumbTime * 10000000,
                          durationSeconds * 10000000,
                        ).split(" / ")[0]
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* Chapter Markers */}
              {chapters.map((chapter: any, index: number) => {
                const startSeconds = chapter.StartPositionTicks / 10000000;
                if (startSeconds <= 0) return null; // Skip start marker
                const leftPct = (startSeconds / durationSeconds) * 100;

                return (
                  <div
                    key={index}
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2 bg-white/40 z-10 pointer-events-none group-hover/slider:h-4 transition-all duration-200"
                    style={{ left: `${leftPct}%` }}
                  />
                );
              })}

              <Slider
                value={[displayTime]}
                max={durationSeconds > 0 ? durationSeconds : 100}
                step={1}
                onValueChange={(val) => {
                  setScrubbingValue(val[0]);
                }}
                onValueCommit={handleSeek}
                className="w-full"
              />
            </div>

            <span className="text-xs font-mono text-gray-300">
              {formatVideoTime(
                durationSeconds * 10000000,
                durationSeconds * 10000000,
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Skip Backward 10s */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  manager.seek(Math.max(0, currentTime - 10) * 10000000)
                }
              >
                <RotateCcw className="w-6 h-6 text-white" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={paused ? manager.unpause : manager.pause}
              >
                {paused ? (
                  <Play className="w-8 h-8 text-white fill-white" />
                ) : (
                  <Pause className="w-8 h-8 text-white fill-white" />
                )}
              </Button>

              {/* Skip Forward 10s */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  manager.seek(Math.min(duration, currentTime + 10) * 10000000)
                }
              >
                <RotateCw className="w-6 h-6 text-white" />
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-2 group relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={manager.toggleMute}
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="w-6 h-6 text-white" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-white" />
                  )}
                </Button>
                <div className="w-0 group-hover:w-24 transition-all duration-300 ease-in-out">
                  <Slider
                    value={[muted ? 0 : volume]}
                    max={100}
                    onValueChange={(val) => manager.setVolume(val[0])}
                    className="flex-1 cursor-pointer w-24"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Like Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => manager.toggleFavorite()}
              >
                <Heart
                  className={`w-6 h-6 ${currentItem?.UserData?.IsFavorite ? "text-red-500 fill-red-500" : "text-white"}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={manager.toggleMiniPlayer}
              >
                <PictureInPicture className="w-6 h-6 text-white" />
              </Button>
              <SettingsMenu manager={manager} />
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize className="w-6 h-6 text-white" />
                ) : (
                  <Maximize className="w-6 h-6 text-white" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
