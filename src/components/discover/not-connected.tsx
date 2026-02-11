"use client"
import { Button } from "../ui/button";
import { Settings2, Globe, Server } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function NotConnected() {
  return (
    <div className="flex flex-col items-center justify-center pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 flex max-w-md flex-col items-center space-y-8 text-center"
      >
        <div className="relative">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-2xl backdrop-blur-md"
          >
            <Globe className="h-10 w-10 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />

            <div className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-white/10 shadow-lg">
              <Server className="h-4 w-4 text-muted-foreground" />
            </div>
          </motion.div>
          <div className="absolute inset-0 -z-10 animate-ping rounded-3xl bg-primary/20 opacity-20 duration-3000" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-poppins">
            Discover Content
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Integrate with Overseerr or Jellyseerr to explore, request, and
            discover new media directly within Aperture.
          </p>
        </div>

        <Button
          size="lg"
          asChild
          className="h-12 rounded-full px-8 font-medium transition-all hover:scale-105 active:scale-95"
        >
          <Link href="/settings" className="flex items-center gap-2">
            <span>Configure Integration</span>
            <Settings2 className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
