"use client";
import { useFormContext, useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "../../ui/form";
import { Checkbox } from "../../ui/checkbox";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { AccessFormValues } from "./schema";

interface LibraryAccessSectionProps {
  libraries: BaseItemDto[];
  isLoadingLibraries: boolean;
}

export function LibraryAccessSection({
  libraries,
  isLoadingLibraries,
}: LibraryAccessSectionProps) {
  const form = useFormContext<AccessFormValues>();
  const enableAllFolders = useWatch({
    control: form.control,
    name: "EnableAllFolders",
  });

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Library Access</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="EnableAllFolders"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                />
              </FormControl>
              <FormLabel className="font-normal">
                Enable access to all libraries
              </FormLabel>
            </FormItem>
          )}
        />

        {!enableAllFolders && (
          <div className="grid gap-3 pl-8 mt-2">
            <FormField
              control={form.control}
              name="EnabledFolders"
              render={({ field }) => {
                if (isLoadingLibraries) {
                  return (
                    <div className="text-sm text-muted-foreground">
                      Loading libraries...
                    </div>
                  );
                }

                if (libraries.length === 0) {
                  return (
                    <div className="text-sm text-muted-foreground">
                      No libraries found.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {libraries.map((library) => {
                      const libraryId = library.Id;
                      if (!libraryId) return null;

                      return (
                        <FormItem
                          key={libraryId}
                          className="flex flex-row items-center gap-2 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(libraryId)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, libraryId]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (value: string) => value !== libraryId,
                                    ),
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm cursor-pointer break-all">
                            {library.Name}
                          </FormLabel>
                        </FormItem>
                      );
                    })}
                  </div>
                );
              }}
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Select the libraries to share with this user. Administrators will be
          able to edit all folders using the metadata manager.
        </p>
      </div>
    </div>
  );
}
