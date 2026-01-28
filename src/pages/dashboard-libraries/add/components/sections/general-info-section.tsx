import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../components/ui/form";
import { Input } from "../../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Badge } from "../../../../../components/ui/badge";
import { UseFormReturn } from "react-hook-form";
import { AddLibraryFormValues } from "../../scheme";

const CONTENT_TYPES = [
  { value: "movies", label: "Movies" },
  { value: "tvshows", label: "Shows" },
];

interface GeneralInfoSectionProps {
  form: UseFormReturn<AddLibraryFormValues>;
}

export function GeneralInfoSection({ form }: GeneralInfoSectionProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        General Info
        <Badge
          variant="outline"
          className="text-xs text-muted-foreground bg-background/50 p-2"
        >
          Beta Feature - may not work as expected
        </Badge>
      </h3>
      <FormField
        control={form.control}
        name="CollectionType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CONTENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              The type of content this library will contain.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="Name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Display name</FormLabel>
            <FormControl>
              <Input placeholder="Movies" {...field} />
            </FormControl>
            <FormDescription>
              The name that will be displayed in the dashboard and apps.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
