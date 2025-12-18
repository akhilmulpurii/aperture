import { useCallback, useEffect, useRef, useState } from "react";
import { getThemeSongStreamUrl, getThemeVideoStreamUrl } from "../actions";
import { usePlaybackContext } from "../playback/context/PlaybackContext";
import { useSettings } from "../contexts/settings-context";

export function useThemeMedia(itemId?: string | null) {
  const [themeVideoUrl, setThemeVideoUrl] = useState<string | null>(null);
  const [themeSongUrl, setThemeSongUrl] = useState<string | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
 
  const { playbackState } = usePlaybackContext();
  const isPlayerActive = !!playbackState.currentItem;

  const { enableThemeBackdrops, enableThemeSongs } = useSettings();
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    cleanupAudio();
    cleanupVideoElement();
    setThemeVideoUrl(null);
    setThemeSongUrl(null);
    setVideoReady(false);
    setVideoFinished(false);

    if (!itemId || isPlayerActive) {
      currentItemIdRef.current = null;
      return;
    }

    currentItemIdRef.current = itemId;
    setIsLoadingTheme(true);

    const loadThemeMedia = async () => {
      try {
        let videoUrl = null;
        if (enableThemeBackdrops) {
          videoUrl = await getThemeVideoStreamUrl(itemId);
        }

        if (cancelled) return;

        if (videoUrl) {
          setThemeVideoUrl(videoUrl);
          setThemeSongUrl(null);
          return;
        }

        let songUrl = null;
        if (enableThemeSongs) {
          songUrl = await getThemeSongStreamUrl(itemId);
        }

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
  }, [itemId, cleanupAudio, cleanupVideoElement, isPlayerActive]);

  useEffect(() => {
    cleanupAudio();
    if (!themeSongUrl || isPlayerActive) return;

    const audio = new Audio(themeSongUrl);
    audio.loop = true;
    audio.volume = 0.35;
    audio.muted = isMuted;
    audioRef.current = audio;

    const startPlayback = async () => {
      try {
        // Ensure this audio instance is still the active one
        if (audioRef.current !== audio) return;
        if (isPlaying) {
          await audio.play();
        }
      } catch (error) {
        console.warn("Theme song autoplay was blocked:", error);
      }
    };

    startPlayback();

    return () => {
      cleanupAudio();
    };
  }, [themeSongUrl, cleanupAudio, isPlayerActive, isPlaying, isMuted]);

  useEffect(() => {
    if (!themeVideoUrl) return;
    setVideoReady(false);
    setVideoFinished(false);
  }, [themeVideoUrl]);

  const tryPlayVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video || videoFinished || !isPlaying) return;
    try {
      video.muted = isMuted;
      await video.play();
    } catch (error) {
      console.warn("Theme video autoplay blocked:", error);
      // Don't set videoFinished(true) here as user might want to manually play later
      setIsPlaying(false);
    }
  }, [videoFinished, isPlaying, isMuted]);

  useEffect(() => {
    if (videoReady && themeVideoUrl && !videoFinished && isPlaying) {
      tryPlayVideo();
    }
  }, [videoReady, videoFinished, themeVideoUrl, tryPlayVideo, isPlaying]);

  // Sync video muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Sync video playing state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying && videoReady && !videoFinished) {
      video.play().catch(err => {
        console.warn("Manual theme play failed:", err);
        setIsPlaying(false);
      });
    } else {
      video.pause();
    }
  }, [isPlaying, videoReady, videoFinished]);

  // If player becomes active, we want to "unmount" (logically) the video state
  // so that when we return, we wait for readiness again.
  useEffect(() => {
    if (isPlayerActive) {
        setVideoReady(false);
    }
  }, [isPlayerActive]);

  // Removed complex pause/resume logic as we now unmount video when player is active

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
    setIsPlaying(false);
    const video = videoRef.current;
    if (video && !video.paused && !videoFinished) {
      video.pause();
    }
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
    }
  }, [videoFinished]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const stopThemeMedia = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch (error) {
        console.warn("Failed to reset theme video:", error);
      }
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const showThemeVideo = !isPlayerActive && Boolean(themeVideoUrl) && videoReady && !videoFinished;
  const shouldShowBackdropImage =
    isPlayerActive || !themeVideoUrl || !videoReady || videoFinished;

  return {
    themeVideoUrl,
    themeSongUrl,
    videoRef,
    showThemeVideo,
    shouldShowBackdropImage,
    isMuted,
    isPlaying,
    isPlayerActive,
    toggleMute,
    togglePlay,
    hasThemeMedia: Boolean(themeVideoUrl || themeSongUrl),
    isLoadingTheme,
    handleVideoCanPlay,
    handleVideoEnded,
    handleVideoError,
    pauseThemeMedia,
    stopThemeMedia,
  };
}
