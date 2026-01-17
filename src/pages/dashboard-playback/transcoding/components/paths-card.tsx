import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Input } from "../../../../components/ui/input";
import { FileBrowserDropdown } from "../../../../components/file-browser-dropdown";
import { TranscodingSettingsFormValues } from "../schema";

export function PathsCard() {
  const { control } = useFormContext<TranscodingSettingsFormValues>();

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-lg font-semibold text-foreground">Paths</h3>
      </div>
      <div className="space-y-6">
        <FormField
          control={control}
          name="EncoderAppPathDisplay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>FFmpeg path</FormLabel>
              <FormControl>
                <Input {...field} readOnly disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="TranscodingTempPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transcode path</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} className="pr-10" />
                  <FileBrowserDropdown
                    ariaLabel="Browse transcode path"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onSelect={field.onChange}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Specify a custom path for the transcode files served to clients.
                Leave blank to use the server default.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="FallbackFontPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fallback font folder path</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} className="pr-10" />
                  <FileBrowserDropdown
                    ariaLabel="Browse fallback font folder path"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onSelect={field.onChange}
                  />
                </div>
              </FormControl>
              <FormDescription>
                These fonts are used by some clients to render subtitles. Please
                refer to the documentation for more information.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="EnableFallbackFont"
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
                  Enable fallback fonts
                </FormLabel>
                <FormDescription>
                  Enable custom alternate fonts. This can avoid the problem of
                  incorrect subtitle rendering.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
