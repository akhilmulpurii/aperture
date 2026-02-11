"use client";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { TranscodingSettingsFormValues } from "@/src/form-schemas/playback/transcoding";

const tonemappingAlgorithms = [
  { label: "None", value: "none" },
  { label: "Clip", value: "clip" },
  { label: "Linear", value: "linear" },
  { label: "Gamma", value: "gamma" },
  { label: "Reinhard", value: "reinhard" },
  { label: "Hable", value: "hable" },
  { label: "Mobius", value: "mobius" },
  { label: "BT.2390", value: "bt2390" },
];

export function ToneMappingCard() {
  const { control } = useFormContext<TranscodingSettingsFormValues>();

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-lg font-semibold text-foreground">Tone mapping</h3>
      </div>

      <div className="space-y-6">
        <FormField
          control={control}
          name="EnableTonemapping"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Enable Tone mapping</FormLabel>
                <FormDescription>
                  Tone-mapping can transform the dynamic range of a video from
                  HDR to SDR while maintaining image details and colors, which
                  are very important information for representing the original
                  scene. Currently works only with 10bit HDR10, HLG and DoVi
                  videos. This requires the corresponding GPGPU runtime.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="TonemappingAlgorithm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tone mapping algorithm</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tonemappingAlgorithms.map((algorithm) => (
                    <SelectItem key={algorithm.value} value={algorithm.value}>
                      {algorithm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
              <FormDescription>
                Tone mapping can be fine-tuned. If you are not familiar with
                these options, just keep the default. The recommended value is
                &apos;BT.2390&apos;.{" "}
                <a
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://ffmpeg.org/ffmpeg-all.html#tonemap_005fopencl"
                >
                  (Learn more)
                </a>
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="TonemappingMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tone mapping mode</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="max">MAX</SelectItem>
                    <SelectItem value="rgb">RGB</SelectItem>
                    <SelectItem value="lum">LUM</SelectItem>
                    <SelectItem value="itp">ITP</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the tone mapping mode. If you experience blown out
                  highlights try switching to the RGB mode.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="TonemappingRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tone mapping range</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="tv">TV</SelectItem>
                    <SelectItem value="pc">PC</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the output color range. Auto is the same as the input
                  range.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="TonemappingDesat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tone mapping desat</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormDescription>
                  Apply desaturation for highlights that exceed this level of
                  brightness. The recommended value is 0 (disable).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="TonemappingPeak"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tone mapping peak</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormDescription>
                  Override the embedded metadata value for the input signal with
                  this peak value instead. The default value is 100 (1000nit).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="TonemappingParam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tone mapping param</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormDescription>
                  Tune the tone mapping algorithm. Generally leave it blank.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
