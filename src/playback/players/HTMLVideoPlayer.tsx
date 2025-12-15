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
}

export const HTMLVideoPlayer = forwardRef<Player, HTMLVideoPlayerProps>(({
    className,
    onEnded,
    onTimeUpdate,
    onPause,
    onPlay,
    onError,
    onVolumeChange
}, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    
    // We might need to expose these via context or props for the OSD overlay
    const [subtitleOffset, setSubtitleOffset] = useState(0);

    useImperativeHandle(ref, () => ({
        name: 'HTML Video Player',
        isLocalPlayer: true,
        id: 'htmlvideoplayer',
        canPlayMediaType: (mediaType: string) => (mediaType || '').toLowerCase() === 'video',
        play: async (item: BaseItemDto, options?: PlayOptions) => {
            if (!videoRef.current || !options) return;
             // Let's assume options has a 'url' property for this implementation or we handle it in the hook.
            const playUrl = (options as any).url;
            return playInternal(playUrl, options);
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
                videoRef.current.currentTime = ticks / 10000000;
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
        // TODO: Implement actual track switching logic
        setAudioStreamIndex: (index: number) => console.log('Set audio index', index),
        setSubtitleStreamIndex: (index: number) => {
           // TODO: Implement subtitle track switching
        },
        destroy: resetPlayer
    }));

    const resetPlayer = () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = '';
            videoRef.current.load();
        }
    };

    const playInternal = async (url: string, options: PlayOptions) => {
        if (!videoRef.current) return;

        resetPlayer();

        const startTicks = options.startPositionTicks || 0;
        const seconds = startTicks / 10000000;

        // Check for HLS
        if (htmlMediaHelper.enableHlsJsPlayer(undefined, 'Video') && (url.includes('.m3u8') || options.mediaSourceId)) {
             // Basic HLS check - in real app might need more robust detection via MediaSource info
             if (Hls.isSupported()) {
                 const hls = new Hls({
                     enableWorker: true,
                     lowLatencyMode: true,
                 });
                 hls.loadSource(url);
                 hls.attachMedia(videoRef.current);
                 hlsRef.current = hls;

                 hls.on(Hls.Events.MANIFEST_PARSED, () => {
                     if (videoRef.current) {
                         videoRef.current.currentTime = seconds;
                         videoRef.current.play().catch(e => onError?.(e));
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
             // Direct Play / Progressive Download
             videoRef.current.src = url;
             videoRef.current.currentTime = seconds;
             return videoRef.current.play().catch(e => onError?.(e));
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => onTimeUpdate?.(video.currentTime);
        const handleEnded = () => onEnded?.();
        const handlePause = () => onPause?.();
        const handlePlay = () => onPlay?.();
        const handleVolumeChange = () => onVolumeChange?.(Math.pow(video.volume, 1/3) * 100);
        const handleError = (e: any) => onError?.(e);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('pause', handlePause);
        video.addEventListener('play', handlePlay);
        video.addEventListener('volumechange', handleVolumeChange);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('volumechange', handleVolumeChange);
            video.removeEventListener('error', handleError);
        };
    }, [onTimeUpdate, onEnded, onPause, onPlay, onVolumeChange, onError]);

    return (
        <video 
            ref={videoRef}
            className={`w-full h-full object-contain bg-black ${className}`}
            crossOrigin="anonymous"
            playsInline
        />
    );
});

HTMLVideoPlayer.displayName = 'HTMLVideoPlayer';
