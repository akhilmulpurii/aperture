import { Checkbox } from "../../../../../components/ui/checkbox";
import { Label } from "../../../../../components/ui/label";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../../../../../components/ui/form";
import { ReorderableList } from "../../../../../components/reorderable-list";
import { UseFormReturn } from "react-hook-form";
import { AddLibraryFormValues } from "../../scheme";
import { CultureDto } from "@jellyfin/sdk/lib/generated-client/models";

interface SubtitleDownloadsSectionProps {
  form: UseFormReturn<AddLibraryFormValues>;
  cultures: CultureDto[];
}

export function SubtitleDownloadsSection({
  form,
  cultures,
}: SubtitleDownloadsSectionProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Subtitle Downloads</h3>

      <div className="space-y-2">
        <Label>Download languages</Label>
        <div className="h-32 border rounded-md p-2 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2">
          {cultures.map((culture) => (
            <FormField
              key={culture.TwoLetterISOLanguageName}
              control={form.control}
              name="SubtitleDownloads.DownloadLanguages"
              render={({ field }) => (
                <FormItem
                  key={culture.TwoLetterISOLanguageName}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(
                        culture.TwoLetterISOLanguageName || ""
                      )}
                      onCheckedChange={(checked) => {
                        return checked
                          ? field.onChange([
                              ...field.value,
                              culture.TwoLetterISOLanguageName,
                            ])
                          : field.onChange(
                              field.value?.filter(
                                (value) =>
                                  value !== culture.TwoLetterISOLanguageName
                              )
                            );
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {culture.DisplayName}
                  </FormLabel>
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>

      <h4 className="text-sm font-medium mt-4">Subtitle downloaders</h4>
      <p className="text-xs text-muted-foreground mb-4">
        Enable and rank your preferred subtitle downloaders in order of
        priority.
      </p>
      <FormField
        control={form.control}
        name="SubtitleDownloads.SubtitleFetchers"
        render={({ field }) => (
          <ReorderableList items={field.value} onChange={field.onChange} />
        )}
      />

      <FormField
        control={form.control}
        name="SubtitleDownloads.RequirePerfectSubtitleMatch"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Only download subtitles that are a perfect match for video files
              </FormLabel>
              <FormDescription>
                Requiring a perfect match will filter subtitles to include only
                those that have been tested and verified with your exact video
                file.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="SubtitleDownloads.SkipSubtitlesIfAudioTrackMatches"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Skip if the default audio track matches the download language
              </FormLabel>
              <FormDescription>
                Uncheck this to ensure all videos have subtitles, regardless of
                audio language.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="SubtitleDownloads.SkipSubtitlesIfEmbeddedSubtitlesPresent"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Skip if the video already contains embedded subtitles
              </FormLabel>
              <FormDescription>
                Keeping text versions of subtitles will result in more efficient
                delivery and decrease the likelihood of video transcoding.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="SubtitleDownloads.SaveSubtitlesWithMedia"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Save subtitles into media folders</FormLabel>
              <FormDescription>
                Storing subtitles next to video files will allow them to be more
                easily managed.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
