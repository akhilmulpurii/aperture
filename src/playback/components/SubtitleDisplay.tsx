import React, { useState, useEffect } from 'react';

interface SubtitleLine {
  startTime: number; // in seconds
  endTime: number;
  text: string;
}

interface SubtitleTrack {
  index: number;
  label: string;
  src: string;
  language?: string;
  kind?: string;
}

interface SubtitleDisplayProps {
  currentTime: number;
  subtitleStreamIndex?: number;
  textTracks?: SubtitleTrack[];
  isVisible?: boolean;
  isControlsVisible?: boolean;
}

/**
 * Parse HTML tags in subtitle text and convert to React elements with proper nesting
 */
function parseSubtitleHTML(text: string): React.ReactNode {
  const htmlRegex = /<(\/?)([a-z]+)>/gi;
  const segments: (React.ReactNode | { tag: string; isClosing: boolean })[] = [];
  let lastIndex = 0;
  
  let match;
  while ((match = htmlRegex.exec(text)) !== null) {
    // Add text before this tag
    if (match.index > lastIndex) {
      segments.push(text.substring(lastIndex, match.index));
    }
    
    // Add tag marker
    segments.push({
      tag: match[2].toLowerCase(),
      isClosing: match[1] === '/',
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    segments.push(text.substring(lastIndex));
  }
  
  // Recursively build React elements from segments
  function buildElements(items: any[], startIdx = 0): { elements: React.ReactNode[]; endIdx: number } {
    const elements: React.ReactNode[] = [];
    let idx = startIdx;
    
    while (idx < items.length) {
      const item = items[idx];
      
      // If it's text, just add it
      if (typeof item === 'string') {
        elements.push(item);
        idx++;
      }
      // If it's a tag
      else if (item.tag) {
        if (item.isClosing) {
          // Return to parent level
          return { elements, endIdx: idx };
        } else {
          // Open tag - recursively parse children
          const { elements: childElements, endIdx: nextIdx } = buildElements(items, idx + 1);
          
          // Create the appropriate element based on tag
          let element: React.ReactNode = <>{childElements}</>;
          
          switch (item.tag) {
            case 'i':
              element = <i key={`i-${idx}`}>{childElements}</i>;
              break;
            case 'b':
              element = <b key={`b-${idx}`}>{childElements}</b>;
              break;
            case 'u':
              element = <u key={`u-${idx}`}>{childElements}</u>;
              break;
            case 's':
              element = <s key={`s-${idx}`}>{childElements}</s>;
              break;
            default:
              element = <span key={`span-${idx}`}>{childElements}</span>;
          }
          
          elements.push(element);
          idx = nextIdx + 1; // Skip the closing tag
        }
      } else {
        idx++;
      }
    }
    
    return { elements, endIdx: items.length };
  }
  
  const { elements } = buildElements(segments);
  return elements;
}

/**
 * Parse VTT format subtitle content
 */
function parseVTT(content: string): SubtitleLine[] {
  const lines = content.split('\n');
  const subtitles: SubtitleLine[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for timestamp line (format: HH:MM:SS.mmm --> HH:MM:SS.mmm)
    if (line.includes('-->')) {
      const [startStr, endStr] = line.split('-->').map(s => s.trim());
      const startTime = timeToSeconds(startStr);
      const endTime = timeToSeconds(endStr);
      
      // Collect all text lines until next empty line
      let textLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i]);
        i++;
      }
      
      if (textLines.length > 0) {
        subtitles.push({
          startTime,
          endTime,
          text: textLines.join('\n'),
        });
      }
    }
  }
  
  return subtitles;
}

/**
 * Convert timestamp string (HH:MM:SS.mmm) to seconds
 */
function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseFloat(parts[2]) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

export const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({
  currentTime,
  subtitleStreamIndex,
  textTracks = [],
  isVisible = true,
  isControlsVisible = true,
}) => {
  const [allSubtitles, setAllSubtitles] = useState<Map<number, SubtitleLine[]>>(new Map());
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleLine | null>(null);
  const [subtitleSize, setSubtitleSize] = useState<number>(100);

  // Load subtitle size from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aperture-subtitle-size');
      if (saved) {
        setSubtitleSize(parseInt(saved, 10));
      }
    }
  }, []);

  // Listen for storage changes (subtitle size updates)
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('aperture-subtitle-size');
        if (saved) {
          setSubtitleSize(parseInt(saved, 10));
        }
      }
    };

    const handleSubtitleSizeEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.size) {
        setSubtitleSize(customEvent.detail.size);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('subtitle-size-change', handleSubtitleSizeEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('subtitle-size-change', handleSubtitleSizeEvent);
    };
  }, []);

  // Fetch and parse all subtitle files
  useEffect(() => {
    if (!textTracks || textTracks.length === 0) {
      setAllSubtitles(new Map());
      setCurrentSubtitle(null);
      return;
    }

    const loadAllSubtitles = async () => {
      const subtitleMap = new Map<number, SubtitleLine[]>();

      for (const track of textTracks) {
        try {
          const response = await fetch(track.src);
          if (!response.ok) {
            console.error(`Failed to fetch subtitles for ${track.label}:`, response.statusText);
            continue;
          }

          const content = await response.text();
          const parsed = parseVTT(content);
          subtitleMap.set(track.index, parsed);
          console.log(`📝 Subtitles loaded for ${track.label}:`, parsed.length, 'lines');
        } catch (error) {
          console.error(`Error loading subtitles for ${track.label}:`, error);
        }
      }

      setAllSubtitles(subtitleMap);
    };

    loadAllSubtitles();
  }, [textTracks]);

  // Update current subtitle based on selected track and playback time
  useEffect(() => {
    if (subtitleStreamIndex === undefined || subtitleStreamIndex === -1) {
      setCurrentSubtitle(null);
      return;
    }

    const subtitles = allSubtitles.get(subtitleStreamIndex);
    if (!subtitles || subtitles.length === 0) {
      setCurrentSubtitle(null);
      return;
    }

    const active = subtitles.find(
      (sub) => currentTime >= sub.startTime && currentTime < sub.endTime
    );

    setCurrentSubtitle(active || null);
  }, [currentTime, subtitleStreamIndex, allSubtitles]);

  if (!isVisible || !currentSubtitle) {
    return null;
  }

  return (
    <div
      className="absolute left-0 right-0 flex justify-center pointer-events-none transition-all duration-300"
      style={{
        bottom: isControlsVisible ? '176px' : '112px',
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: '95%',
          textAlign: 'center',
        }}
      >
        <div
          className="text-white leading-relaxed whitespace-pre-wrap"
          style={{
            fontSize: `${20 * (subtitleSize / 100)}px`,
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            fontWeight: 400,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 1), -2px -2px 4px rgba(0, 0, 0, 1), 2px -2px 4px rgba(0, 0, 0, 1), -2px 2px 4px rgba(0, 0, 0, 1)',
            letterSpacing: '0.5px',
            lineHeight: '1.4',
          }}
        >
          {parseSubtitleHTML(currentSubtitle.text)}
        </div>
      </div>
    </div>
  );
};
