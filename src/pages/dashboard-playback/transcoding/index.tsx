import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import {
  defaultTranscodingSettingsFormValues,
  transcodingSettingsFormSchema,
  TranscodingSettingsFormValues,
} from "./schema";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import { useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "../../../lib/atoms";
import {
  fetchEncodingConfiguration,
  updateEncodingConfiguration,
} from "../../../actions";

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

const tonemappingAlgorithms = [
  { label: "None", value: "none" },
  { label: "Clip", value: "clip" },
  { label: "Linear", value: "linear" },
  { label: "Gamma", value: "gamma" },
  { label: "Reinhard", value: "reinhard" },
  { label: "Hable", value: "hable" },
  { label: "Mobius", value: "mobius" },
  { label: "BT.2390", value: "bt2390" },
];

export default function PlaybackTranscodingPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const form = useForm<TranscodingSettingsFormValues>({
    resolver: zodResolver(transcodingSettingsFormSchema) as any,
    defaultValues: defaultTranscodingSettingsFormValues,
  });

  const hardwareAccelerationType = useWatch({
    control: form.control,
    name: "HardwareAccelerationType",
  });

  useEffect(() => {
    const loadData = async () => {
      setDashboardLoading(true);
      try {
        const config = await fetchEncodingConfiguration();

        form.reset({
          HardwareAccelerationType:
            (config.HardwareAccelerationType as any) || "none",
          HardwareDecodingCodecs: config.HardwareDecodingCodecs || [],
          EnableDecodingColorDepth10Hevc:
            config.EnableDecodingColorDepth10Hevc || false,
          EnableDecodingColorDepth10Vp9:
            config.EnableDecodingColorDepth10Vp9 || false,
          EnableDecodingColorDepth10HevcRext:
            config.EnableDecodingColorDepth10HevcRext || false,
          EnableDecodingColorDepth12HevcRext:
            config.EnableDecodingColorDepth12HevcRext || false,
          EnableHardwareEncoding: config.EnableHardwareEncoding || false,
          EnableEnhancedNvdecDecoder:
            config.EnableEnhancedNvdecDecoder || false,
          QsvDevice: config.QsvDevice || "",
          PreferSystemNativeHwDecoder:
            config.PreferSystemNativeHwDecoder || false,
          VaapiDevice: config.VaapiDevice || "/dev/dri/renderD128",
          EnableIntelLowPowerH264HwEncoder:
            config.EnableIntelLowPowerH264HwEncoder || false,
          EnableIntelLowPowerHevcHwEncoder:
            config.EnableIntelLowPowerHevcHwEncoder || false,
          AllowHevcEncoding: config.AllowHevcEncoding || false,
          AllowAv1Encoding: config.AllowAv1Encoding || false,
          EnableTonemapping: config.EnableTonemapping || false,
          TonemappingAlgorithm:
            (config.TonemappingAlgorithm as any) || "bt2390",
          TonemappingMode: (config.TonemappingMode as any) || "auto",
          TonemappingRange: (config.TonemappingRange as any) || "auto",
          TonemappingDesat: config.TonemappingDesat || 0,
          TonemappingPeak: config.TonemappingPeak || 100,
          TonemappingParam: config.TonemappingParam || 0,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load transcoding settings");
      } finally {
        setDashboardLoading(false);
      }
    };
    loadData();
  }, [setDashboardLoading, form]);

  useEffect(() => {
    if (hardwareAccelerationType === "none") {
      form.setValue("HardwareDecodingCodecs", []);
      form.setValue("EnableDecodingColorDepth10Hevc", false);
      form.setValue("EnableDecodingColorDepth10Vp9", false);
      form.setValue("EnableDecodingColorDepth10HevcRext", false);
      form.setValue("EnableDecodingColorDepth12HevcRext", false);
      form.setValue("EnableHardwareEncoding", false);
      form.setValue("EnableEnhancedNvdecDecoder", false);
      form.setValue("QsvDevice", "");
      form.setValue("PreferSystemNativeHwDecoder", false);
      form.setValue("VaapiDevice", "");
      form.setValue("EnableIntelLowPowerH264HwEncoder", false);
      form.setValue("EnableIntelLowPowerHevcHwEncoder", false);
      form.setValue("EnableTonemapping", false);
      form.setValue("TonemappingAlgorithm", "bt2390");
      form.setValue("TonemappingMode", "auto");
      form.setValue("TonemappingRange", "auto");
      form.setValue("TonemappingDesat", 0);
      form.setValue("TonemappingPeak", 100);
      form.setValue("TonemappingParam", 0);
    }
  }, [hardwareAccelerationType, form]);

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
      hardwareAccelerationType
    );
  }, [hardwareAccelerationType]);

  const showVp910Bit = useMemo(() => {
    return ["amf", "nvenc", "qsv", "vaapi", "rkmpp"].includes(
      hardwareAccelerationType
    );
  }, [hardwareAccelerationType]);

  const showHevcRext = useMemo(() => {
    return ["nvenc", "qsv", "vaapi"].includes(hardwareAccelerationType);
  }, [hardwareAccelerationType]);

  async function onSubmit(data: TranscodingSettingsFormValues) {
    setDashboardLoading(true);
    try {
      const currentConfig = await fetchEncodingConfiguration();

      const newConfig = {
        ...currentConfig,
        HardwareAccelerationType: data.HardwareAccelerationType as any,
        HardwareDecodingCodecs: data.HardwareDecodingCodecs,
        EnableDecodingColorDepth10Hevc: data.EnableDecodingColorDepth10Hevc,
        EnableDecodingColorDepth10Vp9: data.EnableDecodingColorDepth10Vp9,
        EnableDecodingColorDepth10HevcRext:
          data.EnableDecodingColorDepth10HevcRext,
        EnableDecodingColorDepth12HevcRext:
          data.EnableDecodingColorDepth12HevcRext,
        EnableHardwareEncoding: data.EnableHardwareEncoding,
        EnableEnhancedNvdecDecoder: data.EnableEnhancedNvdecDecoder,
        QsvDevice: data.QsvDevice,
        PreferSystemNativeHwDecoder: data.PreferSystemNativeHwDecoder,
        VaapiDevice: data.VaapiDevice,
        EnableIntelLowPowerH264HwEncoder: data.EnableIntelLowPowerH264HwEncoder,
        EnableIntelLowPowerHevcHwEncoder: data.EnableIntelLowPowerHevcHwEncoder,
        AllowHevcEncoding: data.AllowHevcEncoding,
        AllowAv1Encoding: data.AllowAv1Encoding,
        EnableTonemapping: data.EnableTonemapping,
        TonemappingAlgorithm: data.TonemappingAlgorithm as any,
        TonemappingMode: data.TonemappingMode as any,
        TonemappingRange: data.TonemappingRange as any,
        TonemappingDesat: data.TonemappingDesat,
        TonemappingPeak: data.TonemappingPeak,
        TonemappingParam: data.TonemappingParam,
      };

      await updateEncodingConfiguration(newConfig);
      toast.success("Transcoding settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save transcoding settings");
    } finally {
      setDashboardLoading(false);
    }
  }

  return (
    <div className="w-full pb-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
            <div className="flex flex-col space-y-1.5">
              <h3 className="text-lg font-semibold text-foreground">
                Transcoding
              </h3>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
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
                        <SelectItem value="qsv">
                          Intel QuickSync (QSV)
                        </SelectItem>
                        <SelectItem value="vaapi">
                          Video Acceleration API (VAAPI)
                        </SelectItem>
                        <SelectItem value="nvenc">NVIDIA NVENC</SelectItem>
                        <SelectItem value="videotoolbox">
                          Apple VideoToolBox
                        </SelectItem>
                        <SelectItem value="v4l2m2m">
                          Video4Linux2 (V4L2)
                        </SelectItem>
                        <SelectItem value="rkmpp">
                          Rockchip MPP (RKMPP)
                        </SelectItem>
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
                  control={form.control}
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
                          Enhanced NVDEC implementation, disable this option to
                          use CUVID if you encounter decoding errors.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {hardwareAccelerationType === "qsv" && (
                <>
                  <FormField
                    control={form.control}
                    name="QsvDevice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>QSV Device</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Specify the device for Intel QSV on a multi-GPU
                          system. On Linux, this is the render node, e.g.,
                          /dev/dri/renderD128. On Windows, this is the device
                          index starting from 0. Leave blank unless you know
                          what you are doing.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
                  control={form.control}
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
                          control={form.control}
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
                                              (value) => value !== codec.value
                                            )
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
                        control={form.control}
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
                        control={form.control}
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
                              <FormLabel className="font-normal">
                                VP9 10bit
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}

                    {showHevcRext && (
                      <FormField
                        control={form.control}
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
                        control={form.control}
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
                    control={form.control}
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
                        control={form.control}
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
                        control={form.control}
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
                                Low-Power Encoding can keep unnecessary CPU-GPU
                                sync. On Linux they must be disabled if the i915
                                HuC firmware is not configured.
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

          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-lg font-semibold text-foreground">
                  Encoding format options
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select the video encoding that Jellyfin should transcode to.
                  Jellyfin will use software encoding when hardware acceleration
                  for the selected format is not available. H264 encoding will
                  always be enabled.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="AllowHevcEncoding"
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
                          Allow encoding in HEVC format
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="AllowAv1Encoding"
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
                          Allow encoding in AV1 format
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
            <div className="flex flex-col space-y-1.5">
              <h3 className="text-lg font-semibold text-foreground">
                Tone mapping
              </h3>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="EnableTonemapping"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable Tone mapping</FormLabel>
                      <FormDescription>
                        Tone-mapping can transform the dynamic range of a video
                        from HDR to SDR while maintaining image details and
                        colors, which are very important information for
                        representing the original scene. Currently works only
                        with 10bit HDR10, HLG and DoVi videos. This requires the
                        corresponding GPGPU runtime.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="TonemappingAlgorithm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tone mapping algorithm</FormLabel>
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
                        {tonemappingAlgorithms.map((algorithm) => (
                          <SelectItem
                            key={algorithm.value}
                            value={algorithm.value}
                          >
                            {algorithm.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <FormDescription>
                      Tone mapping can be fine-tuned. If you are not familiar
                      with these options, just keep the default. The recommended
                      value is 'BT.2390'.{" "}
                      <a
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://ffmpeg.org/ffmpeg-all.html#tonemap_005fopencl"
                      >
                        (Learn more)
                      </a>
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="TonemappingMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone mapping mode</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="max">MAX</SelectItem>
                          <SelectItem value="rgb">RGB</SelectItem>
                          <SelectItem value="lum">LUM</SelectItem>
                          <SelectItem value="itp">ITP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the tone mapping mode. If you experience blown
                        out highlights try switching to the RGB mode.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="TonemappingRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone mapping range</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="tv">TV</SelectItem>
                          <SelectItem value="pc">PC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the output color range. Auto is the same as the
                        input range.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="TonemappingDesat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone mapping desat</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Apply desaturation for highlights that exceed this level
                        of brightness. The recommended value is 0 (disable).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="TonemappingPeak"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone mapping peak</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Override the embedded metadata value for the input
                        signal with this peak value instead. The default value
                        is 100 (1000nit).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="TonemappingParam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone mapping param</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tune the tone mapping algorithm. Generally leave it
                        blank.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
