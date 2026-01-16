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
} from "../../../components/ui/form";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  defaultTranscodingSettingsFormValues,
  transcodingSettingsFormSchema,
  TranscodingSettingsFormValues,
} from "./schema";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "../../../lib/atoms";
import {
  fetchEncodingConfiguration,
  updateEncodingConfiguration,
} from "../../../actions";

const hardwareDecodingCodecs = [
  { label: "H264", value: "h264" },
  { label: "HEVC", value: "hevc" },
  { label: "MPEG2", value: "mpeg2video" },
  { label: "MPEG4", value: "mpeg4" },
  { label: "VC1", value: "vc1" },
  { label: "VP8", value: "vp8" },
  { label: "VP9", value: "vp9" },
  { label: "AV1", value: "av1" },
];

export default function PlaybackTranscodingPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const form = useForm<TranscodingSettingsFormValues>({
    resolver: zodResolver(transcodingSettingsFormSchema) as any,
    defaultValues: defaultTranscodingSettingsFormValues,
  });

  useEffect(() => {
    const loadData = async () => {
      setDashboardLoading(true);
      try {
        const config = await fetchEncodingConfiguration();

        form.reset({
          HardwareAccelerationType:
            (config.HardwareAccelerationType as any) || "none",
          HardwareDecodingCodecs: config.HardwareDecodingCodecs || [],
          EnableDecodingColorDepth10Hevc:
            config.EnableDecodingColorDepth10Hevc || false,
          EnableDecodingColorDepth10Vp9:
            config.EnableDecodingColorDepth10Vp9 || false,
          EnableDecodingColorDepth10HevcRext:
            config.EnableDecodingColorDepth10HevcRext || false,
          EnableDecodingColorDepth12HevcRext:
            config.EnableDecodingColorDepth12HevcRext || false,
          EnableHardwareEncoding: config.EnableHardwareEncoding || false,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load transcoding settings");
      } finally {
        setDashboardLoading(false);
      }
    };
    loadData();
  }, [setDashboardLoading, form]);

  async function onSubmit(data: TranscodingSettingsFormValues) {
    setDashboardLoading(true);
    try {
      const currentConfig = await fetchEncodingConfiguration();

      const newConfig = {
        ...currentConfig,
        HardwareAccelerationType: data.HardwareAccelerationType as any,
        HardwareDecodingCodecs: data.HardwareDecodingCodecs,
        EnableDecodingColorDepth10Hevc: data.EnableDecodingColorDepth10Hevc,
        EnableDecodingColorDepth10Vp9: data.EnableDecodingColorDepth10Vp9,
        EnableDecodingColorDepth10HevcRext:
          data.EnableDecodingColorDepth10HevcRext,
        EnableDecodingColorDepth12HevcRext:
          data.EnableDecodingColorDepth12HevcRext,
        EnableHardwareEncoding: data.EnableHardwareEncoding,
      };

      await updateEncodingConfiguration(newConfig);
      toast.success("Transcoding settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save transcoding settings");
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
                Transcoding
              </h3>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="HardwareAccelerationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hardware acceleration</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select hardware acceleration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="amf">AMD AMF</SelectItem>
                        <SelectItem value="qsv">
                          Intel QuickSync (QSV)
                        </SelectItem>
                        <SelectItem value="vaapi">
                          Video Acceleration API (VAAPI)
                        </SelectItem>
                        <SelectItem value="nvenc">NVIDIA NVENC</SelectItem>
                        <SelectItem value="videotoolbox">
                          Apple VideoToolBox
                        </SelectItem>
                        <SelectItem value="v4l2m2m">
                          Video4Linux2 (V4L2)
                        </SelectItem>
                        <SelectItem value="rkmpp">
                          Rockchip MPP (RKMPP)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <FormDescription>
                      Hardware acceleration requires{" "}
                      <a
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://jellyfin.org/docs/general/administration/hardware-acceleration"
                      >
                        additional configuration.
                      </a>
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Enable hardware decoding for</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {hardwareDecodingCodecs.map((codec) => (
                    <FormField
                      key={codec.value}
                      control={form.control}
                      name="HardwareDecodingCodecs"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(codec.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        codec.value,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== codec.value
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal">
                                {codec.label}
                              </FormLabel>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}

                  <FormField
                    control={form.control}
                    name="EnableDecodingColorDepth10Hevc"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">
                            HEVC 10bit
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="EnableDecodingColorDepth10Vp9"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">
                            VP9 10bit
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="EnableDecodingColorDepth10HevcRext"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">
                            HEVC RExt 8/10bit
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="EnableDecodingColorDepth12HevcRext"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">
                            HEVC RExt 12bit
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <FormLabel>Hardware encoding options</FormLabel>
                <FormField
                  control={form.control}
                  name="EnableHardwareEncoding"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable hardware encoding</FormLabel>
                      </div>
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
