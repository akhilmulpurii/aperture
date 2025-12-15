export interface VideoQualityInput {
    videoBitrate?: number;
    videoCodec?: string;
    maxStreamingBitrate?: number;
    isAutomaticBitrateEnabled?: boolean;
    enableAuto?: boolean;
}

export interface QualityOption {
    name: string;
    bitrate: number; // 0 for Auto
    maxHeight?: number;
    selected?: boolean;
    autoText?: string;
}

export function getVideoQualityOptions(options: VideoQualityInput): QualityOption[] {
    const maxStreamingBitrate = options.maxStreamingBitrate;
    const videoBitRate = options.videoBitrate ?? -1;
    const videoCodec = options.videoCodec;
    let referenceBitRate = videoBitRate;

    const bitrateConfigurations = [
        { name: '10 Mbps', maxHeight: 1440, bitrate: 10000000 },
        { name: '8 Mbps', maxHeight: 1080, bitrate: 8000000 },
        { name: '4 Mbps', maxHeight: 720, bitrate: 4000000 },
        { name: '1.5 Mbps', maxHeight: 720, bitrate: 1500000 },
        { name: '720 kbps', maxHeight: 480, bitrate: 720000 },
        { name: '420 kbps', maxHeight: 360, bitrate: 420000 }
    ];

    const qualityOptions: QualityOption[] = [];

    const autoQualityOption: QualityOption = {
        name: 'Auto',
        bitrate: 0,
        selected: options.isAutomaticBitrateEnabled
    };

    if (options.enableAuto) {
        qualityOptions.push(autoQualityOption);
    }

    if (videoBitRate > 0 && videoBitRate < bitrateConfigurations[0].bitrate) {
        // Slightly increase reference bitrate for high efficiency codecs when it is not too high
        if (videoCodec && ['hevc', 'av1', 'vp9'].includes(videoCodec.toLowerCase()) && referenceBitRate <= 20000000) {
            referenceBitRate *= 1.5;
        }
        
        // Push one entry that has higher limit than video bitrate to allow using source bitrate when Auto is also limited
        // We find the LAST option that is greater than referenceBitRate
        // The original code uses .filter().pop() which gets the smallest bitrate that is still larger than referenceBitRate?
        // Wait, filter(c > ref) gets all larger bitrates. pop() gets the last one, i.e. the smallest of the larger ones. 
        // Yes, because the array is sorted descending.
        // e.g. ref=5Mb. Larger: 120...6Mb. Last is 6Mb.
        const sourceOptions = [...bitrateConfigurations].filter((c) => c.bitrate > referenceBitRate).pop();
        if (sourceOptions) {
             qualityOptions.push(sourceOptions);
        }
    }

    bitrateConfigurations.forEach((c) => {
        if (videoBitRate <= 0 || c.bitrate <= referenceBitRate) {
            qualityOptions.push(c);
        }
    });

    if (maxStreamingBitrate) {
        let selectedIndex = qualityOptions.length - 1;
        for (let i = 0, length = qualityOptions.length; i < length; i++) {
            const option = qualityOptions[i];

            if (option.bitrate > 0 && option.bitrate <= maxStreamingBitrate) {
                selectedIndex = i;
                break;
            }
        }

        const currentQualityOption = qualityOptions[selectedIndex];
        if (currentQualityOption) {
            if (!options.isAutomaticBitrateEnabled) {
                currentQualityOption.selected = true;
            } else {
                autoQualityOption.autoText = currentQualityOption.name;
            }
        }
    }

    return qualityOptions;
}
