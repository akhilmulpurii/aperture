import { BaseItemDto, MediaSourceInfo } from "@jellyfin/sdk/lib/generated-client/models";

export interface PlayOptions {
  fullscreen?: boolean;
  mediaSourceId?: string;
  mediaSource?: MediaSourceInfo;
  audioStreamIndex?: number;
  subtitleStreamIndex?: number;
  startPositionTicks?: number;
  startIndex?: number;
  ids?: string[];
  startPosition?: number;
  url?: string;
  videoBitrate?: number;
  textTracks?: Array<{
    kind: string;
    label: string;
    src: string;
    language: string;
    default?: boolean;
    index: number;
  }>;
}

export type PlayerType = 'Video' | 'Audio' | 'Youtube' | 'Phote';

export interface PlaybackState {
  paused: boolean;
  muted: boolean;
  volume: number;
  playbackRate: number;
  currentTime: number; // in seconds
  duration: number; // in seconds
  buffered: TimeRanges | null;
  isBuffering: boolean;
  isEnded: boolean;
  currentMediaSource: MediaSourceInfo | null;
  currentItem: BaseItemDto | null;
  playMethod: 'DirectPlay' | 'DirectStream' | 'Transcode' | null;
  subtitleOffset: number;
  subtitleStreamIndex?: number;
  subtitleSize?: number;
  audioStreamIndex?: number;
  aspectRatio: string;
  repeatMode: 'Off' | 'All' | 'One';
  preferredQuality: string;
  isMiniPlayer?: boolean;
  isLoading?: boolean;
  textTracks?: Array<{
    kind: string;
    label: string;
    src: string;
    language: string;
    default?: boolean;
    index: number;
  }>;
}

export interface Player {
  name: string;
  isLocalPlayer: boolean;
  id: string;
  canPlayMediaType: (mediaType: string) => boolean;
  play: (item: BaseItemDto, options?: PlayOptions) => Promise<void>;
  pause: () => void;
  unpause: () => void;
  stop: (destroy?: boolean) => void;
  seek: (ticks: number) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  setMute: (mute: boolean) => void;
  getMute: () => boolean;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  setAudioStreamIndex: (index: number) => void;
  setSubtitleStreamIndex: (index: number) => void;
  destroy: () => void;
}
