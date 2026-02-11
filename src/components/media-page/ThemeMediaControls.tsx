import React from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeMediaControlsProps {
  isMuted: boolean;
  isPlaying: boolean;
  toggleMute: () => void;
  togglePlay: () => void;
  isVisible: boolean;
  className?: string;
}

export const ThemeMediaControls: React.FC<ThemeMediaControlsProps> = ({
  isMuted,
  isPlaying,
  toggleMute,
  togglePlay,
  isVisible,
  className = "absolute top-8 right-6 z-50",
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`${className} flex h-11 items-center overflow-hidden rounded-xl bg-white/10 text-white backdrop-blur-md border border-white/10 shadow-lg`}
        >
          <button
            onClick={togglePlay}
            className="flex h-11 w-11 items-center justify-center transition-all hover:bg-white/10 active:scale-90"
            title={isPlaying ? "Pause theme" : "Play theme"}
          >
            {isPlaying ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <div className="h-5 w-px bg-white/10" />

          <button
            onClick={toggleMute}
            className="flex h-11 w-11 items-center justify-center transition-all hover:bg-white/10 active:scale-90"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
