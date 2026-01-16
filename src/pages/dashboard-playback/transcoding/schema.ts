import * as z from "zod";

export const transcodingSettingsFormSchema = z.object({
  HardwareAccelerationType: z
    .enum([
      "none",
      "amf",
      "qsv",
      "nvenc",
      "v4l2m2m",
      "vaapi",
      "videotoolbox",
      "rkmpp",
    ])
    .default("none"),
  HardwareDecodingCodecs: z.array(z.string()).default([]),
  EnableDecodingColorDepth10Hevc: z.boolean().default(false),
  EnableDecodingColorDepth10Vp9: z.boolean().default(false),
  EnableDecodingColorDepth10HevcRext: z.boolean().default(false),
  EnableDecodingColorDepth12HevcRext: z.boolean().default(false),
  EnableHardwareEncoding: z.boolean().default(false),
  EnableEnhancedNvdecDecoder: z.boolean().default(false),
  QsvDevice: z.string().optional(),
  PreferSystemNativeHwDecoder: z.boolean().default(false),
  VaapiDevice: z.string().optional(),
  EnableIntelLowPowerH264HwEncoder: z.boolean().default(false),
  EnableIntelLowPowerHevcHwEncoder: z.boolean().default(false),
  AllowHevcEncoding: z.boolean().default(false),
  AllowAv1Encoding: z.boolean().default(false),
  EnableTonemapping: z.boolean().default(false),
  TonemappingAlgorithm: z
    .enum([
      "none",
      "clip",
      "linear",
      "gamma",
      "reinhard",
      "hable",
      "mobius",
      "bt2390",
    ])
    .default("bt2390"),
  TonemappingMode: z.enum(["auto", "max", "rgb", "lum", "itp"]).default("auto"),
  TonemappingRange: z.enum(["auto", "tv", "pc"]).default("auto"),
  TonemappingDesat: z.coerce.number().min(0).default(0),
  TonemappingPeak: z.coerce.number().min(0).default(100),
  TonemappingParam: z.coerce.number().min(0).default(0),
  EncoderAppPathDisplay: z.string().optional(),
  TranscodingTempPath: z.string().optional(),
  FallbackFontPath: z.string().optional(),
  EnableFallbackFont: z.boolean().default(false),
});

export type TranscodingSettingsFormValues = z.infer<
  typeof transcodingSettingsFormSchema
>;

export const defaultTranscodingSettingsFormValues: TranscodingSettingsFormValues =
  {
    HardwareAccelerationType: "none",
    HardwareDecodingCodecs: [],
    EnableDecodingColorDepth10Hevc: false,
    EnableDecodingColorDepth10Vp9: false,
    EnableDecodingColorDepth10HevcRext: false,
    EnableDecodingColorDepth12HevcRext: false,
    EnableHardwareEncoding: false,
    EnableEnhancedNvdecDecoder: false,
    QsvDevice: "",
    PreferSystemNativeHwDecoder: false,
    VaapiDevice: "",
    EnableIntelLowPowerH264HwEncoder: false,
    EnableIntelLowPowerHevcHwEncoder: false,
    AllowHevcEncoding: false,
    AllowAv1Encoding: false,
    EnableTonemapping: false,
    TonemappingAlgorithm: "bt2390",
    TonemappingMode: "auto",
    TonemappingRange: "auto",
    TonemappingDesat: 0,
    TonemappingPeak: 100,
    TonemappingParam: 0,
    EncoderAppPathDisplay: "",
    TranscodingTempPath: "",
    FallbackFontPath: "",
    EnableFallbackFont: false,
  };
