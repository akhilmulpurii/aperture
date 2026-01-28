import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "../../../../../components/ui/form";
import { Checkbox } from "../../../../../components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { AddLibraryFormValues } from "../../scheme";

interface TrickplaySectionProps {
  form: UseFormReturn<AddLibraryFormValues>;
}

export function TrickplaySection({ form }: TrickplaySectionProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Trickplay</h3>

      <FormField
        control={form.control}
        name="Trickplay.EnableTrickplayImageExtraction"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Enable trickplay image extraction</FormLabel>
              <FormDescription>
                Trickplay images are similar to chapter images, except they span
                the entire length of the content and are used to show a preview
                when scrubbing through videos.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="Trickplay.ExtractTrickplayImagesDuringLibraryScan"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Extract trickplay images during the library scan</FormLabel>
              <FormDescription>
                Generate trickplay images when videos are imported during the
                library scan. Otherwise, they will be extracted during the
                trickplay images scheduled task.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="Trickplay.SaveTrickplayImagesIntoMediaFolders"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Save trickplay images next to media</FormLabel>
              <FormDescription>
                Saving trickplay images into media folders will put them next to
                your media for easy migration and access.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
