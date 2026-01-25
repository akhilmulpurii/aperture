import { useState, useRef, useCallback, useEffect } from 'react';
import { BaseItemDto, MediaSourceInfo, SubtitlePlaybackMode } from "@jellyfin/sdk/lib/generated-client/models";
import { 
    fetchMediaDetails, 
    reportPlaybackStart, 
    reportPlaybackProgress, 
    reportPlaybackStopped,
    getAuthData,
    getStreamUrl,
    getDirectStreamUrl,
    getSubtitleTracks,
    markFavorite,
    unmarkFavorite
} from '../../actions';
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
    toggleMiniPlayer: () => void;
    setMiniPlayer: (enabled: boolean) => void;
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
        isMiniPlayer: false,
        isLoading: true,
    });

    const activePlayerRef = useRef<Player | null>(null);
    const playSessionIdRef = useRef<string>("");
    // Track latest state for reporting interval
    const latestStateRef = useRef(playbackState);
    useEffect(() => { latestStateRef.current = playbackState; }, [playbackState]);

    const updateState = useCallback((updates: Partial<PlaybackState>) => {
        setPlaybackState(prev => {
            // Auto-clear loading if we get progress or buffering finish or unpause
            const shouldClearLoading = (updates.currentTime !== undefined && updates.currentTime > 0.1) 
                || (updates.isBuffering === false)
                || (updates.paused === false);
                
            let nextLoading = prev.isLoading;
            if (shouldClearLoading) {
                nextLoading = false;
            }
            // If explicit isLoading is passed, respect it
            if (updates.isLoading !== undefined) {
                nextLoading = updates.isLoading;
            }

            return { ...prev, ...updates, isLoading: nextLoading };
        });
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

        // Ensure we have full item details (MediaSources and Trickplay)
        const hasMediaSources = itemToPlay.MediaSources && itemToPlay.MediaSources.length > 0;
        const hasTrickplay = !!(itemToPlay as any).Trickplay;
        
        if (!hasMediaSources || !hasTrickplay) {
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

        const { user } = await getAuthData();

        // Fetch Sidecar Subtitles (VTT)
        try {
             if (mediaSource?.Id && itemToPlay!.Id) {
                 const subs = await getSubtitleTracks(itemToPlay!.Id!, mediaSource.Id);
                 
                 // Apply selection logic
                 let targetIndex = options.subtitleStreamIndex; 
                 
                 if (targetIndex === undefined) {
                     const defaultSub = subs.find(s => s.default);
                     if (defaultSub) {
                         targetIndex = defaultSub.index;
                         options.subtitleStreamIndex = targetIndex;
                     }else if(user && user.Configuration && user.Configuration.SubtitleMode &&
                         user.Configuration.SubtitleLanguagePreference &&
                         user.Configuration.SubtitleMode === SubtitlePlaybackMode.Always){
                         const subtitlePreferance =
                             subs.find(s => s.language === user.Configuration!.SubtitleLanguagePreference);
                         if (subtitlePreferance) {
                             targetIndex = subtitlePreferance.index;
                             options.subtitleStreamIndex = targetIndex;
                         }
                     }
                 }
                 
                 if (targetIndex !== undefined) {
                     options.textTracks = subs.map(t => ({
                         ...t,
                         default: t.index === targetIndex
                     }));
                 } else {
                     options.textTracks = subs;
                 }
                 // Store in state so we don't re-fetch during switching
                 updateState({ textTracks: subs });
             }
        } catch (e) {
            console.error("Failed to load sidecar subtitles", e);
        }

        // Determine Default Audio Stream
        if (options.audioStreamIndex === undefined && mediaSource?.MediaStreams) {
             const audioStreams = mediaSource.MediaStreams.filter(s => s.Type === 'Audio');
             
             // Sort: Default first, then Language
             audioStreams.sort((a, b) => {
                 const defA = a.IsDefault || false;
                 const defB = b.IsDefault || false;
                 if (defA && !defB) return -1;
                 if (!defA && defB) return 1;
                 return (a.Language || "").localeCompare(b.Language || "");
             });
             
             if (audioStreams.length > 0) {
                 options.audioStreamIndex = audioStreams[0].Index;
             } else {
                 options.audioStreamIndex = 1;
             }
        }

        // Generate URL if missing
        if (!options.url && mediaSource && mediaSource.Id && itemToPlay!.Id) {
             try {
                // Optimize burn-in: If we have sidecar for selected index, don't burn in.
                let urlSubtitleIndex = options.subtitleStreamIndex;
                // Fetch subtitle tracks for client-side rendering
                if (!options.textTracks && itemToPlay?.Id && mediaSource?.Id) {
                     try {
                         const tracks = await getSubtitleTracks(itemToPlay.Id, mediaSource.Id);
                         options.textTracks = tracks;
                     } catch (e) {
                         console.warn("Failed to fetch subtitle tracks for playback", e);
                     }
                }

                if (options.textTracks && urlSubtitleIndex !== undefined && urlSubtitleIndex !== -1) {
                    const hasSidecar = options.textTracks.some(t => t.index === urlSubtitleIndex);
                    if (hasSidecar) {
                        urlSubtitleIndex = -1; 
                    }
                }

                // Optimization: If the selected subtitle stream is text-based (srt, subrip, vtt, ass, ssa),
                // we should extract it client-side instead of burning it in.
                if (urlSubtitleIndex !== undefined && urlSubtitleIndex !== -1) {
                    const selectedSub = mediaSource.MediaStreams?.find(s => s.Type === 'Subtitle' && s.Index === urlSubtitleIndex);
                    const isTextSub = selectedSub && ['subrip', 'srt', 'ass', 'ssa', 'vtt'].includes((selectedSub.Codec || '').toLowerCase());
                    if (isTextSub) {
                        // Don't burn it in (let client fetch VTT)
                        urlSubtitleIndex = -1;
                    }
                }

                const SUPPORTED_CONTAINERS = ['mp4', 'm4v', 'mov', 'webm'];
                const isContainerSupported = SUPPORTED_CONTAINERS.includes((mediaSource.Container || '').toLowerCase());

                const isDirectPlayCompatible = 
                    isContainerSupported && 
                    (mediaSource.SupportsDirectPlay || 
                    (mediaSource.Container === 'mp4' && mediaSource.MediaStreams?.some(s => s.Type === 'Video' && s.Codec === 'h264')));

                // Ensure selected bitrate allows for direct play
                const isBitrateCompatible = !options.videoBitrate || (mediaSource.Bitrate && options.videoBitrate >= mediaSource.Bitrate);

                // Ensure Audio Codec is supported by browser (AAC, MP3, Opus, FLAC, Vorbis)
                // If not, we must fallback to Direct Stream (Video Copy + Audio Transcode)
                const selectedAudio = mediaSource.MediaStreams?.find(s => s.Type === 'Audio' && s.Index === options.audioStreamIndex);
                const SUPPORTED_AUDIO_CODECS = ['aac', 'mp3', 'opus', 'flac', 'vorbis'];
                const isAudioCompatible = selectedAudio && SUPPORTED_AUDIO_CODECS.includes((selectedAudio.Codec || '').toLowerCase());

                if (isDirectPlayCompatible && urlSubtitleIndex === -1 && isBitrateCompatible && isAudioCompatible) {
                     // Try Direct Play (Static URL)
                     // Note: Direct Play doesn't support burning subtitles, so only use if no subs or sidecar subs
                     options.url = await getDirectStreamUrl(itemToPlay!.Id!, mediaSource, options.audioStreamIndex);
                } else {
                    options.url = await getStreamUrl(
                        itemToPlay!.Id!, 
                        mediaSource.Id, 
                        undefined, 
                        options.videoBitrate,
                        options.audioStreamIndex,
                        urlSubtitleIndex
                    );
                }
             } catch (e) {
                 console.error("Failed to generate stream URL", e);
             }
        }

        // Generate Session ID
        playSessionIdRef.current = crypto.randomUUID();

        activePlayerRef.current = player;
        updateState({ 
            currentItem: itemToPlay!, 
            currentMediaSource: mediaSource || null,
            paused: false, 
            isEnded: false, 
            currentTime: 0, 
            duration: (itemToPlay!.RunTimeTicks || 0) / 10000000,
            subtitleStreamIndex: options.subtitleStreamIndex,
            audioStreamIndex: options.audioStreamIndex,
            isLoading: true
        });

        // Report Start
        if (itemToPlay!.Id && mediaSource && mediaSource.Id) {
             reportPlaybackStart(
                 itemToPlay!.Id, 
                 mediaSource.Id, 
                 playSessionIdRef.current
             ).catch(e => console.error("Failed to report playback start", e));
        }

        try {
            await player.play(itemToPlay!, { ...options, mediaSource: mediaSource || undefined });
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

        const item = latestStateRef.current.currentItem;
        const mediaSource = latestStateRef.current.currentMediaSource;
        const sessionId = playSessionIdRef.current;
        if (item?.Id && mediaSource?.Id && sessionId) {
            reportPlaybackProgress(
                item.Id, mediaSource.Id, sessionId, 
                Math.floor(latestStateRef.current.currentTime * 10000000), 
                true
            ).catch(e => console.error("Failed to report pause", e));
        }
    }, [updateState]);

    const unpause = useCallback(() => {
        activePlayerRef.current?.unpause();
        updateState({ paused: false });

        const item = latestStateRef.current.currentItem;
        const mediaSource = latestStateRef.current.currentMediaSource;
        const sessionId = playSessionIdRef.current;
        if (item?.Id && mediaSource?.Id && sessionId) {
            reportPlaybackProgress(
                item.Id, mediaSource.Id, sessionId, 
                Math.floor(latestStateRef.current.currentTime * 10000000), 
                false
            ).catch(e => console.error("Failed to report unpause", e));
        }
    }, [updateState]);

    const stop = useCallback(() => {
        // Report stop
        const item = latestStateRef.current.currentItem;
        const mediaSource = latestStateRef.current.currentMediaSource;
        const sessionId = playSessionIdRef.current;
        const ticks = Math.floor(latestStateRef.current.currentTime * 10000000);
        
        if (item?.Id && mediaSource?.Id && sessionId) {
             reportPlaybackStopped(item.Id, mediaSource.Id, sessionId, ticks)
                .catch(e => console.error("Failed to report playback stopped", e));
        }

        activePlayerRef.current?.stop(true);
        activePlayerRef.current = null;
        playSessionIdRef.current = "";
        updateState({ paused: false, currentTime: 0, currentItem: null, isEnded: false });
    }, [updateState]);

    const seek = useCallback((ticks: number) => {
        const player = activePlayerRef.current;
        if (player) {
             player.seek(ticks);
             // Optimistic update to prevent UI jump-back
             updateState({ currentTime: ticks / 10000000 });
        }
    }, [activePlayerRef, updateState]);

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
        const item = playbackState.currentItem;
        if (!item) return;

        const startTicks = Math.floor(playbackState.currentTime * 10000000);

        play(item, {
            mediaSourceId: playbackState.currentMediaSource?.Id || undefined,
            startPositionTicks: startTicks,
            subtitleStreamIndex: playbackState.subtitleStreamIndex,
            audioStreamIndex: index
        });
        
        updateState({ audioStreamIndex: index });
    }, [play, playbackState.currentItem, playbackState.currentMediaSource, playbackState.currentTime, playbackState.subtitleStreamIndex, updateState]);

    const setSubtitleStreamIndex = useCallback(async (index: number) => {
        const item = playbackState.currentItem;
        const mediaSourceId = playbackState.currentMediaSource?.Id;
        
        // Try client-side switch for sidecar/VTT
        if (item?.Id && mediaSourceId && activePlayerRef.current?.name === 'HTML Video Player') {
            // Use cached tracks from state if available
            const subs = playbackState.textTracks || [];
            
            // If its "Off" (-1), we can always handle it client-side
            if (index === -1) {
                activePlayerRef.current.setSubtitleStreamIndex(index);
                updateState({ subtitleStreamIndex: index });
                return;
            }

            const targetTrack = subs.find(t => t.index === index);
            
            // If target is a valid sidecar track, switch instantly without reload
            if (targetTrack) {
                 activePlayerRef.current.setSubtitleStreamIndex(index);
                 updateState({ subtitleStreamIndex: index });
                 return;
            }

            // If not in state, try one quick fetch just in case
            try {
                const freshSubs = await getSubtitleTracks(item.Id, mediaSourceId);
                const freshTarget = freshSubs.find(t => t.index === index);
                if (freshTarget) {
                    updateState({ textTracks: freshSubs, subtitleStreamIndex: index });
                    activePlayerRef.current.setSubtitleStreamIndex(index);
                    return;
                }
            } catch (e) {
                console.warn("Failed to check sidecar tracks during switch", e);
            }
        }

        // Reload stream with new subtitle index (handles burn-in/transcoding)
        if (!item) return;
 
        const startTicks = Math.floor(playbackState.currentTime * 10000000);
        
        play(item, {
            mediaSourceId: playbackState.currentMediaSource?.Id || undefined,
            startPositionTicks: startTicks,
            subtitleStreamIndex: index,
        });
        
        updateState({ subtitleStreamIndex: index });
    }, [play, playbackState.currentItem, playbackState.currentMediaSource, playbackState.currentTime, playbackState.textTracks, updateState]);

    const setPreferredQuality = useCallback((quality: string) => {
        updateState({ preferredQuality: quality });
    }, [updateState]);

    // Progress Reporting Effect
    useEffect(() => {
        const report = async () => {
            const state = latestStateRef.current;
            const item = state.currentItem;
            const mediaSource = state.currentMediaSource;
            const sessionId = playSessionIdRef.current;
            
            if (!item?.Id || !mediaSource?.Id || !sessionId || state.paused) return;

            await reportPlaybackProgress(
                item.Id,
                mediaSource.Id,
                sessionId,
                Math.floor(state.currentTime * 10000000),
                state.paused
            ).catch(e => console.error("Failed to report progress", e));
        };

        const interval = setInterval(report, 10000); // 10s interval
        return () => clearInterval(interval);
    }, []);

    const toggleMiniPlayer = useCallback(() => {
        setPlaybackState(prev => ({ ...prev, isMiniPlayer: !prev.isMiniPlayer }));
    }, []);

    const setMiniPlayer = useCallback((enabled: boolean) => {
        setPlaybackState(prev => ({ ...prev, isMiniPlayer: enabled }));
    }, []);

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
        setPreferredQuality,
        toggleMiniPlayer,
        setMiniPlayer
    };
}
