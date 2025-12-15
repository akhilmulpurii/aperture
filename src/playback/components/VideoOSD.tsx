import React, { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { isFullscreenAtom } from '../../lib/atoms';
import { PlaybackContextValue } from '../hooks/usePlaybackManager';
import { Slider } from '../../components/ui/slider';
import { Button } from '../../components/ui/button';
import { 
    Play, Pause, Volume2, VolumeX, 
    Settings, Maximize, Minimize, ArrowLeft,
    RotateCcw, RotateCw, Heart 
} from 'lucide-react';
import { formatVideoTime } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { SettingsMenu } from './SettingsMenu';

interface VideoOSDProps {
    manager: PlaybackContextValue;
    className?: string;
}

export const VideoOSD: React.FC<VideoOSDProps> = ({ manager, className }) => {
    const { playbackState } = manager;
    const { paused, currentTime, duration, currentItem, volume, muted } = playbackState;
    const [isHovering, setIsHovering] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const navigate = useNavigate();

    // Hide OSD logic
    useEffect(() => {
        const interval = setInterval(() => {
            if (!paused && Date.now() - lastActivity > 3000) {
                setIsHovering(false);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [paused, lastActivity]);

    const handleMouseMove = () => {
        setLastActivity(Date.now());
        setIsHovering(true);
    };

    const [scrubbingValue, setScrubbingValue] = useState<number | null>(null);

    const handleSeek = (value: number[]) => {
        setScrubbingValue(null);
        manager.seek(value[0] * 10000000); // convert seconds to ticks
    };
    
    // Convert ticks to seconds for slider
    const currentSeconds = currentTime; // playbackState.currentTime is in seconds
    const durationSeconds = duration;   // playbackState.duration is in seconds
    
    const displayTime = scrubbingValue !== null ? scrubbingValue : currentSeconds;

    const isVisible = isHovering || paused;

    const handleOverlayClick = () => {
        handleMouseMove();
        paused ? manager.unpause() : manager.pause();
    };

    const [isFullscreen] = useAtom(isFullscreenAtom);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => console.error("Fullscreen error:", e));
        } else {
            document.exitFullscreen().catch(e => console.error("Exit fullscreen error:", e));
        }
    };
    
    // Stop propagation for controls so they don't trigger the overlay click
    const handleControlsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleMouseMove();
    };

    return (
        <div 
            className={`absolute inset-0 z-50 flex flex-col justify-between p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 cursor-none'}`}
            onMouseMove={handleMouseMove}
            onClick={handleOverlayClick}
        >
            {/* Top Bar */}
            <div 
                className={`flex items-center justify-between transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
                onClick={handleControlsClick}
            >
                <Button variant="ghost" size="icon" onClick={() => manager.stop()}>
                    <ArrowLeft className="w-8 h-8 text-white" />
                </Button>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white drop-shadow-md">
                        {currentItem?.Name}
                    </h2>
                    {currentItem?.SeriesName && (
                        <p className="text-sm text-gray-300 drop-shadow-md">
                            {currentItem.SeriesName}
                        </p>
                    )}
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Center Play/Pause (optional, large icon) */}
            <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                {paused && (
                   <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
                       <Play className="w-16 h-16 text-white fill-white" />
                   </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div 
                className={`bg-gradient-to-t from-black/90 to-transparent p-4 pb-8 rounded-xl transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={handleControlsClick}
            >
                {/* Timeline */}
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs font-mono text-gray-300">
                        {formatVideoTime(displayTime * 10000000, durationSeconds * 10000000)}
                    </span>
                    <Slider 
                        value={[displayTime]} 
                        max={durationSeconds > 0 ? durationSeconds : 100} 
                        step={1}
                        onValueChange={(val) => {
                             setScrubbingValue(val[0]);
                        }}
                        onValueCommit={handleSeek}
                        className="flex-1 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-gray-300">
                        {formatVideoTime(durationSeconds * 10000000, durationSeconds * 10000000)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Skip Backward 10s */}
                        <Button variant="ghost" size="icon" onClick={() => manager.seek(Math.max(0, (currentTime - 10)) * 10000000)}>
                            <RotateCcw className="w-6 h-6 text-white" />
                        </Button>
                        
                        <Button variant="ghost" size="icon" onClick={paused ? manager.unpause : manager.pause}>
                            {paused ? <Play className="w-8 h-8 text-white fill-white" /> : <Pause className="w-8 h-8 text-white fill-white" />}
                        </Button>

                        {/* Skip Forward 10s */}
                        <Button variant="ghost" size="icon" onClick={() => manager.seek(Math.min(duration, (currentTime + 10)) * 10000000)}>
                            <RotateCw className="w-6 h-6 text-white" />
                        </Button>
                        
                        {/* Volume */}
                        <div className="flex items-center gap-2 group relative">
                            <Button variant="ghost" size="icon" onClick={manager.toggleMute}>
                                {muted || volume === 0 ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                            </Button>
                            <div className="w-0 overflow-hidden group-hover:w-24 transition-all duration-300 ease-in-out">
                                <Slider 
                                    value={[muted ? 0 : volume]} 
                                    max={100} 
                                    onValueChange={(val) => manager.setVolume(val[0])}
                                    className="w-24"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                         {/* Like Button */}
                         <Button variant="ghost" size="icon" onClick={() => manager.toggleFavorite()}>
                            <Heart className={`w-6 h-6 ${currentItem?.UserData?.IsFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                         </Button>
                         <SettingsMenu manager={manager} />
                         <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                            {isFullscreen ? <Minimize className="w-6 h-6 text-white" /> : <Maximize className="w-6 h-6 text-white" />}
                         </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
