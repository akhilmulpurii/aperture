"use client";
import { Button } from "@/src/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { FileBrowserDropdown } from "@/src/components/file-browser-dropdown";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AddLibraryFormValues } from "@/src/form-schemas/libraries/add";

interface FoldersSectionProps {
  form: UseFormReturn<AddLibraryFormValues>;
  pathFields: Array<{ id: string }>;
  appendPath: (value: string) => void;
  removePath: (index: number) => void;
}

export function FoldersSection({
  form,
  pathFields,
  appendPath,
  removePath,
}: FoldersSectionProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Folders</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendPath("")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Folder
        </Button>
      </div>

      <div className="space-y-4">
        {pathFields.map((field, index) => (
          <FormField
            key={field.id}
            control={form.control}
            name={`Paths.${index}` as const}
            render={({ field: inputField }) => (
              <FormItem>
                <FormLabel className={index !== 0 ? "sr-only" : ""}>
                  Folder Path
                </FormLabel>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FormControl>
                      <Input
                        {...inputField}
                        className="pr-10"
                        placeholder="/media/movies"
                      />
                    </FormControl>
                    <FileBrowserDropdown
                      ariaLabel="Browse folder path"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onSelect={(value) => inputField.onChange(value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePath(index)}
                    disabled={pathFields.length === 1 && index === 0}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {pathFields.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
            No folders added. Please add at least one folder path.
          </div>
        )}
        {form.formState.errors.Paths &&
          typeof form.formState.errors.Paths.message === "string" && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.Paths.message}
            </p>
          )}
      </div>
      <p className="text-xs text-muted-foreground">
        Specify the folders where your media files are located.
      </p>
    </div>
  );
}
