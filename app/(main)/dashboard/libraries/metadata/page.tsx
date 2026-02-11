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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  defaultMetadataFormValues,
  metadataFormSchema,
  MetadataFormValues,
} from "@/src/form-schemas/libraries/metadata";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import {
  fetchCultures,
  fetchCountries,
  fetchSystemConfiguration,
  updateSystemConfiguration,
} from "@/src/actions";
import {
  CultureDto,
  CountryInfo,
} from "@jellyfin/sdk/lib/generated-client/models";

const resolutionOptions = [
  { label: "Match source", value: "MatchSource" },
  { label: "2160p", value: "P2160" },
  { label: "1080p", value: "P1080" },
  { label: "720p", value: "P720" },
  { label: "480p", value: "P480" },
  { label: "360p", value: "P360" },
  { label: "240p", value: "P240" },
  { label: "144p", value: "P144" },
];

export default function LibrariesMetadataPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const [cultures, setCultures] = useState<CultureDto[]>([]);
  const [countries, setCountries] = useState<CountryInfo[]>([]);

  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataFormSchema) as any,
    defaultValues: defaultMetadataFormValues,
  });

  useEffect(() => {
    const loadData = async () => {
      setDashboardLoading(true);
      try {
        const [culturesData, countriesData, config] = await Promise.all([
          fetchCultures(),
          fetchCountries(),
          fetchSystemConfiguration(),
        ]);
        setCultures(culturesData);
        setCountries(countriesData);
        console.log(config);
        form.reset({
          PreferredMetadataLanguage: config.PreferredMetadataLanguage,
          MetadataCountryCode: config.MetadataCountryCode,
          DummyChapterDuration: config.DummyChapterDuration || 0,
          ChapterImageResolution:
            (config.ChapterImageResolution as any) || "MatchSource",
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load metadata options");
      } finally {
        setDashboardLoading(false);
      }
    };
    loadData();
  }, [setDashboardLoading, form]);

  async function onSubmit(data: MetadataFormValues) {
    setDashboardLoading(true);
    try {
      const currentConfig = await fetchSystemConfiguration();
      const newConfig = {
        ...currentConfig,
        PreferredMetadataLanguage: data.PreferredMetadataLanguage,
        MetadataCountryCode: data.MetadataCountryCode,
        DummyChapterDuration: data.DummyChapterDuration,
        ChapterImageResolution: data.ChapterImageResolution as any,
      };

      await updateSystemConfiguration(newConfig);
      toast.success("Metadata settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save metadata settings");
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
                Metadata
              </h3>
              <p className="text-sm text-muted-foreground">
                These are your defaults and can be customized on a per-library
                basis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                key={`PreferredMetadataLanguage-${cultures.length}`}
                control={form.control}
                name="PreferredMetadataLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Metadata Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-75">
                        {cultures.map((culture) => (
                          <SelectItem
                            key={`Culture-${culture.TwoLetterISOLanguageName}`}
                            value={culture.TwoLetterISOLanguageName || ""}
                          >
                            {culture.DisplayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                key={`MetadataCountryCode-${countries.length}`}
                name="MetadataCountryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-75">
                        {countries.map((country) => (
                          <SelectItem
                            key={`Country-${country.TwoLetterISORegionName}`}
                            value={country.TwoLetterISORegionName || ""}
                          >
                            {country.DisplayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
            <div className="flex flex-col space-y-1.5">
              <h3 className="text-lg font-semibold text-foreground">
                Chapter Images
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="DummyChapterDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      The interval between dummy chapters in seconds. Set to 0
                      to disable dummy chapter generation. Changing this will
                      have no effect on existing dummy chapters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ChapterImageResolution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resolution</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select resolution" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resolutionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The resolution of the extracted chapter images. Changing
                      this will have no effect on existing dummy chapters.
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
