"use client";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { TranscodingSettingsFormValues } from "@/src/form-schemas/playback/transcoding";

const downMixStereoAlgorithms = [
  { label: "None", value: "None" },
  { label: "Dave750", value: "Dave750" },
  { label: "Nightmode Dialogue", value: "NightmodeDialogue" },
  { label: "RFC 7845", value: "Rfc7845" },
  { label: "AC-4", value: "Ac4" },
];

const encoderPresets = [
  { label: "Auto", value: "auto" },
  { label: "Very Slow", value: "veryslow" },
  { label: "Slower", value: "slower" },
  { label: "Slow", value: "slow" },
  { label: "Medium", value: "medium" },
  { label: "Fast", value: "fast" },
  { label: "Faster", value: "faster" },
  { label: "Very Fast", value: "veryfast" },
  { label: "Super Fast", value: "superfast" },
  { label: "Ultra Fast", value: "ultrafast" },
];

const deinterlaceMethods = [
  { label: "YADIF", value: "yadif" },
  { label: "BWDIF", value: "bwdif" },
];

export function GeneralTranscodingCard() {
  const { control } = useFormContext<TranscodingSettingsFormValues>();

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <div className="space-y-6">
        <FormField
          control={control}
          name="EnableAudioVbr"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">
                  Enable VBR audio encoding
                </FormLabel>
                <FormDescription>
                  Variable bitrate offers better quality to average bitrate
                  ratio, but in some rare cases may cause buffering and
                  compatibility issues.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="DownMixAudioBoost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio boost when downmixing</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormDescription>
                  Boost audio when downmixing. A value of one will preserve the
                  original volume.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="DownMixStereoAlgorithm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stereo Downmix Algorithm</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {downMixStereoAlgorithms.map((algorithm) => (
                      <SelectItem key={algorithm.value} value={algorithm.value}>
                        {algorithm.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Algorithm used to downmix multi-channel audio to stereo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="MaxMuxingQueueSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max muxing queue size</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Maximum number of packets that can be buffered while waiting
                  for all streams to initialize. Try to increase it if you still
                  meet &quot;Too many packets buffered for output stream&quot;
                  error in FFmpeg logs. The recommended value is 2048.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="EncoderPreset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Encoding Preset</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select preset" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {encoderPresets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Pick a faster value to improve performance, or a slower value
                  to improve quality.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="H265Crf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>H.265 encoding CRF</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={51} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="H264Crf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>H.264 encoding CRF</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={51} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2">
            <p className="text-[0.8rem] text-muted-foreground">
              The &apos;Constant Rate Factor&apos; (CRF) is the default quality
              setting for the x264 and x265 software encoders. You can set the
              values between 0 and 51, where lower values would result in better
              quality (at the expense of higher file sizes). Sane values are
              between 18 and 28. The default for x264 is 23, and for x265 is 28,
              so you can use this as a starting point. Hardware encoders do not
              use these settings.
            </p>
          </div>

          <FormField
            control={control}
            name="DeinterlaceMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deinterlacing method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {deinterlaceMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the deinterlacing method to use when software
                  transcoding interlaced content. When hardware acceleration
                  supporting hardware deinterlacing is enabled the hardware
                  deinterlacer will be used instead of this setting.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="DeinterlaceDoubleRate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">
                  Double the frame rate when deinterlacing
                </FormLabel>
                <FormDescription>
                  This setting uses the field rate when deinterlacing, often
                  referred to as bob deinterlacing, which doubles the frame rate
                  of the video to provide full motion like what you would see
                  when viewing interlaced video on a TV.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="EnableSubtitleExtraction"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">
                  Allow subtitle extraction on the fly
                </FormLabel>
                <FormDescription>
                  Embedded subtitles can be extracted from videos and delivered
                  to clients in plain text, in order to help prevent video
                  transcoding. On some systems this can take a long time and
                  cause video playback to stall during the extraction process.
                  Disable this to have embedded subtitles burned in with video
                  transcoding when they are not natively supported by the client
                  device.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="EnableThrottling"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">
                  Throttle Transcodes
                </FormLabel>
                <FormDescription>
                  When a transcode or remux gets far enough ahead from the
                  current playback position, pause the process so it will
                  consume fewer resources. This is most useful when watching
                  without seeking often. Turn this off if you experience
                  playback issues.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="EnableSegmentDeletion"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">Delete segments</FormLabel>
                <FormDescription>
                  Delete old segments after they have been downloaded by the
                  client. This prevents having to store the entire transcoded
                  file on disk. Turn this off if you experience playback issues.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
