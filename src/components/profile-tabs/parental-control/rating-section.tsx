"use client";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "../../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { ParentalRating } from "@jellyfin/sdk/lib/generated-client/models";
import { ParentalControlFormValues } from "./schema";
import { useMemo } from "react";

interface RatingSectionProps {
  ratings: ParentalRating[];
}

export function RatingSection({ ratings }: RatingSectionProps) {
  const form = useFormContext<ParentalControlFormValues>();

  const groupedRatings = useMemo(() => {
    return ratings.reduce(
      (acc, rating) => {
        const value = rating.Value;
        const existing = acc.find((r) => r.value === value);
        if (existing) {
          existing.names.push(rating.Name || "");
        } else {
          acc.push({ value: value, names: [rating.Name || ""] });
        }
        return acc;
      },
      [] as { value: number | null | undefined; names: string[] }[],
    );
  }, [ratings]);

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        Maximum allowed parental rating
      </h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="MaxParentalRating"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "unrated" ? null : Number(value))
                }
                defaultValue={
                  field.value !== null && field.value !== undefined
                    ? String(field.value)
                    : "unrated"
                }
                value={
                  field.value !== null && field.value !== undefined
                    ? String(field.value)
                    : "unrated"
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groupedRatings.map((group) => (
                    <SelectItem
                      key={String(group.value ?? "unrated")}
                      value={
                        group.value === null || group.value === undefined
                          ? "unrated"
                          : String(group.value)
                      }
                    >
                      {group.names.join(" / ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Content with a higher rating will be hidden from this user.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
