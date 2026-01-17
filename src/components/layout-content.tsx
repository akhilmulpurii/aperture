import { useAtom } from "jotai";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import {
  isTauriMacAtom,
  isTauriFullscreenAtom,
  isFullscreenAtom,
} from "../lib/atoms";
import { useSettings } from "../contexts/settings-context";
import { useEffect } from "react";

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const [isTauriMac] = useAtom(isTauriMacAtom);
  const [isTauriFullscreen] = useAtom(isTauriFullscreenAtom);
  const [isFullscreen] = useAtom(isFullscreenAtom);

  // Function to handle opening AI Ask with fullscreen exit if needed
  const handleToggleAIAsk = async () => {
    if (isFullscreen) {
      // Exit fullscreen first when opening AI Ask
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      } catch (error) {
        console.warn("Failed to exit fullscreen:", error);
        // Still try to open AI Ask even if fullscreen exit fails
      }
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <SidebarProvider
        defaultOpen={false}
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar
          isTauriMac={isTauriMac}
          isTauriFullscreen={isTauriFullscreen}
        />
        <SidebarInset
          className={`flex-1 overflow-hidden transition-all duration-300 ease-in-out md:pl-[calc(var(--sidebar-width-icon)+1.5rem)]`}
        >
          <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
