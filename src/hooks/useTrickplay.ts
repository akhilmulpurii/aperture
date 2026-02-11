import { useCallback, useEffect, useRef, useState } from "react";
import { TrickplayInfo } from "@jellyfin/sdk/lib/generated-client/models/trickplay-info";
import { JellyfinItem, MediaSourceInfo } from "../types/jellyfin";
import { fetchTrickplayTileImageUrl } from "../actions/media";

type TrickplayManifest =
  | Record<string, Record<string, TrickplayInfo>>
  | null
  | undefined;

interface TrickplayConfig {
  itemId: string;
  mediaSourceId?: string;
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  intervalMs: number;
  thumbnailCount?: number;
}

export type TrickplayThumbnail = {
  src: string;
  coords: [number, number, number, number];
} | null;

const buildTrickplayConfig = (
  item: JellyfinItem,
  options: { source?: MediaSourceInfo | null; fallbackItemId?: string },
): TrickplayConfig | null => {
  const manifest = (
    item as JellyfinItem & {
      Trickplay?: TrickplayManifest;
    }
  ).Trickplay as TrickplayManifest;

  const resolvedItemId = item?.Id ?? options.fallbackItemId;
  if (!resolvedItemId || !manifest) {
    return null;
  }

  const availableSources = Object.entries(manifest).filter(
    ([, widthMap]) => widthMap && Object.keys(widthMap).length > 0,
  );

  if (availableSources.length === 0) {
    return null;
  }

  const preferredSourceId =
    (options.source?.Id && manifest[options.source.Id]
      ? options.source.Id
      : undefined) ?? availableSources[0][0];

  const widthManifest = manifest[preferredSourceId];
  if (!widthManifest) {
    return null;
  }

  const widthEntries = Object.entries(widthManifest)
    .map(([widthKey, info]) => ({
      info,
      numericWidth:
        info?.Width && info.Width > 0 ? info.Width : Number(widthKey),
    }))
    .filter(
      (entry): entry is { info: TrickplayInfo; numericWidth: number } =>
        !!entry.info && !!entry.numericWidth && entry.numericWidth > 0,
    );

  if (widthEntries.length === 0) {
    return null;
  }

  const maxWidth =
    typeof window !== "undefined"
      ? window.screen.width * (window.devicePixelRatio || 1) * 0.2
      : Infinity;

  let selected = widthEntries[0];
  for (const entry of widthEntries) {
    if (
      !selected ||
      (entry.numericWidth < selected.numericWidth &&
        selected.numericWidth > maxWidth) ||
      (entry.numericWidth > selected.numericWidth &&
        entry.numericWidth <= maxWidth)
    ) {
      selected = entry;
    }
  }

  const info = selected.info;
  const width =
    (info.Width && info.Width > 0 ? info.Width : selected.numericWidth) || 0;
  const height =
    (info.Height && info.Height > 0
      ? info.Height
      : Math.round(width * 0.5625)) || 0;
  const tileWidth = info.TileWidth && info.TileWidth > 0 ? info.TileWidth : 10;
  const tileHeight =
    info.TileHeight && info.TileHeight > 0 ? info.TileHeight : 10;
  const intervalMs = info.Interval && info.Interval > 0 ? info.Interval : 1000;
  const thumbnailCount =
    info.ThumbnailCount && info.ThumbnailCount > 0
      ? info.ThumbnailCount
      : undefined;

  if (!width || !height || !tileWidth || !tileHeight || !intervalMs) {
    return null;
  }

  return {
    itemId: resolvedItemId,
    mediaSourceId: preferredSourceId,
    width,
    height,
    tileWidth,
    tileHeight,
    intervalMs,
    thumbnailCount,
  };
};

export const useTrickplay = () => {
  const [config, setConfig] = useState<TrickplayConfig | null>(null);
  const configRef = useRef<TrickplayConfig | null>(null);
  const [cacheBuster, setCacheBuster] = useState(0);
  const spriteCacheRef = useRef<Map<number, string>>(new Map());
  const pendingTilesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const clearSprites = useCallback(() => {
    pendingTilesRef.current.clear();

    spriteCacheRef.current.forEach((url) => {
      if (
        url &&
        typeof URL !== "undefined" &&
        typeof URL.revokeObjectURL === "function"
      ) {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn("Failed to revoke trickplay sprite URL:", error);
        }
      }
    });

    spriteCacheRef.current.clear();
    setCacheBuster((prev) => prev + 1);
  }, []);

  useEffect(() => {
    return () => {
      clearSprites();
    };
  }, [clearSprites]);

  const queueTile = useCallback(
    (tileIndex: number, overrideConfig?: TrickplayConfig | null) => {
      const activeConfig = overrideConfig ?? configRef.current;
      if (!activeConfig) return;
      if (
        spriteCacheRef.current.has(tileIndex) ||
        pendingTilesRef.current.has(tileIndex)
      ) {
        return;
      }

      pendingTilesRef.current.add(tileIndex);

      fetchTrickplayTileImageUrl(
        activeConfig.itemId,
        activeConfig.width,
        tileIndex,
        activeConfig.mediaSourceId,
      )
        .then((url) => {
          if (!url) {
            return;
          }
          spriteCacheRef.current.set(tileIndex, url);
          setCacheBuster((prev) => prev + 1);
        })
        .catch((error) => {
          console.warn(
            `Unable to load trickplay tile ${tileIndex} for ${activeConfig.itemId}`,
            error,
          );
        })
        .finally(() => {
          pendingTilesRef.current.delete(tileIndex);
        });
    },
    [],
  );

  const initializeTrickplay = useCallback(
    (
      item: JellyfinItem,
      source: MediaSourceInfo | null,
      fallbackId?: string,
    ) => {
      clearSprites();
      const nextConfig = buildTrickplayConfig(item, {
        source,
        fallbackItemId: fallbackId,
      });
      setConfig(nextConfig);
      if (nextConfig) {
        queueTile(0, nextConfig);
      }
    },
    [clearSprites, queueTile],
  );

  const resetTrickplay = useCallback(() => {
    clearSprites();
    setConfig(null);
  }, [clearSprites]);

  const renderThumbnail = useCallback(
    (time: number): TrickplayThumbnail => {
      if (!config || config.intervalMs <= 0) {
        return null;
      }

      const safeTime = Math.max(0, time);
      const frameIndex = Math.floor((safeTime * 1000) / config.intervalMs);
      const tilesPerImage = Math.max(1, config.tileWidth * config.tileHeight);
      const tileIndex = Math.floor(frameIndex / tilesPerImage);
      const spriteUrl = spriteCacheRef.current.get(tileIndex);

      if (!spriteUrl) {
        queueTile(tileIndex);
        return null;
      }

      const frameWithinTile = frameIndex - tileIndex * tilesPerImage;
      const column = frameWithinTile % config.tileWidth;
      const row = Math.floor(frameWithinTile / config.tileWidth);
      console.log(
        "Cache Buster:",
        cacheBuster,
        "Tile Index:",
        tileIndex,
        "Frame Index:",
        frameIndex,
      );
      return {
        src: spriteUrl,
        coords: [
          column * config.width,
          row * config.height,
          config.width,
          config.height,
        ],
      };
    },
    [config, queueTile, cacheBuster],
  );

  return {
    initializeTrickplay,
    resetTrickplay,
    renderThumbnail,
    hasTrickplay: !!config,
  };
};
