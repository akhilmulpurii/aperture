import { usePlaybackContext } from '../playback/context/PlaybackContext';
import { getStreamUrl, fetchMediaDetails } from '../actions'; 
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";

export interface PlayOptions {
  id: string;
  name: string;
  type: "Movie" | "Series" | "Episode" | "TvChannel";
  resumePositionTicks?: number;
  selectedVersion?: any; 
}

export function usePlayback() {
  const manager = usePlaybackContext();

  const play = async (options: PlayOptions) => {
    try {
        console.log("usePlayback play called with:", options);
        
        let selectedVersion = options.selectedVersion;

        // If no version provided, fetch item details to get media sources
        if (!selectedVersion) {
            console.log("No version selected, fetching item details...");
            const itemDetails = await fetchMediaDetails(options.id);
            if (itemDetails && itemDetails.MediaSources && itemDetails.MediaSources.length > 0) {
                selectedVersion = itemDetails.MediaSources[0]; // Default to first source
                console.log("Selected default version:", selectedVersion.Name);
            } else {
                throw new Error("No media sources found for item.");
            }
        }

        let streamUrl = '';
        if (selectedVersion && selectedVersion.Id) {
             streamUrl = await getStreamUrl(options.id, selectedVersion.Id);
        } else {
             throw new Error("Invalid media source selected.");
        }

        const item: BaseItemDto = {
            Id: options.id,
            Name: options.name,
            MediaType: options.type as any,
            RunTimeTicks: selectedVersion?.RunTimeTicks
        };

        await manager.play(item, {
            url: streamUrl,
            startPositionTicks: options.resumePositionTicks,
            mediaSourceId: selectedVersion?.Id
        });

    } catch (e) {
        console.error("Failed to start playback", e);
    }
  };

  return {
    play,
  };
}
