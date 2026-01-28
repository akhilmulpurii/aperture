import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "../../../../../components/ui/form";
import { ReorderableList } from "../../../../../components/reorderable-list";
import { UseFormReturn } from "react-hook-form";
import { AddLibraryFormValues } from "../../scheme";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";

interface MetadataDownloadersSectionProps {
  form: UseFormReturn<AddLibraryFormValues>;
  collectionType?: string;
}

export function MetadataDownloadersSection({
  form,
  collectionType,
}: MetadataDownloadersSectionProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        Metadata downloaders
        {collectionType === "tvshows" && " (TV Shows)"}
      </h3>
      <p className="text-sm text-muted-foreground">
        Enable and rank your preferred metadata downloaders in order of
        priority. Lower priority downloaders will only be used to fill in
        missing information.
      </p>

      <FormField
        control={form.control}
        name="MetadataFetchers"
        render={({ field }) => (
          <ReorderableList items={field.value} onChange={field.onChange} />
        )}
      />

      {collectionType === "tvshows" && (
        <>
          <h4 className="text-sm font-medium mt-4">
            Metadata downloaders (Seasons)
          </h4>
          <FormField
            control={form.control}
            name="SeasonMetadataFetchers"
            render={({ field }) => (
              <ReorderableList items={field.value} onChange={field.onChange} />
            )}
          />

          <h4 className="text-sm font-medium mt-4">
            Metadata downloaders (Episodes)
          </h4>
          <FormField
            control={form.control}
            name="EpisodeMetadataFetchers"
            render={({ field }) => (
              <ReorderableList items={field.value} onChange={field.onChange} />
            )}
          />
        </>
      )}

      <FormField
        control={form.control}
        name="MovieOptions.AutomaticRefreshIntervalDays"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Automatically refresh metadata from the internet
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Never</SelectItem>
                <SelectItem value="30">Every 30 days</SelectItem>
                <SelectItem value="60">Every 60 days</SelectItem>
                <SelectItem value="90">Every 90 days</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Enabling this option may result in significantly longer library
              scans.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
