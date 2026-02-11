"use client";
import React, { useRef, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { SeerrRequestCard } from "./seerr-request-card";
import { SeerrRequestItem } from "../types/seerr-types";
import { StoreSeerrData } from "../actions/store/store-seerr-data";

interface SeerrRequestSectionProps {
  sectionName: string;
  items: SeerrRequestItem[];
  canManageRequests?: boolean;
}

export function SeerrRequestSection({
  sectionName,
  items,
  canManageRequests,
}: SeerrRequestSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [seerServerUrl, setSeerServerUrl] = useState<string>("");

  useEffect(() => {
    async function getSeerrData() {
      try {
        const seerrData = await StoreSeerrData.get();
        if (seerrData?.serverUrl) {
          setSeerServerUrl(seerrData.serverUrl);
        }
      } catch (error) {
        console.error("Failed to load seer server url:", error);
      }
    }
    getSeerrData();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current
        .closest('[data-slot="scroll-area"]')
        ?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement;
      if (viewport) {
        viewportRef.current = viewport;
      }
    }
  }, []);

  const scrollLeft = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative z-10 mb-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold text-foreground font-poppins">
          {sectionName}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-background/10 border-border text-foreground hover:bg-accent p-2"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-background/10 border-border text-foreground hover:bg-accent p-2"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="w-full pb-6">
        <div className="flex gap-4 w-max h-fit" ref={scrollRef}>
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0">
              <SeerrRequestCard item={item} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
