import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Hls from 'hls.js';
import { BaseItemDto, MediaSourceInfo } from "@jellyfin/sdk/lib/generated-client/models";
import { PlayOptions, Player } from '../types';
import * as htmlMediaHelper from '../utils/mediaHelper';

interface HTMLAudioPlayerProps {
    className?: string;
    onEnded?: () => void;
    onTimeUpdate?: (time: number) => void;
    onPause?: () => void;
    onPlay?: () => void;
    onError?: (error: any) => void;
    onVolumeChange?: (volume: number) => void;
}

export const HTMLAudioPlayer = forwardRef<Player, HTMLAudioPlayerProps>(({
    className,
    onEnded,
    onTimeUpdate,
    onPause,
    onPlay,
    onError,
    onVolumeChange
}, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const currentSrcRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
        name: 'HTML Audio Player',
        isLocalPlayer: true,
        id: 'htmlaudioplayer',
        canPlayMediaType: (mediaType: string) => (mediaType || '').toLowerCase() === 'audio',
        play: async (item: BaseItemDto, options?: PlayOptions) => {
            if (!audioRef.current || !options) return;

            const url = options.mediaSourceId 
                ? `/Audio/${item.Id}/universal?mediaSourceId=${options.mediaSourceId}` // Placeholder URL construction
                : `/Audio/${item.Id}/universal`; // You'll need the actual URL construction logic here or pass the full URL in options

            // In a real scenario, options.url should probably be passed or derived correctly using an API client
            // For now assuming options has a url property or we construct it.
            // Let's assume options has a 'url' property for this implementation or we handle it in the hook.
            const playUrl = (options as any).url || url;

            return playInternal(playUrl, options);
        },
        pause: () => audioRef.current?.pause(),
        unpause: () => audioRef.current?.play(),
        stop: (destroy?: boolean) => {
            if (audioRef.current) {
                audioRef.current.pause();
                if (destroy) {
                   resetPlayer();
                }
            }
        },
        seek: (ticks: number) => {
            if (audioRef.current) {
                audioRef.current.currentTime = ticks / 10000000;
            }
        },
        setVolume: (val: number) => {
            if (audioRef.current) {
                audioRef.current.volume = Math.pow(val / 100, 3); // Cubic volume scaling
            }
        },
        getVolume: () => {
             if (audioRef.current) {
                return Math.pow(audioRef.current.volume, 1/3) * 100;
             }
             return 100;
        },
        setMute: (mute: boolean) => {
            if (audioRef.current) audioRef.current.muted = mute;
        },
        getMute: () => audioRef.current?.muted || false,
        setPlaybackRate: (rate: number) => {
            if (audioRef.current) audioRef.current.playbackRate = rate;
        },
        getPlaybackRate: () => audioRef.current?.playbackRate || 1,
        setAudioStreamIndex: () => {}, // Not relevant for simple audio player usually
        setSubtitleStreamIndex: () => {}, // Not relevant for audio
        destroy: resetPlayer
    }));

    const resetPlayer = () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current.load();
        }
        currentSrcRef.current = null;
    };

    const playInternal = async (url: string, options: PlayOptions) => {
         if (!audioRef.current) return;
         
         const startTicks = options.startPositionTicks || 0;
         const seconds = startTicks / 10000000;
         
         resetPlayer();

         // Check if HLS is needed
         if (htmlMediaHelper.enableHlsJsPlayer(undefined, 'Audio') && url.includes('.m3u8')) {
             if (Hls.isSupported()) {
                 const hls = new Hls();
                 hls.loadSource(url);
                 hls.attachMedia(audioRef.current);
                 hlsRef.current = hls;
                 
                 hls.on(Hls.Events.MANIFEST_PARSED, () => {
                     if(audioRef.current) {
                        audioRef.current.currentTime = seconds;
                        audioRef.current.play().catch(e => onError?.(e));
                     }
                 });
                 
                 hls.on(Hls.Events.ERROR, (event, data) => {
                     if (data.fatal) {
                         onError?.(data);
                     }
                 });
             } else if (audioRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                 audioRef.current.src = url;
                 audioRef.current.currentTime = seconds;
                 return audioRef.current.play().catch(e => onError?.(e));
             }
         } else {
             audioRef.current.src = url;
             audioRef.current.currentTime = seconds;
             return audioRef.current.play().catch(e => onError?.(e));
         }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => onTimeUpdate?.(audio.currentTime);
        const handleEnded = () => onEnded?.();
        const handlePause = () => onPause?.();
        const handlePlay = () => onPlay?.();
        const handleVolumeChange = () => onVolumeChange?.(Math.pow(audio.volume, 1/3) * 100);
        const handleError = (e: any) => onError?.(e);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('volumechange', handleVolumeChange);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('volumechange', handleVolumeChange);
            audio.removeEventListener('error', handleError);
        };
    }, [onTimeUpdate, onEnded, onPause, onPlay, onVolumeChange, onError]);

    return (
        <audio 
            ref={audioRef}
            className={`hidden ${className}`}
        />
    );
});

HTMLAudioPlayer.displayName = 'HTMLAudioPlayer';
