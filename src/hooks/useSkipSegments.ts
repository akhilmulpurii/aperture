import { useState, useEffect, useCallback } from "react";
import { fetchIntroOutro, MediaSegment } from "../actions/media";

export const useSkipSegments = (itemId: string | undefined | null) => {
  const [segments, setSegments] = useState<MediaSegment[]>([]);

  useEffect(() => {
    if (!itemId) {
      setSegments([]);
      return;
    }

    fetchIntroOutro(itemId).then((response) => {
      if (response && response.Items) {
        setSegments(response.Items);
      } else {
        setSegments([]);
      }
    });
  }, [itemId]);

  const checkSegment = useCallback(
    (currentSeconds: number) => {
      const currentTicks = currentSeconds * 10000000;

      return segments.find(
        (segment) =>
          currentTicks >= segment.StartTicks && currentTicks < segment.EndTicks,
      );
    },
    [segments],
  );

  return { checkSegment, segments };
};
