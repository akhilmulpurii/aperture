import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Form } from "../../../components/ui/form";
import { Button } from "../../../components/ui/button";
import {
  defaultTranscodingSettingsFormValues,
  transcodingSettingsFormSchema,
  TranscodingSettingsFormValues,
} from "./schema";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "../../../lib/atoms";
import {
  fetchEncodingConfiguration,
  updateEncodingConfiguration,
} from "../../../actions";
import { HardwareAccelerationCard } from "./components/hardware-acceleration-card";
import { EncodingFormatOptionsCard } from "./components/encoding-format-options-card";
import { ToneMappingCard } from "./components/tone-mapping-card";
import { PathsCard } from "./components/paths-card";
import { GeneralTranscodingCard } from "./components/general-transcoding-card";

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
          EncoderAppPathDisplay: config.EncoderAppPathDisplay || "",
          TranscodingTempPath: config.TranscodingTempPath || "",
          FallbackFontPath: config.FallbackFontPath || "",
          EnableFallbackFont: config.EnableFallbackFont || false,
          EnableAudioVbr: config.EnableAudioVbr || false,
          DownMixAudioBoost: config.DownMixAudioBoost || 2,
          DownMixStereoAlgorithm:
            (config.DownMixStereoAlgorithm as any) || "None",
          MaxMuxingQueueSize: config.MaxMuxingQueueSize || 2048,
          EncoderPreset: (config.EncoderPreset as any) || "auto",
          H264Crf: config.H264Crf || 23,
          H265Crf: config.H265Crf || 28,
          DeinterlaceMethod: (config.DeinterlaceMethod as any) || "yadif",
          DeinterlaceDoubleRate: config.DeinterlaceDoubleRate || false,
          EnableSubtitleExtraction: config.EnableSubtitleExtraction || false,
          EnableThrottling: config.EnableThrottling || false,
          EnableSegmentDeletion: config.EnableSegmentDeletion || false,
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
        EncoderAppPathDisplay: data.EncoderAppPathDisplay,
        TranscodingTempPath: data.TranscodingTempPath,
        FallbackFontPath: data.FallbackFontPath,
        EnableFallbackFont: data.EnableFallbackFont,
        EnableAudioVbr: data.EnableAudioVbr,
        DownMixAudioBoost: data.DownMixAudioBoost,
        DownMixStereoAlgorithm: data.DownMixStereoAlgorithm as any,
        MaxMuxingQueueSize: data.MaxMuxingQueueSize,
        EncoderPreset: data.EncoderPreset as any,
        H264Crf: data.H264Crf,
        H265Crf: data.H265Crf,
        DeinterlaceMethod: data.DeinterlaceMethod as any,
        DeinterlaceDoubleRate: data.DeinterlaceDoubleRate,
        EnableSubtitleExtraction: data.EnableSubtitleExtraction,
        EnableThrottling: data.EnableThrottling,
        EnableSegmentDeletion: data.EnableSegmentDeletion,
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
          <HardwareAccelerationCard />
          <EncodingFormatOptionsCard />
          <ToneMappingCard />
          <PathsCard />
          <GeneralTranscodingCard />

          <div className="flex justify-end pt-6">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
