import * as z from "zod";

export const streamingSettingsFormSchema = z.object({
  RemoteClientBitrateLimit: z.coerce.number().min(0).default(0),
});

export type StreamingSettingsFormValues = z.infer<typeof streamingSettingsFormSchema>;

export const defaultStreamingSettingsFormValues: StreamingSettingsFormValues = {
  RemoteClientBitrateLimit: 0,
};
