import * as z from "zod";

export const trickplaySettingsFormSchema = z.object({
  EnableHwAcceleration: z.boolean().default(true),
  EnableHwEncoding: z.boolean().default(false),
  EnableKeyFrameOnlyExtraction: z.boolean().default(false),
  ScanBehavior: z.enum(["NonBlocking", "Blocking"]).default("NonBlocking"),
  ProcessPriority: z
    .enum(["Normal", "Idle", "High", "RealTime", "BelowNormal", "AboveNormal"])
    .default("BelowNormal"),
  Interval: z.coerce.number().min(0).default(10000),
  WidthResolutions: z.string().default("320"),
  TileWidth: z.coerce.number().min(1).default(10),
  TileHeight: z.coerce.number().min(1).default(10),
  Qscale: z.coerce.number().min(2).max(31).default(4),
  JpegQuality: z.coerce.number().min(0).max(100).default(90),
  ProcessThreads: z.coerce.number().min(1).default(1),
});

export type TrickplaySettingsFormValues = z.infer<typeof trickplaySettingsFormSchema>;

export const defaultTrickplaySettingsFormValues: TrickplaySettingsFormValues = {
  EnableHwAcceleration: true,
  EnableHwEncoding: false,
  EnableKeyFrameOnlyExtraction: false,
  ScanBehavior: "NonBlocking",
  ProcessPriority: "BelowNormal",
  Interval: 10000,
  WidthResolutions: "320",
  TileWidth: 10,
  TileHeight: 10,
  Qscale: 4,
  JpegQuality: 90,
  ProcessThreads: 1,
};
