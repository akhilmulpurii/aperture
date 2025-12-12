
import { motion } from "framer-motion";

export function AmbientLight() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 mix-blend-screen">
      {/* Moving Light Leak / Flare */}
      <motion.div
        className="absolute top-[-50%] left-[-20%] w-[100%] h-[200%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 blur-3xl opacity-30"
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut",
        }}
      />
      
      {/* Gentle Pulse Glow */}
      <motion.div 
        className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-radial-gradient from-primary/10 to-transparent blur-3xl rounded-full"
        animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
        }}
      />
    </div>
  );
}
