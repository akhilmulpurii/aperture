"use client";
import { useAtom } from "jotai";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
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
        <AppSidebar />
        <SidebarInset
          className={`flex-1 overflow-hidden transition-all duration-300 ease-in-out md:pl-[calc(var(--sidebar-width-icon)+1.5rem)]`}
        >
          <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
