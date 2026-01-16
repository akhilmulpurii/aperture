import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Button } from "../../../components/ui/button";
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
          HardwareAccelerationType: (config.HardwareAccelerationType as any) || "none",
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
                        <SelectItem value="qsv">Intel QuickSync (QSV)</SelectItem>
                        <SelectItem value="vaapi">Video Acceleration API (VAAPI)</SelectItem>
                        <SelectItem value="nvenc">NVIDIA NVENC</SelectItem>
                        <SelectItem value="videotoolbox">Apple VideoToolBox</SelectItem>
                        <SelectItem value="v4l2m2m">Video4Linux2 (V4L2)</SelectItem>
                        <SelectItem value="rkmpp">Rockchip MPP (RKMPP)</SelectItem>
                      </SelectContent>
                    </Select>
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
