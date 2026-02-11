"use client";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/src/components/ui/form";
import { ReorderableList } from "@/src/components/reorderable-list";
import { Checkbox } from "@/src/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { AddLibraryFormValues } from "@/src/form-schemas/libraries/add";

interface ImageFetchersSectionProps {
  form: UseFormReturn<AddLibraryFormValues>;
  collectionType?: string;
}

export function ImageFetchersSection({
  form,
  collectionType,
}: ImageFetchersSectionProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        Image fetchers
        {collectionType === "tvshows" && " (TV Shows)"}
      </h3>
      <FormField
        control={form.control}
        name="ImageFetchers"
        render={({ field }) => (
          <ReorderableList items={field.value} onChange={field.onChange} />
        )}
      />

      {collectionType === "tvshows" && (
        <>
          <h4 className="text-sm font-medium mt-4">Image fetchers (Seasons)</h4>
          <FormField
            control={form.control}
            name="SeasonImageFetchers"
            render={({ field }) => (
              <ReorderableList items={field.value} onChange={field.onChange} />
            )}
          />

          <h4 className="text-sm font-medium mt-4">
            Image fetchers (Episodes)
          </h4>
          <FormField
            control={form.control}
            name="EpisodeImageFetchers"
            render={({ field }) => (
              <ReorderableList items={field.value} onChange={field.onChange} />
            )}
          />
        </>
      )}

      <FormField
        control={form.control}
        name="SaveLocalMetadata"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            <div className="space-y-1 leading-none">
              <FormLabel>Save artwork into media folders</FormLabel>
              <FormDescription>
                Saving artwork into media folders will put them in a place where
                they can be easily edited.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {collectionType === "tvshows" && (
        <FormField
          control={form.control}
          name="MovieOptions.EnableAutomaticSeriesGrouping"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Automatically merge series that are spread across multiple
                  folders
                </FormLabel>
                <FormDescription>
                  Series that are spread across multiple folders within this
                  library will be automatically merged into a single series.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
