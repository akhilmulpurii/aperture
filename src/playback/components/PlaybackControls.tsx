import React from 'react';
import { PlaybackState } from '../types';

interface PlaybackControlsProps {
    className?: string;
    playbackState: PlaybackState;
    onPlayPause: () => void;
    onSeek: (value: number) => void;
    onVolumeChange: (value: number) => void;
    onToggleMute: () => void;
    onNext: () => void;
    onPrevious: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
    className,
    playbackState,
    onPlayPause,
    onSeek,
    onVolumeChange,
    onToggleMute,
    onNext,
    onPrevious
}) => {
    
    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex flex-col gap-2 bg-black/80 backdrop-blur-md p-4 text-white rounded-xl ${className}`}>
            {/* Seek Bar */}
            <div className="flex items-center gap-4">
                <span className="text-xs font-mono">{formatTime(playbackState.currentTime)}</span>
                <input
                    type="range"
                    min={0}
                    max={playbackState.duration || 100}
                    value={playbackState.currentTime}
                    onChange={(e) => onSeek(parseFloat(e.target.value) * 10000000)} // ticks
                    className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary hover:h-2 transition-all"
                />
                <span className="text-xs font-mono">{formatTime(playbackState.duration)}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onPrevious} className="hover:text-primary transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
                    </button>
                    
                    <button 
                        onClick={onPlayPause} 
                        className="bg-white text-black rounded-full p-2 hover:scale-105 transition"
                    >
                        {playbackState.paused || playbackState.isEnded ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                        )}
                    </button>

                    <button onClick={onNext} className="hover:text-primary transition">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                     <button onClick={onToggleMute} className="hover:text-primary transition">
                        {playbackState.muted || playbackState.volume === 0 ? (
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        )}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={playbackState.muted ? 0 : playbackState.volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary hover:h-2 transition-all"
                    />
                </div>
            </div>
        </div>
    );
};
