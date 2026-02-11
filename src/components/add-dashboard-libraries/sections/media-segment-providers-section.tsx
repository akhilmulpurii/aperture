"use client";
import { FormField } from "@/src/components/ui/form";
import { ReorderableList } from "@/src/components/reorderable-list";
import { UseFormReturn } from "react-hook-form";
import { AddLibraryFormValues } from "@/src/form-schemas/libraries/add";

interface MediaSegmentProvidersSectionProps {
  form: UseFormReturn<AddLibraryFormValues>;
}

export function MediaSegmentProvidersSection({
  form,
}: MediaSegmentProvidersSectionProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        Media segment providers
      </h3>
      <p className="text-sm text-muted-foreground">
        Enable and rank your preferred media segment providers in order of
        priority.
      </p>
      <FormField
        control={form.control}
        name="MediaSegmentProviders"
        render={({ field }) => (
          <ReorderableList items={field.value} onChange={field.onChange} />
        )}
      />
    </div>
  );
}
