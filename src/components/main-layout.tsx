"use client";
import { JotaiProvider } from "../components/jotai-provider";
import { FullscreenDetector } from "../components/fullscreen-detector";
import { LayoutContent } from "../components/layout-content";
import { useAuth } from "../hooks/useAuth";
import { PlaybackProvider } from "../playback/context/PlaybackProvider";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <JotaiProvider>
      <PlaybackProvider>
        <FullscreenDetector />
        <LayoutContent>{children}</LayoutContent>
      </PlaybackProvider>
    </JotaiProvider>
  );
}
