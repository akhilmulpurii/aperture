import React, { useEffect, useRef } from 'react';
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { HTMLVideoPlayer } from '../players/HTMLVideoPlayer';
import { HTMLAudioPlayer } from '../players/HTMLAudioPlayer';
import { PlaybackControls } from './PlaybackControls';
import { PlaybackContextValue, usePlaybackManager } from '../hooks/usePlaybackManager';
import { Player } from '../types';
import { VideoOSD } from './VideoOSD';

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

    const activePlayerType = playbackState.currentItem 
        ? (['Audio', 'Music'].includes(playbackState.currentItem.MediaType as string) ? 'Audio' : 'Video')
        : 'Video';

    const isVideo = playbackState.currentItem 
        && (activePlayerType === 'Video');

    const aspectRatioClass = 
        playbackState.aspectRatio === 'fill' ? 'object-fill' :
        playbackState.aspectRatio === 'cover' ? 'object-cover' :
        'object-contain';

    const { registerPlayer, unregisterPlayer } = manager;
    
    // Stable ref callback for Video Player
    const videoRefCallback = React.useCallback((player: Player | null) => {
        if (player) registerPlayer('Video', player);
        else unregisterPlayer('Video');
    }, [registerPlayer, unregisterPlayer]);

    // Stable ref callback for Audio Player
    const audioRefCallback = React.useCallback((player: Player | null) => {
        if (player) registerPlayer('Audio', player);
        else unregisterPlayer('Audio');
    }, [registerPlayer, unregisterPlayer]);

    return (
        <div className={`relative bg-black flex flex-col justify-center items-center ${className} group`}>
             <div className="w-full h-full"> 
                {/* Render the appropriate player */}
                <HTMLVideoPlayer 
                    ref={videoRefCallback}
                    className={activePlayerType === 'Video' ? `block w-full h-full ${aspectRatioClass}` : 'hidden'}
                    subtitleOffset={playbackState.subtitleOffset || 0}
                    onTimeUpdate={(time) => {
                         manager.reportState({ currentTime: time });
                    }}
                    onDurationChange={(duration) => {
                         manager.reportState({ duration });
                    }}
                    onEnded={() => {
                         manager.reportState({ isEnded: true });
                         manager.next();
                    }}
                />
                <HTMLAudioPlayer 
                    ref={audioRefCallback}
                    className={activePlayerType === 'Audio' ? 'block' : 'hidden'} 
                />
             </div>

            {/* Overlay Controls */}
             {isVideo ? (
                 <VideoOSD manager={manager} />
             ) : (
                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <PlaybackControls 
                         playbackState={manager.playbackState}
                         onPlayPause={() => manager.playbackState.paused ? manager.unpause() : manager.pause()}
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
