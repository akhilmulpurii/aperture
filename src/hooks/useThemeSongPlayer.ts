import { useCallback, useEffect, useRef, useState } from "react";
import { getThemeSongStreamUrl } from "../actions";
import { useMediaPlayer } from "../contexts/MediaPlayerContext";

export function useThemeSongPlayer(itemId?: string | null) {
  const [themeUrl, setThemeUrl] = useState<string | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldResumeRef = useRef(false);
  const { isPlayerVisible } = useMediaPlayer();

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    shouldResumeRef.current = false;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadThemeSong = async () => {
      if (!itemId) {
        if (!cancelled) {
          cleanupAudio();
          setThemeUrl(null);
        }
        return;
      }

      setIsLoadingTheme(true);
      try {
        const url = await getThemeSongStreamUrl(itemId);
        if (!cancelled) {
          setThemeUrl(url);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("Unable to load theme song:", error);
          setThemeUrl(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTheme(false);
        }
      }
    };

    loadThemeSong();

    return () => {
      cancelled = true;
      cleanupAudio();
    };
  }, [itemId, cleanupAudio]);

  useEffect(() => {
    cleanupAudio();
    if (!themeUrl) return;

    const audio = new Audio(themeUrl);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    const handleEnded = () => {
      audio.currentTime = 0;
      audio.play().catch(() => undefined);
    };

    audio.addEventListener("ended", handleEnded);

    const startPlayback = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.warn("Theme autoplay was blocked:", error);
      }
    };

    startPlayback();

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [themeUrl, cleanupAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayerVisible) {
      if (!audio.paused) {
        shouldResumeRef.current = true;
      }
      audio.pause();
    } else if (shouldResumeRef.current) {
      audio.play().catch(() => undefined);
      shouldResumeRef.current = false;
    }
  }, [isPlayerVisible]);

  const pauseForPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const wasPlaying = !audio.paused;
    audio.pause();
    if (wasPlaying) {
      shouldResumeRef.current = true;
    }
  }, []);

  const stopThemeSong = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    shouldResumeRef.current = false;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  return {
    hasThemeSong: Boolean(themeUrl),
    isLoadingTheme,
    pauseForPlayback,
    stopThemeSong,
  };
}
