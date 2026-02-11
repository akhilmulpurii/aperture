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
  defaultResumeSettingsFormValues,
  resumeSettingsFormSchema,
  ResumeSettingsFormValues,
} from "@/src/form-schemas/playback/resume";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import {
  fetchSystemConfiguration,
  updateSystemConfiguration,
} from "@/src/actions";

export default function PlaybackResumePage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const form = useForm<ResumeSettingsFormValues>({
    resolver: zodResolver(resumeSettingsFormSchema) as any,
    defaultValues: defaultResumeSettingsFormValues,
  });

  useEffect(() => {
    const loadData = async () => {
      setDashboardLoading(true);
      try {
        const config = await fetchSystemConfiguration();

        form.reset({
          MinResumePct: config.MinResumePct || 5,
          MaxResumePct: config.MaxResumePct || 90,
          MinAudiobookResume: config.MinAudiobookResume || 5,
          MaxAudiobookResume: config.MaxAudiobookResume || 5,
          MinResumeDurationSeconds: config.MinResumeDurationSeconds || 300,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load resume settings");
      } finally {
        setDashboardLoading(false);
      }
    };
    loadData();
  }, [setDashboardLoading, form]);

  async function onSubmit(data: ResumeSettingsFormValues) {
    setDashboardLoading(true);
    try {
      const currentConfig = await fetchSystemConfiguration();

      const newConfig = {
        ...currentConfig,
        MinResumePct: data.MinResumePct,
        MaxResumePct: data.MaxResumePct,
        MinAudiobookResume: data.MinAudiobookResume,
        MaxAudiobookResume: data.MaxAudiobookResume,
        MinResumeDurationSeconds: data.MinResumeDurationSeconds,
      };

      await updateSystemConfiguration(newConfig);
      toast.success("Resume settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save resume settings");
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
              <h3 className="text-lg font-semibold text-foreground">Resume</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="MinResumePct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum resume percentage</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Titles are assumed unplayed if stopped before this time.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="MaxResumePct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum resume percentage</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Titles are assumed fully played if stopped after this
                      time.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="MinAudiobookResume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Audiobook resume in minutes</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Titles are assumed unplayed if stopped before this time.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="MaxAudiobookResume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Audiobook resume in minutes</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Titles are assumed fully played if stopped when the
                      remaining duration is less than this value.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="MinResumeDurationSeconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum resume duration</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      The shortest video length in seconds that will save
                      playback location and let you resume.
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
