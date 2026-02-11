import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { Settings } from "lucide-react";
import { PlaybackContextValue } from "../hooks/usePlaybackManager";
import {
  getAudioTracks,
  getSubtitleTracks,
  canBrowserDirectPlayHevc,
} from "../../actions";
import { getVideoQualityOptions } from "../utils/quality";

interface SettingsMenuProps {
  manager: PlaybackContextValue;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ manager }) => {
  const { playbackState } = manager;
  const { currentItem, currentMediaSource } = playbackState;
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTracks() {
      if (currentItem?.Id && currentMediaSource?.Id) {
        const audio = await getAudioTracks(
          currentItem.Id,
          currentMediaSource.Id,
        );
        const subs = await getSubtitleTracks(
          currentItem.Id,
          currentMediaSource.Id,
        );
        setAudioTracks(audio);
        setSubtitleTracks(subs);
      }
    }
    fetchTracks();
  }, [currentItem?.Id, currentMediaSource?.Id]);

  const qualityOptions = React.useMemo(() => {
    const videoStream = currentMediaSource?.MediaStreams?.find(
      (s) => s.Type === "Video",
    );
    if (!videoStream) return [];

    const opts = getVideoQualityOptions({
      videoBitrate: videoStream.BitRate ?? undefined,
      videoCodec: videoStream.Codec ?? undefined,
      enableAuto: true,
      isAutomaticBitrateEnabled: playbackState.preferredQuality === "auto",
    });

    return opts;
  }, [currentMediaSource, playbackState.preferredQuality]);

  const handleAudioChange = (indexStr: string) => {
    const index = parseInt(indexStr);
    if (!isNaN(index)) {
      manager.setAudioStreamIndex(index);
    }
  };

  const handleSubtitleChange = (indexStr: string) => {
    const index = parseInt(indexStr);
    if (!isNaN(index)) {
      manager.setSubtitleStreamIndex(index);
    }
  };

  const handleQualityChange = (variant: string) => {
    manager.setPreferredQuality(variant);

    let bitrate: number | undefined;
    if (variant === "auto") {
      bitrate = undefined;
    } else if (variant === "direct") {
      bitrate = 120000000;
    } else {
      bitrate = parseInt(variant);
    }

    if (currentItem) {
      manager.play(currentItem, {
        startPositionTicks: playbackState.currentTime * 10000000,
        mediaSourceId: currentMediaSource?.Id || undefined,
        videoBitrate: bitrate,
      });
    }
  };

  const handleSpeedChange = (val: string) => {
    const rate = parseFloat(val);
    manager.setPlaybackRate(rate);
  };

  const handleAspectRatioChange = (val: string) => {
    manager.reportState({ aspectRatio: val });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-6 h-6 text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-black/90 text-white border-gray-800 z-100 max-h-[80vh] overflow-y-auto">
        <DropdownMenuLabel>Playback Settings</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Audio Tracks */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex-1">Audio</span>
            <span className="text-xs text-gray-400 ml-2">
              {audioTracks.find((t) => t.id === playbackState.audioStreamIndex)
                ?.label || "Default"}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-black/90 text-white border-gray-800 rounded-md">
            <DropdownMenuRadioGroup
              value={String(playbackState.audioStreamIndex || "")}
              onValueChange={handleAudioChange}
            >
              {audioTracks.map((track) => (
                <DropdownMenuRadioItem
                  key={track.id ?? track.label}
                  value={String(track.id)}
                >
                  {track.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Subtitles */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex-1">Subtitles</span>
            <span className="text-xs text-gray-400 ml-2">
              {subtitleTracks
                .find((t) => t.index === playbackState.subtitleStreamIndex)
                ?.language?.toUpperCase() ||
                (playbackState.subtitleStreamIndex === -1
                  ? "Off"
                  : subtitleTracks.length > 0
                    ? "Select"
                    : "None")}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-black/90 text-white border-gray-800 rounded-md">
            <DropdownMenuRadioGroup
              value={String(playbackState.subtitleStreamIndex ?? -1)}
              onValueChange={handleSubtitleChange}
            >
              <DropdownMenuRadioItem value="-1">Off</DropdownMenuRadioItem>
              {subtitleTracks.map((track, i) => (
                <DropdownMenuRadioItem key={i} value={String(track.index)}>
                  {track.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Quality */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex-1">Quality</span>
            <span className="text-xs text-gray-400 ml-2">
              {playbackState.preferredQuality === "auto"
                ? "Auto"
                : playbackState.preferredQuality === "direct"
                  ? "Direct"
                  : qualityOptions.find(
                      (q) =>
                        String(q.bitrate) === playbackState.preferredQuality,
                    )?.name || playbackState.preferredQuality}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-black/90 text-white border-gray-800 max-h-[60vh] overflow-y-auto">
            <DropdownMenuRadioGroup
              value={playbackState.preferredQuality}
              onValueChange={handleQualityChange}
            >
              <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>

              {/* Only show Direct Play if video codec is supported */}
              {(() => {
                const videoStream = currentMediaSource?.MediaStreams?.find(
                  (s) => s.Type === "Video",
                );
                const isHevc =
                  videoStream?.Codec?.toLowerCase().includes("hevc") ||
                  videoStream?.Codec?.toLowerCase().includes("h265");
                const isSupported = !isHevc || canBrowserDirectPlayHevc();

                return (
                  isSupported && (
                    <DropdownMenuRadioItem value="direct">
                      Direct Play
                    </DropdownMenuRadioItem>
                  )
                );
              })()}

              {qualityOptions.map(
                (option) =>
                  option.name !== "Auto" && (
                    <DropdownMenuRadioItem
                      key={option.name}
                      value={String(option.bitrate)}
                    >
                      {option.name}
                    </DropdownMenuRadioItem>
                  ),
              )}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Playback Speed */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex-1">Playback Speed</span>
            <span className="text-xs text-gray-400 ml-2">
              {playbackState.playbackRate}x
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-black/90 text-white border-gray-800">
            <DropdownMenuRadioGroup
              value={String(playbackState.playbackRate)}
              onValueChange={handleSpeedChange}
            >
              <DropdownMenuRadioItem value="0.5">0.5x</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="0.75">0.75x</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="1">
                1x (Normal)
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="1.25">1.25x</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="1.5">1.5x</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="2">2x</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Aspect Ratio */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex-1">Aspect Ratio</span>
            <span className="text-xs text-gray-400 ml-2">
              {playbackState.aspectRatio}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-black/90 text-white border-gray-800">
            <DropdownMenuRadioGroup
              value={playbackState.aspectRatio}
              onValueChange={handleAspectRatioChange}
            >
              <DropdownMenuRadioItem value="contain">
                Auto (Contain)
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="cover">
                Cover (Zoom)
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="fill">
                Fill (Stretch)
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
