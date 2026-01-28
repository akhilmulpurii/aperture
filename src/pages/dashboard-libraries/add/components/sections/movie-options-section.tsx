import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Checkbox } from "../../../../../components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { AddLibraryFormValues } from "../../scheme";

interface MovieOptionsSectionProps {
  form: UseFormReturn<AddLibraryFormValues>;
  collectionType?: string;
  enableEmbeddedTitles?: boolean;
}

export function MovieOptionsSection({
  form,
  collectionType,
  enableEmbeddedTitles,
}: MovieOptionsSectionProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        {collectionType === "movies" ? "Movie" : "Series"} Options
      </h3>

      <FormField
        control={form.control}
        name="MovieOptions.EnableEmbeddedTitles"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Prefer embedded titles over filenames</FormLabel>
              <FormDescription>
                Determine the display title to use when no internet metadata or
                local metadata is available.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {enableEmbeddedTitles && (
        <FormField
          control={form.control}
          name="MovieOptions.EnableEmbeddedExtrasTitles"
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
                  Prefer embedded titles over filenames for extras
                </FormLabel>
                <FormDescription>
                  Extras often have the same embedded name as the parent, check
                  this to use embedded titles for them anyway.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      )}

      {collectionType === "tvshows" && enableEmbeddedTitles && (
        <FormField
          control={form.control}
          name="MovieOptions.EnableEmbeddedEpisodeInfos"
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
                  Prefer embedded episode information over filenames
                </FormLabel>
                <FormDescription>
                  Use the episode information from the embedded metadata if
                  available.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="MovieOptions.AllowEmbeddedSubtitles"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Disable different types of embedded subtitles</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="AllowAll">Allow All</SelectItem>
                <SelectItem value="AllowText">Allow Text</SelectItem>
                <SelectItem value="AllowImage">Allow Image</SelectItem>
                <SelectItem value="AllowNone">Allow None</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Disable subtitles that are packaged within media containers.
              Requires a full library refresh.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="LibrarySettings.EnableRealtimeMonitor"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Enable real time monitoring</FormLabel>
              <FormDescription>
                Changes to files will be processed immediately on supported file
                systems.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="MovieOptions.AutomaticallyAddToCollection"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Automatically add to collection</FormLabel>
              <FormDescription>
                When at least 2 movies have the same collection name, they will
                be automatically added to the collection.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
