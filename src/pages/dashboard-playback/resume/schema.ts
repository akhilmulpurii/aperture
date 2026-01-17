import * as z from "zod";

export const resumeSettingsFormSchema = z.object({
  MinResumePct: z.coerce.number().min(0).max(100).default(5),
  MaxResumePct: z.coerce.number().min(0).max(100).default(90),
  MinAudiobookResume: z.coerce.number().min(0).default(5),
  MaxAudiobookResume: z.coerce.number().min(0).default(5),
  MinResumeDurationSeconds: z.coerce.number().min(0).default(300),
});

export type ResumeSettingsFormValues = z.infer<typeof resumeSettingsFormSchema>;

export const defaultResumeSettingsFormValues: ResumeSettingsFormValues = {
  MinResumePct: 5,
  MaxResumePct: 90,
  MinAudiobookResume: 5,
  MaxAudiobookResume: 5,
  MinResumeDurationSeconds: 300,
};
