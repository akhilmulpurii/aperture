import Hls from 'hls.js';
import { MediaSourceInfo } from "@jellyfin/sdk/lib/generated-client/models";

// TODO: Replace with actual browser detection or use a library if needed
const browser = {
    iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
    safari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    tizen: /tizen/.test(navigator.userAgent.toLowerCase()),
    web0s: /web0s/.test(navigator.userAgent.toLowerCase()),
    android: /android/.test(navigator.userAgent.toLowerCase()),
    chrome: /chrome/.test(navigator.userAgent.toLowerCase()),
    edgeChromium: /edg/.test(navigator.userAgent.toLowerCase()),
    opera: /opr/.test(navigator.userAgent.toLowerCase()),
};

export function canPlayNativeHls(): boolean {
    const media = document.createElement('video');
    return !!(media.canPlayType('application/x-mpegURL').replace(/no/, '')
            || media.canPlayType('application/vnd.apple.mpegURL').replace(/no/, ''));
}

export function enableHlsJsPlayer(runTimeTicks: number | undefined, mediaType: string): boolean {
    if (window.MediaSource == null) {
        return false;
    }

    if (browser.iOS) {
        return false;
    }

    if (browser.tizen || browser.web0s) {
        return false;
    }

    if (canPlayNativeHls()) {
        if (browser.android && (mediaType === 'Audio' || mediaType === 'Video')) {
            return true;
        }

        if (browser.chrome || browser.edgeChromium || browser.opera) {
            return true;
        }

        if (runTimeTicks) {
            return false;
        }
    }

    return true;
}

export function isValidDuration(duration: number): boolean {
    return !!(duration
            && !isNaN(duration)
            && duration !== Number.POSITIVE_INFINITY
            && duration !== Number.NEGATIVE_INFINITY);
}

export function getBufferedRanges(transcodingOffsetTicks: number = 0, elem: HTMLMediaElement) {
    const ranges = [];
    const seekable = elem.buffered || [];

    const offset = transcodingOffsetTicks;

    for (let i = 0, length = seekable.length; i < length; i++) {
        let start = seekable.start(i);
        let end = seekable.end(i);

        if (!isValidDuration(start)) {
            start = 0;
        }
        if (!isValidDuration(end)) {
            end = 0;
            continue;
        }

        ranges.push({
            start: (start * 10000000) + offset,
            end: (end * 10000000) + offset
        });
    }

    return ranges;
}
