import React, { ReactNode } from 'react';
import { usePlaybackManager } from '../hooks/usePlaybackManager';
import { PlaybackContext } from './PlaybackContext';
import { JellyfinPlayer } from '../components/JellyfinPlayer';

interface PlaybackProviderProps {
    children: ReactNode;
}

export const PlaybackProvider: React.FC<PlaybackProviderProps> = ({ children }) => {
    const manager = usePlaybackManager();
    const { playbackState } = manager;

    // We render the player globally here. 
    // It will be hidden unless there is an active item.
    // We pass the manager instance to it.
    
    // We need to determine if we should show the player overlay (fullscreen) or if it's just a bar?
    // The previous implementation of JellyfinPlayer included controls overlay.
    // For a main app integration, usually the video player takes over the screen or is a persistent bar.
    // Given the "magical cinema feel" requested, let's assume fullscreen overlay when playing video.

    const mediaType = playbackState.currentItem?.MediaType as string | undefined;
    const isVideo = playbackState.currentItem 
        && (mediaType === 'Video' 
            || mediaType === 'Movie' 
            || mediaType === 'Episode' 
            || mediaType === 'TvChannel');

    return (
        <PlaybackContext.Provider value={manager}>
            {children}
            
            <div className={`fixed inset-0 z-[100] bg-black transition-opacity duration-500 ${isVideo ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                 {/* Only render if we have something ensuring not to break layout or if we want to keep state? 
                    JellyfinPlayer handles hiding internal players, but we want to hide the container.
                 */}
                 <JellyfinPlayer 
                    manager={manager}
                    className="w-full h-full"
                 />
                 
                {/* Close/Back button could go here if proper UI design isn't inside JellyfinPlayer yet */}
            </div>
        </PlaybackContext.Provider>
    );
};
