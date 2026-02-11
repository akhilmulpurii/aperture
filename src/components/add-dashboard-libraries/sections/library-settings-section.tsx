"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  CountryInfo,
  CultureDto,
} from "@jellyfin/sdk/lib/generated-client/models";
import { UseFormReturn } from "react-hook-form";
import { AddLibraryFormValues } from "@/src/form-schemas/libraries/add";

interface LibrarySettingsSectionProps {
  form: UseFormReturn<AddLibraryFormValues>;
  collectionType?: string;
  cultures: CultureDto[];
  countries: CountryInfo[];
}

export function LibrarySettingsSection({
  form,
  collectionType,
  cultures,
  countries,
}: LibrarySettingsSectionProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        Library Settings
      </h3>

      <FormField
        control={form.control}
        name="LibrarySettings.Enabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Enable the library</FormLabel>
              <div className="text-sm text-muted-foreground">
                Disabling the library will hide it from all user views.
              </div>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="LibrarySettings.PreferredMetadataLanguage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred download language</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {cultures.map((culture) => (
                  <SelectItem
                    key={culture.TwoLetterISOLanguageName}
                    value={culture.TwoLetterISOLanguageName || ""}
                  >
                    {culture.DisplayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="LibrarySettings.MetadataCountryCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country/Region</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem
                    key={country.TwoLetterISORegionName}
                    value={country.TwoLetterISORegionName || ""}
                  >
                    {country.DisplayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {collectionType === "tvshows" && (
        <FormField
          control={form.control}
          name="LibrarySettings.SeasonZeroDisplayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special season display name</FormLabel>
              <FormControl>
                <Input placeholder="Specials" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
