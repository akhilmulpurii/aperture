import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "../../../../components/ui/form";
import { Checkbox } from "../../../../components/ui/checkbox";
import { TranscodingSettingsFormValues } from "../schema";

export function EncodingFormatOptionsCard() {
  const { control } = useFormContext<TranscodingSettingsFormValues>();

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-lg font-semibold text-foreground">
            Encoding format options
          </h3>
          <p className="text-sm text-muted-foreground">
            Select the video encoding that Jellyfin should transcode to. Jellyfin
            will use software encoding when hardware acceleration for the selected
            format is not available. H264 encoding will always be enabled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={control}
            name="AllowHevcEncoding"
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
                    Allow encoding in HEVC format
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="AllowAv1Encoding"
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
                    Allow encoding in AV1 format
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
