import { useCallback, useEffect, useRef, useState } from "react";
import {
  getThemeSongStreamUrl,
  getThemeVideoStreamUrl,
} from "../actions";
import { useMediaPlayer } from "../contexts/MediaPlayerContext";

export function useThemeMedia(itemId?: string | null) {
  const [themeVideoUrl, setThemeVideoUrl] = useState<string | null>(null);
  const [themeSongUrl, setThemeSongUrl] = useState<string | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isPlayerVisible } = useMediaPlayer();
  const shouldResumeAudioRef = useRef(false);
  const shouldResumeVideoRef = useRef(false);
  const currentItemIdRef = useRef<string | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch (error) {
        console.warn("Failed to pause theme audio:", error);
      }
      audioRef.current.src = "";
      audioRef.current = null;
    }
    shouldResumeAudioRef.current = false;
  }, []);

  const cleanupVideoElement = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
      } catch (error) {
        console.warn("Failed to pause theme video:", error);
      }
      video.removeAttribute("src");
      video.load();
    }
    shouldResumeVideoRef.current = false;
  }, []);

  useEffect(() => {
    let cancelled = false;
    cleanupAudio();
    cleanupVideoElement();
    setThemeVideoUrl(null);
    setThemeSongUrl(null);
    setVideoReady(false);
    setVideoFinished(false);

    if (!itemId) {
      currentItemIdRef.current = null;
      return;
    }

    currentItemIdRef.current = itemId;
    setIsLoadingTheme(true);

    const loadThemeMedia = async () => {
      try {
        const videoUrl = await getThemeVideoStreamUrl(itemId);
        if (cancelled) return;

        if (videoUrl) {
          setThemeVideoUrl(videoUrl);
          setThemeSongUrl(null);
          return;
        }

        const songUrl = await getThemeSongStreamUrl(itemId);
        if (!cancelled) {
          setThemeSongUrl(songUrl);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("Failed to load theme media:", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTheme(false);
        }
      }
    };

    loadThemeMedia();

    return () => {
      cancelled = true;
      cleanupAudio();
      cleanupVideoElement();
    };
  }, [itemId, cleanupAudio, cleanupVideoElement]);

  useEffect(() => {
    cleanupAudio();
    if (!themeSongUrl) return;

    const audio = new Audio(themeSongUrl);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    const startPlayback = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.warn("Theme song autoplay was blocked:", error);
      }
    };

    startPlayback();

    return () => {
      cleanupAudio();
    };
  }, [themeSongUrl, cleanupAudio]);

  useEffect(() => {
    if (!themeVideoUrl) return;
    setVideoReady(false);
    setVideoFinished(false);
  }, [themeVideoUrl]);

  const tryPlayVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video || videoFinished) return;
    try {
      await video.play();
    } catch (error) {
      console.warn("Theme video autoplay blocked:", error);
      setVideoFinished(true);
    }
  }, [videoFinished]);

  useEffect(() => {
    if (videoReady && themeVideoUrl && !videoFinished) {
      tryPlayVideo();
    }
  }, [videoReady, videoFinished, themeVideoUrl, tryPlayVideo]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (isPlayerVisible) {
      if (video && !video.paused && !videoFinished) {
        shouldResumeVideoRef.current = true;
        video.pause();
      }
      if (audio && !audio.paused) {
        shouldResumeAudioRef.current = true;
        audio.pause();
      }
    } else {
      if (shouldResumeVideoRef.current && video && !videoFinished) {
        tryPlayVideo();
        shouldResumeVideoRef.current = false;
      }
      if (shouldResumeAudioRef.current && audio) {
        audio.play().catch((error) => {
          console.warn("Failed to resume theme song:", error);
        });
        shouldResumeAudioRef.current = false;
      }
    }
  }, [isPlayerVisible, videoFinished, tryPlayVideo]);

  const handleVideoCanPlay = useCallback(() => {
    setVideoReady(true);
  }, []);

  const handleVideoEnded = useCallback(() => {
    setVideoFinished(true);
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoFinished(true);
  }, []);

  const pauseThemeMedia = useCallback(() => {
    const video = videoRef.current;
    if (video && !video.paused && !videoFinished) {
      shouldResumeVideoRef.current = true;
      video.pause();
    }
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      shouldResumeAudioRef.current = true;
      audio.pause();
    }
  }, [videoFinished]);

  const stopThemeMedia = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      shouldResumeVideoRef.current = false;
      video.pause();
      try {
        video.currentTime = 0;
      } catch (error) {
        console.warn("Failed to reset theme video:", error);
      }
    }
    const audio = audioRef.current;
    if (audio) {
      shouldResumeAudioRef.current = false;
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const showThemeVideo =
    Boolean(themeVideoUrl) && videoReady && !videoFinished;
  const shouldShowBackdropImage =
    !themeVideoUrl || !videoReady || videoFinished;

  return {
    themeVideoUrl,
    videoRef,
    showThemeVideo,
    shouldShowBackdropImage,
    hasThemeVideo: Boolean(themeVideoUrl),
    isLoadingTheme,
    handleVideoCanPlay,
    handleVideoEnded,
    handleVideoError,
    pauseThemeMedia,
    stopThemeMedia,
  };
}
