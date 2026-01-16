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
  };
