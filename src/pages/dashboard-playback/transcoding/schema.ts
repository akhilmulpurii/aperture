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
});

export type TranscodingSettingsFormValues = z.infer<typeof transcodingSettingsFormSchema>;

export const defaultTranscodingSettingsFormValues: TranscodingSettingsFormValues = {
  HardwareAccelerationType: "none",
};
