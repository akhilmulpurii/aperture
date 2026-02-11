"use client";
import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models/base-item-dto";
import { HeroSlide } from "./hero-slide";

interface HeroCarouselProps {
  items: BaseItemDto[];
  serverUrl: string;
}

export function HeroCarousel({ items, serverUrl }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 8000, stopOnInteraction: true }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex">
          {items.map((item) => (
            <div
              className="flex-[0_0_100%] min-w-0 relative px-1"
              key={item.Id}
            >
              <HeroSlide item={item} serverUrl={serverUrl} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons (Hidden by default, shown on hover) */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          className="bg-background/40 border-border text-foreground hover:bg-primary hover:text-primary-foreground backdrop-blur-md h-9 w-9 rounded-md shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollNext}
          className="bg-background/40 border-border text-foreground hover:bg-primary hover:text-primary-foreground backdrop-blur-md h-9 w-9 rounded-md shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
