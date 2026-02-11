"use client";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { X } from "lucide-react";
import { useState } from "react";
import { ParentalControlFormValues } from "./schema";

export function TagsSection() {
  const form = useFormContext<ParentalControlFormValues>();
  const [allowedTagInput, setAllowedTagInput] = useState("");
  const [blockedTagInput, setBlockedTagInput] = useState("");

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: any,
    inputValue: string,
    setInputValue: (val: string) => void,
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !field.value?.includes(newTag)) {
        field.onChange([...(field.value || []), newTag]);
        setInputValue("");
      }
    }
  };

  const removeTag = (tagToRemove: string, field: any) => {
    field.onChange(field.value?.filter((tag: string) => tag !== tagToRemove));
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <div className="space-y-6">
        {/* Allowed Tags */}
        <FormField
          control={form.control}
          name="AllowedTags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allow items with tags</FormLabel>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {field.value?.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 pr-1 text-sm font-normal"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag, field)}
                        className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <FormControl>
                  <Input
                    placeholder="Type tag and press Enter"
                    value={allowedTagInput}
                    onChange={(e) => setAllowedTagInput(e.target.value)}
                    onKeyDown={(e) =>
                      handleKeyDown(
                        e,
                        field,
                        allowedTagInput,
                        setAllowedTagInput,
                      )
                    }
                  />
                </FormControl>
              </div>
              <FormDescription>
                Only show media with at least one of the specified tags.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Blocked Tags */}
        <FormField
          control={form.control}
          name="BlockedTags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Block items with tags</FormLabel>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {field.value?.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 pr-1 text-sm font-normal"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag, field)}
                        className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <FormControl>
                  <Input
                    placeholder="Type tag and press Enter"
                    value={blockedTagInput}
                    onChange={(e) => setBlockedTagInput(e.target.value)}
                    onKeyDown={(e) =>
                      handleKeyDown(
                        e,
                        field,
                        blockedTagInput,
                        setBlockedTagInput,
                      )
                    }
                  />
                </FormControl>
              </div>
              <FormDescription>
                Hide media with at least one of the specified tags.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
