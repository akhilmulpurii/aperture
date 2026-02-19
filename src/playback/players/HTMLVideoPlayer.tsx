import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import Hls from 'hls.js';
import { BaseItemDto, MediaSourceInfo } from "@jellyfin/sdk/lib/generated-client/models";
import { PlayOptions, Player } from '../types';
import * as htmlMediaHelper from '../utils/mediaHelper';

interface HTMLVideoPlayerProps {
    className?: string;
    onEnded?: () => void;
    onTimeUpdate?: (time: number) => void;
    onPause?: () => void;
    onPlay?: () => void;
    onError?: (error: any) => void;
    onVolumeChange?: (volume: number) => void;
    subtitleOffset?: number;
    onDurationChange?: (duration: number) => void;
    textTracks?: any[];
    subtitleStreamIndex?: number;
}

export const HTMLVideoPlayer = forwardRef<Player, HTMLVideoPlayerProps>(({
    className,
    onEnded,
    onTimeUpdate,
    onPause,
    onPlay,
    onError,
    onVolumeChange,
    subtitleOffset = 0,
    onDurationChange,
    textTracks: propTextTracks,
    subtitleStreamIndex: propSubtitleStreamIndex,
}, ref) => {
    const [textTracks, setTextTracks] = useState<any[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const pendingSeekTicks = useRef<number | null>(null);
    
    // Sync with prop changes from playback manager
    useEffect(() => {
        if (propTextTracks) {
            setTextTracks(propTextTracks);
        }
    }, [propTextTracks]);
    
    // Sync subtitle stream index from props
    useEffect(() => {
        if (propSubtitleStreamIndex !== undefined) {
            setTextTracks(prev => prev.map(t => ({
                ...t,
                default: t.index === propSubtitleStreamIndex
            })));
        }
    }, [propSubtitleStreamIndex]);
    
    // Refs to access latest props in stable imperative methods
    const propsRef = useRef({ onEnded, onTimeUpdate, onPause, onPlay, onError, onVolumeChange, onDurationChange });
    useEffect(() => {
        propsRef.current = { onEnded, onTimeUpdate, onPause, onPlay, onError, onVolumeChange, onDurationChange };
    }, [onEnded, onTimeUpdate, onPause, onPlay, onError, onVolumeChange, onDurationChange]);

    const resetPlayer = () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.removeAttribute('src'); // Clear src attribute
            videoRef.current.load();
        }
        setTextTracks([]); // Clear tracks on reset
    };

    const playInternal = async (item: BaseItemDto, url: string, options: PlayOptions) => {
        if (!videoRef.current) return;

        if (!url) {
            console.error("HTMLVideoPlayer: No URL provided for playback");
            return;
        }

        // Don't call full resetPlayer here as it clears tracks we want to set, 
        // but we need to ensure clean slate.
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        
        // Explicitly disable/clear any existing text tracks on the DOM element
        // This helps prevent old subtitles from persisting if React/Browser desyncs
        if (videoRef.current) {
            Array.from(videoRef.current.textTracks).forEach(track => {
                track.mode = 'disabled';
            });
            // Also try to remove them if they are dynamic (though React handles its own)
        }
        
        // Update tracks state
        setTextTracks([]); // Force clear first (though batching might merge this, it signals intent)
        setTimeout(() => {
            if (videoRef.current) { // Check strict validity after timeout
                 setTextTracks(options.textTracks || []);
            }
        }, 0);

        const startTicks = options.startPositionTicks || 0;
        const seconds = startTicks / 10000000;
        const onError = propsRef.current.onError;

        const isLive = item.Type === 'TvChannel' || options.mediaSource?.IsInfiniteStream;

        // Check for HLS
        if (htmlMediaHelper.enableHlsJsPlayer(undefined, 'Video') && url.includes('.m3u8')) {
             // Basic HLS check - in real app might need more robust detection via MediaSource info
             // Basic HLS check
             if (Hls.isSupported()) {
                 const hlsConfig: any = isLive ? {
                     enableWorker: true,
                     lowLatencyMode: true,
                     maxBufferLength: 30,
                     backBufferLength: 30,
                     startPosition: seconds
                 } : {
                     enableWorker: true,
                     lowLatencyMode: false,
                     // Match jellyfin-web: 240s (4 mins) buffer for VOD
                     maxBufferLength: 240, 
                     maxMaxBufferLength: 240,
                     startPosition: seconds,
                     manifestLoadingTimeOut: 20000,
                 };

                 console.log('HLS Config:', hlsConfig);

                 const hls = new Hls(hlsConfig);
                 hls.loadSource(url);
                 hls.attachMedia(videoRef.current);
                 hlsRef.current = hls;

                 hls.on(Hls.Events.MANIFEST_PARSED, () => {
                     if (videoRef.current) {
                         // Note: startPosition in config handles the initial seek
                         return videoRef.current.play().catch(e => onError?.(e));
                     }
                 });
                 
                 hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            onError?.(data);
                            resetPlayer();
                            break;
                        }
                    }
                 });
             } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                 videoRef.current.src = url;
                 videoRef.current.currentTime = seconds;
                 return videoRef.current.play().catch(e => onError?.(e));
             }
        } else {
             // Direct Play / Progressive Download / Native HLS
             videoRef.current.src = url;
             
             // In native HLS (Safari), we must wait for metadata before seeking
             if (videoRef.current.readyState >= 1) {
                 videoRef.current.currentTime = seconds;
             } else {
                 pendingSeekTicks.current = startTicks;
             }
             
             return videoRef.current.play().catch(e => {
                 if (e.name === 'NotAllowedError') {
                     console.warn("Autoplay blocked by browser. User interaction required.");
                 } else {
                     onError?.(e);
                 }
             });
        }
    };

    useImperativeHandle(ref, () => ({
        name: 'HTML Video Player',
        isLocalPlayer: true,
        id: 'htmlvideoplayer',
        canPlayMediaType: (mediaType: string) => (mediaType || '').toLowerCase() === 'video',
        play: async (item: BaseItemDto, options?: PlayOptions) => {
            if (!videoRef.current || !options) return;
            const playUrl = (options as any).url;
            return playInternal(item, playUrl, options);
        },
        pause: () => videoRef.current?.pause(),
        unpause: () => videoRef.current?.play(),
        stop: (destroy?: boolean) => {
            if (videoRef.current) {
                videoRef.current.pause();
                if (destroy) resetPlayer();
            }
        },
        seek: (ticks: number) => {
            if (videoRef.current) {
                if (videoRef.current.readyState >= 1) {
                    videoRef.current.currentTime = ticks / 10000000;
                    pendingSeekTicks.current = null;
                } else {
                    pendingSeekTicks.current = ticks;
                }
            }
        },
        setVolume: (val: number) => {
            if (videoRef.current) {
                videoRef.current.volume = Math.pow(val / 100, 3);
            }
        },
        getVolume: () => {
             if (videoRef.current) {
                return Math.pow(videoRef.current.volume, 1/3) * 100;
             }
             return 100;
        },
        setMute: (mute: boolean) => {
            if (videoRef.current) videoRef.current.muted = mute;
        },
        getMute: () => videoRef.current?.muted || false,
        setPlaybackRate: (rate: number) => {
            if (videoRef.current) videoRef.current.playbackRate = rate;
        },
        getPlaybackRate: () => videoRef.current?.playbackRate || 1,
        setAudioStreamIndex: (index: number) => console.log('Set audio index', index),
        setSubtitleStreamIndex: (index: number) => {
           setTextTracks(prev => prev.map(t => ({
               ...t,
               default: t.index === index
           })));
        },
        destroy: resetPlayer
    }), []); // Dependencies empty = stable handle

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => onTimeUpdate?.(video.currentTime);
        const handleDurationChange = () => onDurationChange?.(video.duration);
        const handleLoadedMetadata = () => {
             if (pendingSeekTicks.current !== null) {
                 video.currentTime = pendingSeekTicks.current / 10000000;
                 pendingSeekTicks.current = null;
             }
        };
        const handleEnded = () => onEnded?.();
        const handlePause = () => onPause?.();
        const handlePlay = () => onPlay?.();
        const handleVolumeChange = () => onVolumeChange?.(Math.pow(video.volume, 1/3) * 100);
        const handleError = (e: any) => onError?.(e);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('pause', handlePause);
        video.addEventListener('play', handlePlay);
        video.addEventListener('volumechange', handleVolumeChange);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('volumechange', handleVolumeChange);
            video.removeEventListener('error', handleError);
        };
    }, [onTimeUpdate, onDurationChange, onEnded, onPause, onPlay, onVolumeChange, onError]);

    return (
        <video 
            ref={videoRef}
            className={`w-full h-full bg-black ${className}`}
            crossOrigin="anonymous"
            playsInline
            // @ts-ignore - Safari specific attributes
            x-webkit-airplay="allow"
        >
        </video>
    );
});

HTMLVideoPlayer.displayName = 'HTMLVideoPlayer';
