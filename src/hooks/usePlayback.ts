import { usePlaybackContext } from "../playback/context/PlaybackContext";
import { fetchMediaDetails } from "../actions";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";

export interface PlayOptions {
  id: string;
  name: string;
  type: "Movie" | "Series" | "Episode" | "TvChannel";
  resumePositionTicks?: number;
  selectedVersion?: any;
  audioStreamIndex?: number;
}

export function usePlayback() {
  const manager = usePlaybackContext();

  const play = async (options: PlayOptions) => {
    try {
      let selectedVersion = options.selectedVersion;

      // If no version provided, fetch item details to get media sources
      if (!selectedVersion) {
        console.log("No version selected, fetching item details...");
        const itemDetails = await fetchMediaDetails(options.id);
        if (
          itemDetails &&
          itemDetails.MediaSources &&
          itemDetails.MediaSources.length > 0
        ) {
          selectedVersion = itemDetails.MediaSources[0]; // Default to first source
          console.log("Selected default version:", selectedVersion.Name);
        } else {
          throw new Error("No media sources found for item.");
        }
      }

      // Delegate URL generation to manager to handle default audio/subtitle selection
      const item: BaseItemDto = {
        Id: options.id,
        Name: options.name,
        MediaType: options.type as any,
        RunTimeTicks: selectedVersion?.RunTimeTicks,
        MediaSources: selectedVersion ? [selectedVersion] : [],
      };

      await manager.play(item, {
        startPositionTicks: options.resumePositionTicks,
        mediaSourceId: selectedVersion?.Id,
        audioStreamIndex: options.audioStreamIndex,
      });
    } catch (e) {
      console.error("Failed to start playback", e);
    }
  };

  return {
    play,
  };
}
