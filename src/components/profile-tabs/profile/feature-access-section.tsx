import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "../../ui/form";
import { Checkbox } from "../../ui/checkbox";
import { ProfileFormValues } from "./schema";

export function FeatureAccessSection() {
  const form = useFormContext<ProfileFormValues>();

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Feature access</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="EnableLiveTvAccess"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">Allow Live TV access</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="EnableLiveTvManagement"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">
                Allow Live TV recording management
              </FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
