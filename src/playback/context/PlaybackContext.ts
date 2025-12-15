import { createContext, useContext } from 'react';
import { PlaybackContextValue } from '../hooks/usePlaybackManager';

export const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function usePlaybackContext() {
    const context = useContext(PlaybackContext);
    if (!context) {
        throw new Error("usePlaybackContext must be used within a PlaybackProvider");
    }
    return context;
}
