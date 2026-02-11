"use client";
import { useFormContext, useWatch } from "react-hook-form";
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
import { useMemo } from "react";
import { TranscodingSettingsFormValues } from "@/src/form-schemas/playback/transcoding";

const hardwareDecodingCodecs = [
  { label: "H264", value: "h264" },
  { label: "HEVC", value: "hevc" },
  { label: "MPEG2", value: "mpeg2video" },
  { label: "MPEG4", value: "mpeg4" },
  { label: "VC1", value: "vc1" },
  { label: "VP8", value: "vp8" },
  { label: "VP9", value: "vp9" },
  { label: "AV1", value: "av1" },
];

export function HardwareAccelerationCard() {
  const { control } = useFormContext<TranscodingSettingsFormValues>();
  const hardwareAccelerationType = useWatch({
    control,
    name: "HardwareAccelerationType",
  });

  const availableCodecs = useMemo(() => {
    switch (hardwareAccelerationType) {
      case "amf":
        return ["h264", "hevc", "mpeg2video", "vc1", "vp9", "av1"];
      case "nvenc":
      case "qsv":
      case "vaapi":
        return [
          "h264",
          "hevc",
          "mpeg2video",
          "mpeg4",
          "vc1",
          "vp8",
          "vp9",
          "av1",
        ];
      case "rkmpp":
        return ["h264", "hevc", "mpeg2video", "mpeg4", "vp8", "vp9", "av1"];
      case "videotoolbox":
        return ["h264", "hevc", "vp8", "vp9", "av1"];
      case "v4l2m2m":
        return ["h264"];
      default:
        return [];
    }
  }, [hardwareAccelerationType]);

  const showHevc10Bit = useMemo(() => {
    return ["amf", "nvenc", "qsv", "vaapi", "rkmpp"].includes(
      hardwareAccelerationType,
    );
  }, [hardwareAccelerationType]);

  const showVp910Bit = useMemo(() => {
    return ["amf", "nvenc", "qsv", "vaapi", "rkmpp"].includes(
      hardwareAccelerationType,
    );
  }, [hardwareAccelerationType]);

  const showHevcRext = useMemo(() => {
    return ["nvenc", "qsv", "vaapi"].includes(hardwareAccelerationType);
  }, [hardwareAccelerationType]);

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-lg font-semibold text-foreground">Transcoding</h3>
      </div>

      <div className="space-y-6">
        <FormField
          control={control}
          name="HardwareAccelerationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hardware acceleration</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select hardware acceleration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="amf">AMD AMF</SelectItem>
                  <SelectItem value="qsv">Intel QuickSync (QSV)</SelectItem>
                  <SelectItem value="vaapi">
                    Video Acceleration API (VAAPI)
                  </SelectItem>
                  <SelectItem value="nvenc">NVIDIA NVENC</SelectItem>
                  <SelectItem value="videotoolbox">
                    Apple VideoToolBox
                  </SelectItem>
                  <SelectItem value="v4l2m2m">Video4Linux2 (V4L2)</SelectItem>
                  <SelectItem value="rkmpp">Rockchip MPP (RKMPP)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
              <FormDescription>
                Hardware acceleration requires{" "}
                <a
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://jellyfin.org/docs/general/administration/hardware-acceleration"
                >
                  additional configuration.
                </a>
              </FormDescription>
            </FormItem>
          )}
        />

        {hardwareAccelerationType === "nvenc" && (
          <FormField
            control={control}
            name="EnableEnhancedNvdecDecoder"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable enhanced NVDEC decoder</FormLabel>
                  <FormDescription>
                    Enhanced NVDEC implementation, disable this option to use
                    CUVID if you encounter decoding errors.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        {hardwareAccelerationType === "qsv" && (
          <>
            <FormField
              control={control}
              name="QsvDevice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>QSV Device</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Specify the device for Intel QSV on a multi-GPU system. On
                    Linux, this is the render node, e.g., /dev/dri/renderD128.
                    On Windows, this is the device index starting from 0. Leave
                    blank unless you know what you are doing.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="PreferSystemNativeHwDecoder"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Prefer OS native DXVA or VA-API hardware decoders
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </>
        )}

        {hardwareAccelerationType === "vaapi" && (
          <FormField
            control={control}
            name="VaapiDevice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VA-API Device</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  This is the render node that is used for hardware
                  acceleration.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {hardwareAccelerationType !== "none" && (
          <div className="space-y-4">
            <FormLabel>Enable hardware decoding for</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hardwareDecodingCodecs
                .filter((codec) => availableCodecs.includes(codec.value))
                .map((codec) => (
                  <FormField
                    key={codec.value}
                    control={control}
                    name="HardwareDecodingCodecs"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(codec.value)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...field.value,
                                      codec.value,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== codec.value,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-normal">
                              {codec.label}
                            </FormLabel>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                ))}

              {showHevc10Bit && (
                <FormField
                  control={control}
                  name="EnableDecodingColorDepth10Hevc"
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
                          HEVC 10bit
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {showVp910Bit && (
                <FormField
                  control={control}
                  name="EnableDecodingColorDepth10Vp9"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">VP9 10bit</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {showHevcRext && (
                <FormField
                  control={control}
                  name="EnableDecodingColorDepth10HevcRext"
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
                          HEVC RExt 8/10bit
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {showHevcRext && (
                <FormField
                  control={control}
                  name="EnableDecodingColorDepth12HevcRext"
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
                          HEVC RExt 12bit
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        )}

        {hardwareAccelerationType !== "none" && (
          <div className="space-y-4">
            <FormLabel>Hardware encoding options</FormLabel>
            <FormField
              control={control}
              name="EnableHardwareEncoding"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable hardware encoding</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {hardwareAccelerationType === "vaapi" && (
              <>
                <FormField
                  control={control}
                  name="EnableIntelLowPowerH264HwEncoder"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Enable Intel Low-Power H.264 hardware encoder
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="EnableIntelLowPowerHevcHwEncoder"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Enable Intel Low-Power HEVC hardware encoder
                        </FormLabel>
                        <FormDescription>
                          Low-Power Encoding can keep unnecessary CPU-GPU sync.
                          On Linux they must be disabled if the i915 HuC
                          firmware is not configured.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
