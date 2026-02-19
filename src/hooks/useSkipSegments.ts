import { useState, useEffect, useCallback } from "react";
import { fetchIntroOutro, MediaSegment } from "../actions/media";

export const useSkipSegments = (itemId: string | undefined | null) => {
  const [segments, setSegments] = useState<MediaSegment[]>([]);

  useEffect(() => {
    if (!itemId) {
      setSegments([]);
      console.log('⏭️ useSkipSegments: No itemId provided');
      return;
    }

    console.log('⏭️ useSkipSegments: Fetching for itemId:', itemId);
    fetchIntroOutro(itemId).then((response) => {
      console.log('⏭️ useSkipSegments: Response received:', response);
      if (response && response.Items) {
        console.log('⏭️ useSkipSegments: Found segments:', response.Items);
        setSegments(response.Items);
      } else {
        console.log('⏭️ useSkipSegments: No Items in response');
        setSegments([]);
      }
    }).catch((error) => {
      console.error('⏭️ useSkipSegments: Fetch error:', error);
      setSegments([]);
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
