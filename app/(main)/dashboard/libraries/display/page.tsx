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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  defaultDisplayFormValues,
  displayFormSchema,
  DisplayFormValues,
} from "@/src/form-schemas/libraries/display";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import {
  fetchSystemConfiguration,
  fetchMetadataConfiguration,
  updateSystemConfiguration,
  updateMetadataConfiguration,
} from "@/src/actions";

export default function LibrariesDisplayPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema) as any,
    defaultValues: defaultDisplayFormValues,
  });

  useEffect(() => {
    const loadData = async () => {
      setDashboardLoading(true);
      try {
        const [config, metadata] = await Promise.all([
          fetchSystemConfiguration(),
          fetchMetadataConfiguration(),
        ]);

        form.reset({
          metadata: {
            UseFileCreationTimeForDateAdded: (metadata as any)
              .UseFileCreationTimeForDateAdded
              ? "UseFileCreationTime"
              : "UseDateScanned",
          },
          configuration: {
            EnableFolderView: config.EnableFolderView || false,
            DisplaySpecialsWithinSeasons:
              config.DisplaySpecialsWithinSeasons || false,
            EnableGroupingMoviesIntoCollections:
              (config as any).EnableGroupingMoviesIntoCollections || false,
            EnableGroupingShowsIntoCollections:
              (config as any).EnableGroupingShowsIntoCollections || false,
            EnableExternalContentInSuggestions:
              config.EnableExternalContentInSuggestions || false,
          },
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load display settings");
      } finally {
        setDashboardLoading(false);
      }
    };
    loadData();
  }, [setDashboardLoading, form]);

  async function onSubmit(data: DisplayFormValues) {
    setDashboardLoading(true);
    try {
      const [currentConfig, currentMetadata] = await Promise.all([
        fetchSystemConfiguration(),
        fetchMetadataConfiguration(),
      ]);

      const newConfig = { ...currentConfig, ...data.configuration };
      const newMetadata = {
        ...currentMetadata,
        UseFileCreationTimeForDateAdded:
          data.metadata.UseFileCreationTimeForDateAdded ===
          "UseFileCreationTime",
      };

      await Promise.all([
        updateSystemConfiguration(newConfig),
        updateMetadataConfiguration(newMetadata as any),
      ]);

      toast.success("Display settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save display settings");
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
              <h3 className="text-lg font-semibold text-foreground">Display</h3>
              <p className="text-sm text-muted-foreground">
                Some settings are server settings only and may not be applicable
                for this client as of now.
              </p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="metadata.UseFileCreationTimeForDateAdded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date added behavior for new content</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select behavior" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UseFileCreationTime">
                          Use file creation date
                        </SelectItem>
                        <SelectItem value="UseDateScanned">
                          Use date scanned into the library
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      If a metadata value is present, it will always be used
                      before either of these options.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="configuration.EnableFolderView"
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
                          Display a folder view to show plain media folders
                        </FormLabel>
                        <FormDescription>
                          Display folders alongside your other media libraries.
                          This can be useful if you&apos;d like to have a plain
                          folder view.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="configuration.DisplaySpecialsWithinSeasons"
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
                          Display specials within seasons they aired in
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="configuration.EnableGroupingMoviesIntoCollections"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Group movies into collections</FormLabel>
                        <FormDescription>
                          Movies in a collection will be displayed as one
                          grouped item when displaying movie lists.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="configuration.EnableGroupingShowsIntoCollections"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Group shows into collections</FormLabel>
                        <FormDescription>
                          Shows in a collection will be displayed as one grouped
                          item when displaying show lists.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="configuration.EnableExternalContentInSuggestions"
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
                          Enable external content in suggestions
                        </FormLabel>
                        <FormDescription>
                          Allow internet trailers and live TV programs to be
                          included within suggested content.
                        </FormDescription>
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
