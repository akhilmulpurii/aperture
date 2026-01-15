import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserDto } from "@jellyfin/sdk/lib/generated-client/models";
import { Input } from "../../ui/input";
import { Checkbox } from "../../ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useEffect, useState } from "react";
import { getUserImageUrl, uploadUserImage } from "../../../actions";
import { Upload, X } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";

const profileFormSchema = z.object({
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
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  // Allow Media Deletion
  EnableContentDeletion: z.boolean().default(false),
  // Remote Control
  EnableRemoteControlOfOtherUsers: z.boolean().default(false),
  EnableSharedDeviceControl: z.boolean().default(true),
  // Other
  IsDisabled: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileTab({ user }: { user?: UserDto }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema) as any,
    defaultValues: {
      Name: user?.Name || "",
      EnableRemoteAccess: user?.Policy?.EnableRemoteAccess ?? true,
      IsAdministrator: user?.Policy?.IsAdministrator ?? false,
      EnableCollectionManagement:
        user?.Policy?.EnableCollectionManagement ?? false,
      EnableSubtitleManagement: user?.Policy?.EnableSubtitleManagement ?? false,
      EnableLiveTvAccess: user?.Policy?.EnableLiveTvAccess ?? true,
      EnableLiveTvManagement: user?.Policy?.EnableLiveTvManagement ?? false,
      EnableMediaPlayback: user?.Policy?.EnableMediaPlayback ?? true,
      EnableAudioPlaybackTranscoding:
        user?.Policy?.EnableAudioPlaybackTranscoding ?? true,
      EnableVideoPlaybackTranscoding:
        user?.Policy?.EnableVideoPlaybackTranscoding ?? true,
      EnablePlaybackRemuxing: user?.Policy?.EnablePlaybackRemuxing ?? true,
      ForceRemoteSourceTranscoding:
        user?.Policy?.ForceRemoteSourceTranscoding ?? false,
      RemoteClientBitrateLimit: user?.Policy?.RemoteClientBitrateLimit
        ? user.Policy.RemoteClientBitrateLimit / 1000000
        : undefined,
      EnableContentDeletion: user?.Policy?.EnableContentDeletion ?? false,
      EnableRemoteControlOfOtherUsers:
        user?.Policy?.EnableRemoteControlOfOtherUsers ?? false,
      EnableSharedDeviceControl:
        user?.Policy?.EnableSharedDeviceControl ?? true,
      IsDisabled: user?.Policy?.IsDisabled ?? false,
    },
  });

  useEffect(() => {
    if (user?.Id) {
      getUserImageUrl(user.Id)
        .then(setAvatarUrl)
        .catch(() => setAvatarUrl(null));

      form.reset({
        Name: user.Name || "",
        EnableRemoteAccess: user.Policy?.EnableRemoteAccess ?? true,
        IsAdministrator: user.Policy?.IsAdministrator ?? false,
        EnableCollectionManagement:
          user.Policy?.EnableCollectionManagement ?? false,
        EnableSubtitleManagement:
          user.Policy?.EnableSubtitleManagement ?? false,
        EnableLiveTvAccess: user.Policy?.EnableLiveTvAccess ?? true,
        EnableLiveTvManagement: user.Policy?.EnableLiveTvManagement ?? false,
        EnableMediaPlayback: user.Policy?.EnableMediaPlayback ?? true,
        EnableAudioPlaybackTranscoding:
          user.Policy?.EnableAudioPlaybackTranscoding ?? true,
        EnableVideoPlaybackTranscoding:
          user.Policy?.EnableVideoPlaybackTranscoding ?? true,
        EnablePlaybackRemuxing: user.Policy?.EnablePlaybackRemuxing ?? true,
        ForceRemoteSourceTranscoding:
          user.Policy?.ForceRemoteSourceTranscoding ?? false,
        RemoteClientBitrateLimit: user.Policy?.RemoteClientBitrateLimit
          ? user.Policy.RemoteClientBitrateLimit / 1000000 // Convert back to Mbps
          : undefined,
        EnableContentDeletion: user.Policy?.EnableContentDeletion ?? false,
        EnableRemoteControlOfOtherUsers:
          user.Policy?.EnableRemoteControlOfOtherUsers ?? false,
        EnableSharedDeviceControl:
          user.Policy?.EnableSharedDeviceControl ?? true,
        IsDisabled: user.Policy?.IsDisabled ?? false,
      });
    }
  }, [user, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user?.Id) {
      try {
        await uploadUserImage(user.Id, file);
        // Refresh image
        const newUrl = await getUserImageUrl(user.Id);
        setAvatarUrl(`${newUrl}&t=${Date.now()}`);
      } catch (error) {
        console.error("Failed to upload image", error);
      }
    }
  };

  function onSubmit(data: ProfileFormValues) {
    console.log("Submitting form data:", data);
    // TODO: Implement update user API call
  }

  const Name = form.watch("Name");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full pb-10"
      >
        {/* General Section */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">General</h3>
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            {/* Avatar Picker */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-40 w-40 border-4 border-muted">
                  <AvatarImage
                    src={avatarUrl || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl">
                    {Name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer text-white flex flex-col items-center gap-1"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-xs font-medium">Change</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
              {avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  onClick={() => {
                    // TODO: Implement delete image action
                    console.log("Delete image");
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Remove Image
                </Button>
              )}
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control as unknown as any}
                name="Name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="max-w-md" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control as unknown as any}
                  name="EnableRemoteAccess"
                  render={({ field }: { field: any }) => (
                    <FormItem className="flex flex-row items-start gap-3 rounded-xl border border-dashed border-border/70 bg-muted/10 px-3 py-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Allow remote connections to this server
                        </FormLabel>
                        <FormDescription>
                          If unchecked, all remote connections will be blocked.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as unknown as any}
                  name="IsAdministrator"
                  render={({ field }: { field: any }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Allow this user to manage the server
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as unknown as any}
                  name="EnableCollectionManagement"
                  render={({ field }: { field: any }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Allow this user to manage collections
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as unknown as any}
                  name="EnableSubtitleManagement"
                  render={({ field }: { field: any }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Allow this user to edit subtitles
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Access */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">
            Feature access
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormField
              control={form.control as unknown as any}
              name="EnableLiveTvAccess"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow Live TV access
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as unknown as any}
              name="EnableLiveTvManagement"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow Live TV recording management
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Media Playback */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">
            Media playback
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormField
              control={form.control as unknown as any}
              name="EnableMediaPlayback"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow media playback
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as unknown as any}
              name="EnableAudioPlaybackTranscoding"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow audio playback that requires transcoding
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as unknown as any}
              name="EnableVideoPlaybackTranscoding"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow video playback that requires transcoding
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as unknown as any}
              name="EnablePlaybackRemuxing"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow video playback that requires conversion without
                    re-encoding
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as unknown as any}
              name="ForceRemoteSourceTranscoding"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0 lg:col-span-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Force transcoding of remote media sources such as Live TV
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          <p className="text-sm mt-2 bg-yellow-500/10 p-3 rounded-md border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 w-fit">
            Restricting access to transcoding may cause playback failures in
            clients due to unsupported media formats.
          </p>

          <div className="pt-2 max-w-md">
            <FormField
              control={form.control as unknown as any}
              name="RemoteClientBitrateLimit"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Internet streaming bitrate limit (Mbps)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        placeholder="Unlimited"
                        value={field.value === undefined ? "" : field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    An optional per-stream bitrate limit for all out of network
                    devices. This is useful to prevent devices from requesting a
                    higher bitrate than your internet connection can handle.
                    This may result in increased CPU load on your server in
                    order to transcode videos on the fly to a lower bitrate.
                  </FormDescription>
                  <p className="text-sm text-muted-foreground mt-1">
                    Override the default global value set in server settings,
                    see Dashboard &gt; Playback &gt; Streaming.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Allow Media Deletion */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">
            Allow media deletion from
          </h3>
          <div className="space-y-4">
            <FormField
              control={form.control as unknown as any}
              name="EnableContentDeletion"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">All libraries</FormLabel>
                </FormItem>
              )}
            />

            {!form.watch("EnableContentDeletion") && (
              <div className="pl-6 pt-2 text-sm text-muted-foreground">
                {/* Logic to list individual libraries would go here */}
                (Library list would appear here)
              </div>
            )}
          </div>
        </div>

        {/* Remote Control */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">
            Remote Control
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormField
              control={form.control as unknown as any}
              name="EnableRemoteControlOfOtherUsers"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow remote control of other users
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as unknown as any}
              name="EnableSharedDeviceControl"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow remote control of shared devices
                  </FormLabel>
                </FormItem>
              )}
            />

            <p className="text-sm text-muted-foreground lg:col-span-2">
              DLNA devices are considered shared until a user begins controlling
              them.
            </p>
          </div>
        </div>

        {/* Other */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Other</h3>
          <div className="space-y-4">
            <FormField
              control={form.control as unknown as any}
              name="IsDisabled"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-start gap-3 rounded-xl border border-dashed border-border/70 bg-muted/10 px-3 py-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Disable this user</FormLabel>
                    <FormDescription>
                      The server will not allow any connections from this user.
                      Existing connections will be abruptly ended.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
