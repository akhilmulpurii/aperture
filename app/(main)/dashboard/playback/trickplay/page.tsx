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
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  defaultTrickplaySettingsFormValues,
  trickplaySettingsFormSchema,
  TrickplaySettingsFormValues,
} from "@/src/form-schemas/playback/trickplay";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import {
  fetchSystemConfiguration,
  updateSystemConfiguration,
} from "@/src/actions";

export default function PlaybackTrickplayPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const form = useForm<TrickplaySettingsFormValues>({
    resolver: zodResolver(trickplaySettingsFormSchema) as any,
    defaultValues: defaultTrickplaySettingsFormValues,
  });

  useEffect(() => {
    const loadData = async () => {
      setDashboardLoading(true);
      try {
        const config = await fetchSystemConfiguration();

        const trickplayOptions = config.TrickplayOptions || {};

        form.reset({
          EnableHwAcceleration: trickplayOptions.EnableHwAcceleration ?? true,
          EnableHwEncoding: trickplayOptions.EnableHwEncoding ?? false,
          EnableKeyFrameOnlyExtraction:
            trickplayOptions.EnableKeyFrameOnlyExtraction ?? false,
          ScanBehavior: (trickplayOptions.ScanBehavior as any) || "NonBlocking",
          ProcessPriority:
            (trickplayOptions.ProcessPriority as any) || "BelowNormal",
          Interval: trickplayOptions.Interval ?? 10000,
          WidthResolutions:
            trickplayOptions.WidthResolutions?.join(",") || "320",
          TileWidth: trickplayOptions.TileWidth ?? 10,
          TileHeight: trickplayOptions.TileHeight ?? 10,
          Qscale: trickplayOptions.Qscale ?? 4,
          JpegQuality: trickplayOptions.JpegQuality ?? 90,
          ProcessThreads: trickplayOptions.ProcessThreads ?? 1,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load trickplay settings");
      } finally {
        setDashboardLoading(false);
      }
    };
    loadData();
  }, [setDashboardLoading, form]);

  async function onSubmit(data: TrickplaySettingsFormValues) {
    setDashboardLoading(true);
    try {
      const currentConfig = await fetchSystemConfiguration();

      const widthResolutions = data.WidthResolutions.split(",")
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));

      const newConfig = {
        ...currentConfig,
        TrickplayOptions: {
          ...currentConfig.TrickplayOptions,
          EnableHwAcceleration: data.EnableHwAcceleration,
          EnableHwEncoding: data.EnableHwEncoding,
          EnableKeyFrameOnlyExtraction: data.EnableKeyFrameOnlyExtraction,
          ScanBehavior: data.ScanBehavior as any,
          ProcessPriority: data.ProcessPriority as any,
          Interval: data.Interval,
          WidthResolutions: widthResolutions,
          TileWidth: data.TileWidth,
          TileHeight: data.TileHeight,
          Qscale: data.Qscale,
          JpegQuality: data.JpegQuality,
          ProcessThreads: data.ProcessThreads,
        },
      };

      await updateSystemConfiguration(newConfig);
      toast.success("Trickplay settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save trickplay settings");
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
                Trickplay
              </h3>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="EnableHwAcceleration"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable hardware decoding</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="EnableHwEncoding"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Enable hardware accelerated MJPEG encoding
                      </FormLabel>
                      <FormDescription>
                        Currently only available on QSV, VA-API, VideoToolbox
                        and RKMPP, this option has no effect on other hardware
                        acceleration methods.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="EnableKeyFrameOnlyExtraction"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Only generate images from key frames
                      </FormLabel>
                      <FormDescription>
                        Extract key frames only for significantly faster
                        processing with less accurate timing. If the configured
                        hardware decoder does not support this mode, will use
                        the software decoder instead.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ScanBehavior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scan Behavior</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select behavior" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          <SelectItem value="NonBlocking">
                            Non Blocking
                          </SelectItem>
                          <SelectItem value="Blocking">Blocking</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The default behavior is non blocking, which will add
                        media to the library before trickplay generation is
                        done. Blocking will ensure trickplay files are generated
                        before media is added to the library, but will make
                        scans significantly longer.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ProcessPriority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Process Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="AboveNormal">
                            Above Normal
                          </SelectItem>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="BelowNormal">
                            Below Normal
                          </SelectItem>
                          <SelectItem value="Idle">Idle</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Setting this lower or higher will determine how the CPU
                        prioritizes the ffmpeg trickplay generation process in
                        relation to other processes. If you notice slowdown
                        while generating trickplay images but don&apos;t want to
                        fully stop their generation, try lowering this as well
                        as the thread count.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Interval</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Interval of time (ms) between each new trickplay image.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="WidthResolutions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width Resolutions</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma separated list of the widths (px) that trickplay
                        images will be generated at. All images should generate
                        proportionally to the source, so a width of 320 on a
                        16:9 video ends up around 320x180.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="TileWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tile Width</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of images per tile in the X direction.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="TileHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tile Height</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of images per tile in the Y direction.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="JpegQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>JPEG Quality</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} {...field} />
                      </FormControl>
                      <FormDescription>
                        The JPEG compression quality for trickplay images.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Qscale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qscale</FormLabel>
                      <FormControl>
                        <Input type="number" min={2} max={31} {...field} />
                      </FormControl>
                      <FormDescription>
                        The quality scale of images output by ffmpeg, with 2
                        being the highest quality and 31 being the lowest.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ProcessThreads"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FFmpeg Threads</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormDescription>
                        The number of threads to pass to the
                        &apos;-threads&apos; argument of ffmpeg.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
