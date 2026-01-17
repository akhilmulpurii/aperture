import * as z from "zod";

export const profileFormSchema = z.object({
  Name: z.string().min(1, "Name is required"),
  // General
  EnableRemoteAccess: z.boolean().default(true),
  IsAdministrator: z.boolean().default(false),
  EnableCollectionManagement: z.boolean().default(false),
  EnableSubtitleManagement: z.boolean().default(false),
  // Feature Access
  EnableLiveTvAccess: z.boolean().default(true),
  EnableLiveTvManagement: z.boolean().default(false),
  // Media Playback
  EnableMediaPlayback: z.boolean().default(true),
  EnableAudioPlaybackTranscoding: z.boolean().default(true),
  EnableVideoPlaybackTranscoding: z.boolean().default(true),
  EnablePlaybackRemuxing: z.boolean().default(true),
  ForceRemoteSourceTranscoding: z.boolean().default(false),
  RemoteClientBitrateLimit: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  // Allow Media Deletion
  EnableContentDeletion: z.boolean().default(false),
  EnableContentDeletionFromFolders: z.array(z.string()).optional(),
  // Remote Control
  EnableRemoteControlOfOtherUsers: z.boolean().default(false),
  EnableSharedDeviceControl: z.boolean().default(true),
  // Other
  IsDisabled: z.boolean().default(false),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
