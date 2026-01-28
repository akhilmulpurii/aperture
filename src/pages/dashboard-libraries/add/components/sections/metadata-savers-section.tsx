import { FormField } from "../../../../../components/ui/form";
import { ReorderableList } from "../../../../../components/reorderable-list";
import { UseFormReturn } from "react-hook-form";
import { AddLibraryFormValues } from "../../scheme";

interface MetadataSaversSectionProps {
  form: UseFormReturn<AddLibraryFormValues>;
}

export function MetadataSaversSection({ form }: MetadataSaversSectionProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Metadata savers</h3>
      <FormField
        control={form.control}
        name="MetadataSavers"
        render={({ field }) => (
          <ReorderableList items={field.value} onChange={field.onChange} />
        )}
      />
    </div>
  );
}
