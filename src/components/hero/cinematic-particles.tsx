"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CinematicParticles() {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; duration: number }[]
  >([]);

  useEffect(() => {
    // Generate initial dust specks
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1, // 1px to 4px
      duration: Math.random() * 10 + 10, // 10s to 20s float time
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20 blur-[1px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100], // Float up
            opacity: [0, 0.4, 0], // Fade in and out
            scale: [1, 1.2, 1], // Pulse slightly
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.5, 1],
          }}
        />
      ))}
    </div>
  );
}
