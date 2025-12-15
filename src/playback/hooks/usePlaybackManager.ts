import { useState, useRef, useCallback, useEffect } from 'react';
import { BaseItemDto, MediaSourceInfo } from "@jellyfin/sdk/lib/generated-client/models";
import { markFavorite, unmarkFavorite, getStreamUrl, fetchMediaDetails } from '../../actions';
import { PlaybackState, Player, PlayOptions, PlayerType } from '../types';
import { PlayQueueManager } from '../utils/playQueueManager';

// Initialize queue manager outside hook to persist (or use Context)
// In a real app, this should probably be in a Context Provider
export const playQueueManager = new PlayQueueManager();

export interface PlaybackContextValue {
    playbackState: PlaybackState;
    play: (items: BaseItemDto | BaseItemDto[], options?: PlayOptions) => Promise<void>;
    pause: () => void;
    unpause: () => void;
    stop: () => void;
    next: () => void;
    previous: () => void;
    seek: (ticks: number) => void;
    setVolume: (volume: number) => void;
    setMute: (mute: boolean) => void;
    toggleMute: () => void;
    toggleFavorite: () => Promise<void>;
    setPlaybackRate: (rate: number) => void;
    setAudioStreamIndex: (index: number) => void;
    setSubtitleStreamIndex: (index: number) => void;
    registerPlayer: (type: PlayerType, player: Player) => void;
    unregisterPlayer: (type: PlayerType) => void;
    reportState: (updates: Partial<PlaybackState>) => void;
    setPreferredQuality: (quality: string) => void;
}

export function usePlaybackManager(): PlaybackContextValue {
    // Registered players (refs)
    const playersRef = useRef<Record<string, Player>>({});
    
    // State
    const [playbackState, setPlaybackState] = useState<PlaybackState>({
        paused: false,
        muted: false,
        volume: 100,
        playbackRate: 1,
        currentTime: 0,
        duration: 0,
        buffered: null,
        isBuffering: false,
        isEnded: false,
        currentMediaSource: null,
        currentItem: null,
        playMethod: null,
        subtitleOffset: 0,
        aspectRatio: 'contain',
        repeatMode: 'Off',
        preferredQuality: 'auto',
    });

    const activePlayerRef = useRef<Player | null>(null);

    const updateState = useCallback((updates: Partial<PlaybackState>) => {
        setPlaybackState(prev => ({ ...prev, ...updates }));
    }, []);

    const registerPlayer = useCallback((type: PlayerType, player: Player) => {
        playersRef.current[type] = player;
    }, []);

    const unregisterPlayer = useCallback((type: PlayerType) => {
        delete playersRef.current[type];
    }, []);

    const getPlayerForMedia = useCallback((item: BaseItemDto): Player | null => {
        const mediaType = item.MediaType as string;
        if (!mediaType) return null;

        // Simple selection logic
        if (mediaType === 'Video' || mediaType === 'Movie' || mediaType === 'Episode' || mediaType === 'TvChannel') {
            return playersRef.current['Video'] || null;
        } else if (mediaType === 'Audio') {
            return playersRef.current['Audio'] || null;
        }
        return null;
    }, []);

    const play = useCallback(async (items: BaseItemDto | BaseItemDto[], options: PlayOptions = {}) => {
        const itemList = Array.isArray(items) ? items : [items];
        if (itemList.length === 0) return;

        // Reset queue and add new items
        // unless specific options say otherwise.
        playQueueManager.setPlaylist(itemList as any[]);
        playQueueManager.setPlaylistIndex(0);

        // Play first item
        let itemToPlay = playQueueManager.getCurrentItem();
        if (!itemToPlay || !itemToPlay.Id) return;

        const player = getPlayerForMedia(itemToPlay);
        if (!player) {
            console.error('No suitable player found for', itemToPlay.MediaType);
            return;
        }

        // Stop previous player if different
        if (activePlayerRef.current && activePlayerRef.current !== player) {
            activePlayerRef.current.stop(true);
        }

        // Ensure we have full item details (MediaSources)
        if (!itemToPlay.MediaSources || itemToPlay.MediaSources.length === 0) {
            try {
                const fullItem = await fetchMediaDetails(itemToPlay.Id!);
                if (fullItem) {
                    itemToPlay = { ...itemToPlay, ...fullItem } as any;
                }
            } catch (e) {
                console.error("Failed to fetch full media details", e);
            }
        }

        // Determine Media Source
        const mediaSourceId = options.mediaSourceId;
        let mediaSource = itemToPlay!.MediaSources?.find(ms => ms.Id === mediaSourceId);
        if (!mediaSource && itemToPlay!.MediaSources && itemToPlay!.MediaSources.length > 0) {
            mediaSource = itemToPlay!.MediaSources[0];
        }

        // Generate URL if missing
        if (!options.url && mediaSource && mediaSource.Id && itemToPlay!.Id) {
             try {
                options.url = await getStreamUrl(
                    itemToPlay!.Id!, 
                    mediaSource.Id, 
                    undefined, 
                    options.videoBitrate
                );
             } catch (e) {
                 console.error("Failed to generate stream URL", e);
             }
        }

        activePlayerRef.current = player;
        updateState({ 
            currentItem: itemToPlay!, 
            currentMediaSource: mediaSource || null,
            paused: false, 
            isEnded: false, 
            currentTime: 0, 
            duration: (itemToPlay!.RunTimeTicks || 0) / 10000000
        });

        try {
            await player.play(itemToPlay!, options);
            // Volume/Mute sync
            // player.setVolume(playbackState.volume);
            // player.setMute(playbackState.muted);
        } catch (err) {
            console.error('Playback failed', err);
        }

    }, [getPlayerForMedia, updateState]);

    const pause = useCallback(() => {
        activePlayerRef.current?.pause();
        updateState({ paused: true });
    }, [updateState]);

    const unpause = useCallback(() => {
        activePlayerRef.current?.unpause();
        updateState({ paused: false });
    }, [updateState]);

    const stop = useCallback(() => {
        activePlayerRef.current?.stop(true);
        activePlayerRef.current = null;
        updateState({ paused: false, currentTime: 0, currentItem: null, isEnded: false });
    }, [updateState]);

    const seek = useCallback((ticks: number) => {
        activePlayerRef.current?.seek(ticks);
    }, []);

    const next = useCallback(() => {
        const nextInfo = playQueueManager.getNextItemInfo();
        if (nextInfo) {
            playQueueManager.setPlaylistIndex(nextInfo.index);
            const item = playQueueManager.getCurrentItem();
            // Using internal play logic or calling play again (simplified)
            // Ideally we extract playItem logic
            if (item) play(item, { startPositionTicks: 0 }); 
        } else {
            stop();
        }
    }, [play, stop]);

    const previous = useCallback(() => {
        // Logic for previous: if < 5s, go to start, else go to prev item
        // Simplified:
         const currentIndex = playQueueManager.getCurrentPlaylistIndex();
         if (currentIndex > 0) {
             playQueueManager.setPlaylistIndex(currentIndex - 1);
            const item = playQueueManager.getCurrentItem();
            if (item) play(item, { startPositionTicks: 0 }); 
         }
    }, [play]);

    const setVolume = useCallback((volume: number) => {
        activePlayerRef.current?.setVolume(volume);
        updateState({ volume });
    }, [updateState]);

    const setMute = useCallback((mute: boolean) => {
        activePlayerRef.current?.setMute(mute);
        updateState({ muted: mute });
    }, [updateState]);

    const toggleMute = useCallback(() => {
        const newMute = !playbackState.muted;
        setMute(newMute);
    }, [playbackState.muted, setMute]);

    const toggleFavorite = useCallback(async () => {
        const item = playbackState.currentItem;
        if (!item || !item.Id || !item.UserData) return;

        const isFavorite = item.UserData.IsFavorite;
        const newFavoriteState = !isFavorite;

        // Optimistic update
        updateState({
            currentItem: {
                ...item,
                UserData: {
                    ...item.UserData,
                    IsFavorite: newFavoriteState
                }
            }
        });

        try {
            if (newFavoriteState) {
                await markFavorite(item.Id);
            } else {
                await unmarkFavorite(item.Id);
            }
        } catch (error) {
            console.error("Failed to toggle favorite", error);
            // Revert on failure
             updateState({
                currentItem: {
                    ...item,
                    UserData: {
                        ...item.UserData,
                        IsFavorite: isFavorite
                    }
                }
            });
        }
    }, [playbackState.currentItem, updateState]);

    const setPlaybackRate = useCallback((rate: number) => {
        activePlayerRef.current?.setPlaybackRate(rate);
        updateState({ playbackRate: rate });
    }, [updateState]);

    // Listen to global events or player callbacks via Context/Props passed to Players
    // Since this is a hook, it typically returns functions to be bound to player events
    
    // ...
    // ...

    const setAudioStreamIndex = useCallback((index: number) => {
        activePlayerRef.current?.setAudioStreamIndex(index);
    }, []);

    const setSubtitleStreamIndex = useCallback((index: number) => {
        activePlayerRef.current?.setSubtitleStreamIndex(index);
    }, []);

    const setPreferredQuality = useCallback((quality: string) => {
        updateState({ preferredQuality: quality });
    }, [updateState]);

    return {
        playbackState,
        play,
        pause,
        unpause,
        stop,
        next,
        previous,
        seek,
        setVolume,
        setMute,
        toggleMute,
        toggleFavorite,
        setPlaybackRate,
        setAudioStreamIndex,
        setSubtitleStreamIndex,
        registerPlayer,
        unregisterPlayer,
        reportState: updateState,
        setPreferredQuality
    };
}
