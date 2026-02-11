"use client";
import { useEffect, useState } from "react";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models/base-item-dto";
import { fetchHeroItems } from "../../actions/media";
import { HeroCarousel } from "./hero-carousel";
import { Skeleton } from "../ui/skeleton";

interface HeroSectionProps {
  serverUrl: string | null;
}

export function HeroSection({ serverUrl }: HeroSectionProps) {
  const [items, setItems] = useState<BaseItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHeroItems() {
      if (!serverUrl) return;
      try {
        const heroItems = await fetchHeroItems();
        setItems(heroItems);
      } catch (error) {
        console.error("Error loading hero items", error);
      } finally {
        setLoading(false);
      }
    }

    loadHeroItems();
  }, [serverUrl]);

  if (loading) {
    return (
      <div className="w-full h-[65vh] min-h-125 mb-8 relative px-4">
        <Skeleton className="w-full h-full rounded-xl" />
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="w-full mb-8 relative fade-in animate-in duration-500">
      <HeroCarousel items={items} serverUrl={serverUrl!} />
    </div>
  );
}
