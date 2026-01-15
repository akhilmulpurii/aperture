import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "../../ui/form";
import { Checkbox } from "../../ui/checkbox";
import { ParentalControlFormValues } from "./schema";
import { UnratedItem } from "@jellyfin/sdk/lib/generated-client/models";

const UNRATED_ITEMS = [
  // { label: "Books", value: UnratedItem.Book },
  { label: "Channels", value: UnratedItem.ChannelContent },
  { label: "Live TV", value: UnratedItem.LiveTvProgram },
  { label: "Movies", value: UnratedItem.Movie },
  // { label: "Music", value: UnratedItem.Music },
  // { label: "Trailers", value: UnratedItem.Trailer },
  { label: "Shows", value: UnratedItem.Series },
];

export function UnratedItemsSection() {
  const form = useFormContext<ParentalControlFormValues>();

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        Block items with no or unrecognized rating information
      </h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="BlockUnratedItems"
          render={({ field }) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {UNRATED_ITEMS.map((item) => (
                <FormItem
                  key={item.value}
                  className="flex flex-row items-center gap-2 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(item.value)}
                      onCheckedChange={(checked) => {
                        const currentValue = field.value || [];
                        if (checked) {
                          field.onChange([...currentValue, item.value]);
                        } else {
                          field.onChange(
                            currentValue.filter(
                              (value: string) => value !== item.value
                            )
                          );
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-sm cursor-pointer">
                    {item.label}
                  </FormLabel>
                </FormItem>
              ))}
            </div>
          )}
        />
      </div>
    </div>
  );
}
