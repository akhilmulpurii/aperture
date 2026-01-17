import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Checkbox } from "../../ui/checkbox";
import { ProfileFormValues } from "./schema";

export function MediaPlaybackSection() {
  const form = useFormContext<ProfileFormValues>();

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Media playback</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="EnableMediaPlayback"
          render={({ field }) => (
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
          control={form.control}
          name="EnableAudioPlaybackTranscoding"
          render={({ field }) => (
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
          control={form.control}
          name="EnableVideoPlaybackTranscoding"
          render={({ field }) => (
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
          control={form.control}
          name="EnablePlaybackRemuxing"
          render={({ field }) => (
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
          control={form.control}
          name="ForceRemoteSourceTranscoding"
          render={({ field }) => (
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
        Restricting access to transcoding may cause playback failures in clients
        due to unsupported media formats.
      </p>

      <div className="pt-2">
        <FormField
          control={form.control}
          name="RemoteClientBitrateLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internet streaming bitrate limit (Mbps)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2 mt-2 max-w-md">
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={
                      field.value === undefined || isNaN(field.value)
                        ? ""
                        : field.value
                    }
                    onChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormDescription>
                An optional per-stream bitrate limit for all out of network
                devices. This is useful to prevent devices from requesting a
                higher bitrate than your internet connection can handle. This
                may result in increased CPU load on your server in order to
                transcode videos on the fly to a lower bitrate.
              </FormDescription>
              <p className="text-sm text-muted-foreground mt-1">
                Override the default global value set in server settings, see
                Dashboard &gt; Playback &gt; Streaming.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
