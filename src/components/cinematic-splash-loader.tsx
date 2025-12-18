import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextScramble } from './motion-primitives/text-scramble';
import { cn } from '../lib/utils';
import logoImg from '../assets/logo/icon.png';
import backdropImg from '../assets/logo/backdrop.png';

interface CinematicSplashLoaderProps {
    backdropUrl?: string;
    logoUrl?: string;
    title?: string;
    tagline?: string;
    isVisible?: boolean;
    className?: string;
}


export const CinematicSplashLoader: React.FC<CinematicSplashLoaderProps> = ({ 
    backdropUrl = backdropImg, 
    logoUrl = logoImg, 
    title = "Aperture", 
    tagline = "Bringing the glory of cinema to your screen", 
    isVisible = true,
    className
}) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.5 } }}
                    className={cn(
                        "fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden font-sans",
                        className
                    )}
                >
                    <div className="absolute inset-0 z-0">
                        {backdropUrl ? (
                            <img 
                                src={backdropUrl} 
                                alt="" 
                                className="w-full h-full object-cover opacity-40 blur-sm scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-black via-gray-900 to-black opacity-50" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center max-w-4xl">
                        {logoUrl && (
                             <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                             >
                                <img 
                                    src={logoUrl} 
                                    alt="Logo" 
                                    className="h-24 md:h-32 object-contain drop-shadow-2xl"
                                />
                             </motion.div>
                        )}
                        
                        {title && (
                            <motion.h1 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl font-poppins tracking-tight"
                            >
                                {title}
                            </motion.h1>
                        )}

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
                                <span className="h-4 w-[1px] bg-white/20" />
                                <TextScramble className="text-sm font-medium text-white/70 tracking-[0.2em] uppercase">
                                    {tagline}
                                </TextScramble>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
