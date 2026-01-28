import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "../../../../../components/ui/form";
import { Checkbox } from "../../../../../components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { AddLibraryFormValues } from "../../scheme";

interface ChapterImagesSectionProps {
  form: UseFormReturn<AddLibraryFormValues>;
}

export function ChapterImagesSection({ form }: ChapterImagesSectionProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Chapter Images</h3>

      <FormField
        control={form.control}
        name="ChapterImages.EnableChapterImageExtraction"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Enable chapter image extraction</FormLabel>
              <FormDescription>
                Extracting chapter images will allow clients to display
                graphical scene selection menus. The process can be slow and
                resource intensive.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ChapterImages.ExtractChapterImagesDuringLibraryScan"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Extract chapter images during the library scan</FormLabel>
              <FormDescription>
                Generate chapter images when videos are imported during the
                library scan.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
