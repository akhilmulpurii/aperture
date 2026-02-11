"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  defaultStreamingSettingsFormValues,
  streamingSettingsFormSchema,
  StreamingSettingsFormValues,
} from "@/src/form-schemas/playback/streaming";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import {
  fetchSystemConfiguration,
  updateSystemConfiguration,
} from "@/src/actions";

export default function PlaybackStreamingPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const form = useForm<StreamingSettingsFormValues>({
    resolver: zodResolver(streamingSettingsFormSchema) as any,
    defaultValues: defaultStreamingSettingsFormValues,
  });

  useEffect(() => {
    const loadData = async () => {
      setDashboardLoading(true);
      try {
        const config = await fetchSystemConfiguration();

        // Convert from bps to Mbps for display (1 Mbps = 1,000,000 bps)
        const bitrateInMbps = (config.RemoteClientBitrateLimit || 0) / 1000000;

        form.reset({
          RemoteClientBitrateLimit: bitrateInMbps,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load streaming settings");
      } finally {
        setDashboardLoading(false);
      }
    };
    loadData();
  }, [setDashboardLoading, form]);

  async function onSubmit(data: StreamingSettingsFormValues) {
    setDashboardLoading(true);
    try {
      const currentConfig = await fetchSystemConfiguration();

      // Convert from Mbps to bps for API (1 Mbps = 1,000,000 bps)
      const bitrateInBps = Math.round(data.RemoteClientBitrateLimit * 1000000);

      const newConfig = {
        ...currentConfig,
        RemoteClientBitrateLimit: bitrateInBps,
      };

      await updateSystemConfiguration(newConfig);
      toast.success("Streaming settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save streaming settings");
    } finally {
      setDashboardLoading(false);
    }
  }

  return (
    <div className="w-full pb-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
            <div className="flex flex-col space-y-1.5">
              <h3 className="text-lg font-semibold text-foreground">
                Streaming
              </h3>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="RemoteClientBitrateLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Internet streaming bitrate limit (Mbps)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" {...field} />
                    </FormControl>
                    <FormDescription>
                      An optional per-stream bitrate limit for all out of
                      network devices. This is useful to prevent devices from
                      requesting a higher bitrate than your internet connection
                      can handle. This may result in increased CPU load on your
                      server in order to transcode videos on the fly to a lower
                      bitrate.
                    </FormDescription>
                    <FormMessage />
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
    </div>
  );
}
