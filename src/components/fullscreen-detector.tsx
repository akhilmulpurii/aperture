"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { isFullscreenAtom } from "@/src/lib/atoms";

export function FullscreenDetector() {
  const [, setIsFullscreen] = useAtom(isFullscreenAtom);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      console.log("Web API fullscreen changed:", isFullscreen);
      setIsFullscreen(isFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    const initialFullscreen = !!document.fullscreenElement;
    console.log("Initial web API fullscreen state:", initialFullscreen);
    setIsFullscreen(initialFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, [setIsFullscreen]);

  return null; // This component doesn't render anything
}
