import React, { useEffect, useRef } from 'react';
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { HTMLVideoPlayer } from '../players/HTMLVideoPlayer';
import { HTMLAudioPlayer } from '../players/HTMLAudioPlayer';
import { PlaybackControls } from './PlaybackControls';
import { PlaybackContextValue, usePlaybackManager } from '../hooks/usePlaybackManager';
import { Player } from '../types';

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
    manager: propManager
}) => {
    // If manager is passed via props (from Provider), use it. Otherwise, create a local one.
    const localManager = usePlaybackManager();
    const manager = propManager || localManager;
    
    const { playbackState } = manager;
    
    // Auto-play when item changes
    useEffect(() => {
        if (item) {
            manager.play(item, { startPositionTicks, ...options });
        }
    }, [item?.Id]); // Only re-run if item ID changes

    // Determine type to show appropriate UI
    const mediaType = playbackState.currentItem?.MediaType as string | undefined;
    const isVideo = playbackState.currentItem 
        && (mediaType === 'Video' 
            || mediaType === 'Movie' 
            || mediaType === 'Episode' 
            || mediaType === 'TvChannel');

    return (
        <div className={`relative group ${className}`}>
            {/* Players - always mounted but hidden if not active to preserve state if needed or for preloading */}
            {/* In a real app we might wan to unmount unused players */}
            
            <HTMLVideoPlayer 
                ref={(player: Player | null) => {
                    if (player) manager.registerPlayer('Video', player);
                    else manager.unregisterPlayer('Video');
                }}
                className={isVideo ? 'block' : 'hidden'}
                onTimeUpdate={(time) => {
                    manager.reportState({ currentTime: time });
                }}
                onEnded={() => {
                    manager.reportState({ isEnded: true });
                    manager.next();
                }}
            />
            
            <HTMLAudioPlayer 
                ref={(player: Player | null) => {
                    if (player) manager.registerPlayer('Audio', player);
                    else manager.unregisterPlayer('Audio');
                }}
                className={playbackState.currentItem?.MediaType === 'Audio' ? 'block' : 'hidden'} // Audio player is usually hidden anyway
            />

            {/* Overlay Controls */}
            {playbackState.currentItem && (
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PlaybackControls 
                        playbackState={playbackState}
                        onPlayPause={() => playbackState.paused ? manager.unpause() : manager.pause()}
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
