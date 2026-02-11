import React, { useEffect } from "react";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { HTMLVideoPlayer } from "../players/HTMLVideoPlayer";
import { HTMLAudioPlayer } from "../players/HTMLAudioPlayer";
import { PlaybackControls } from "./PlaybackControls";
import {
  PlaybackContextValue,
  usePlaybackManager,
} from "../hooks/usePlaybackManager";
import { Player } from "../types";
import { VideoOSD } from "./VideoOSD";

interface JellyfinPlayerProps {
  className?: string;
  item?: BaseItemDto;
  startPositionTicks?: number;
  options?: any;
  manager?: PlaybackContextValue;
}

export const JellyfinPlayer: React.FC<JellyfinPlayerProps> = ({
  className,
  item,
  startPositionTicks,
  options,
  manager: propManager,
}) => {
  const localManager = usePlaybackManager();
  const manager = propManager || localManager;

  const { playbackState } = manager;

  useEffect(() => {
    if (item) {
      manager.play(item, { startPositionTicks, ...options });
    }
  }, [item, manager, startPositionTicks, options]);

  const activePlayerType = playbackState.currentItem
    ? ["Audio", "Music"].includes(playbackState.currentItem.MediaType as string)
      ? "Audio"
      : "Video"
    : "Video";

  const isVideo = playbackState.currentItem && activePlayerType === "Video";

  const aspectRatioClass =
    playbackState.aspectRatio === "fill"
      ? "object-fill"
      : playbackState.aspectRatio === "cover"
        ? "object-cover"
        : "object-contain";

  const { registerPlayer, unregisterPlayer } = manager;

  const videoRefCallback = React.useCallback(
    (player: Player | null) => {
      if (player) registerPlayer("Video", player);
      else unregisterPlayer("Video");
    },
    [registerPlayer, unregisterPlayer],
  );

  const audioRefCallback = React.useCallback(
    (player: Player | null) => {
      if (player) registerPlayer("Audio", player);
      else unregisterPlayer("Audio");
    },
    [registerPlayer, unregisterPlayer],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName))
        return;

      const { currentTime, duration, volume, paused } = manager.playbackState;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          manager.seek(Math.max(0, currentTime - 10) * 10000000);
          break;
        case "ArrowRight":
          e.preventDefault();
          manager.seek(Math.min(duration, currentTime + 10) * 10000000);
          break;
        case "ArrowUp":
          e.preventDefault();
          manager.setVolume(Math.min(100, volume + 10));
          break;
        case "ArrowDown":
          e.preventDefault();
          manager.setVolume(Math.max(0, volume - 10));
          break;
        case " ":
          e.preventDefault();
          if (paused) manager.unpause();
          else manager.pause();
          break;
        case "Escape":
          e.preventDefault();
          manager.stop();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [manager]);

  return (
    <div
      className={`relative bg-black flex flex-col justify-center items-center ${className} group`}
    >
      <div className="w-full h-full">
        {/* Render the appropriate player */}
        <HTMLVideoPlayer
          ref={videoRefCallback}
          className={
            activePlayerType === "Video"
              ? `block w-full h-full ${aspectRatioClass}`
              : "hidden"
          }
          subtitleOffset={playbackState.subtitleOffset || 0}
          onTimeUpdate={(time) => {
            manager.reportState({ currentTime: time });
          }}
          onDurationChange={(duration) => {
            manager.reportState({ duration });
          }}
          onEnded={() => {
            manager.reportState({ isEnded: true });
            manager.next();
          }}
        />
        <HTMLAudioPlayer
          ref={audioRefCallback}
          className={activePlayerType === "Audio" ? "block" : "hidden"}
        />
      </div>

      {/* Overlay Controls */}
      {isVideo ? (
        <VideoOSD manager={manager} />
      ) : (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <PlaybackControls
            playbackState={manager.playbackState}
            onPlayPause={() =>
              manager.playbackState.paused ? manager.unpause() : manager.pause()
            }
            onSeek={manager.seek}
            onVolumeChange={manager.setVolume}
            onToggleMute={manager.toggleMute}
            onNext={manager.next}
            onPrevious={manager.previous}
          />
        </div>
      )}
    </div>
  );
};
