import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  UserDto,
  ParentalRating,
  UserPolicy,
} from "@jellyfin/sdk/lib/generated-client/models";
import { useEffect, useState } from "react";
import { fetchParentalRatings, updateUserPolicy } from "../../../actions";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { toast } from "sonner";
import { parentalControlFormSchema, ParentalControlFormValues } from "./schema";
import { RatingSection } from "./rating-section";
import { UnratedItemsSection } from "./unrated-items-section";
import { TagsSection } from "./tags-section";
import { useAtomValue, useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "../../../lib/atoms";

export default function ParentalControlTab({ user }: { user?: UserDto }) {
  const [ratings, setRatings] = useState<ParentalRating[]>([]);
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const dashboardLoading = useAtomValue(dashboardLoadingAtom);

  useEffect(() => {
    setDashboardLoading(true);
    fetchParentalRatings()
      .then(setRatings)
      .finally(() => setDashboardLoading(false));
  }, []);

  const form = useForm<ParentalControlFormValues>({
    resolver: zodResolver(parentalControlFormSchema) as any,
    defaultValues: {
      MaxParentalRating: user?.Policy?.MaxParentalRating ?? null,
      BlockUnratedItems: (user?.Policy?.BlockUnratedItems as string[]) || [],
      AllowedTags: user?.Policy?.AllowedTags || [],
      BlockedTags: user?.Policy?.BlockedTags || [],
    },
  });

  useEffect(() => {
    if (user?.Id) {
      if (
        form.getFieldState("MaxParentalRating").isDirty === false &&
        form.getFieldState("BlockUnratedItems").isDirty === false
      ) {
        form.reset({
          MaxParentalRating: user.Policy?.MaxParentalRating ?? null,
          BlockUnratedItems: (user.Policy?.BlockUnratedItems as string[]) || [],
          AllowedTags: user.Policy?.AllowedTags || [],
          BlockedTags: user.Policy?.BlockedTags || [],
        });
      }
    }
  }, [user?.Id, form]);

  async function onSubmit(data: ParentalControlFormValues) {
    if (!user?.Id || !user.Policy) return;

    setDashboardLoading(true);
    try {
      const updatedPolicy: UserPolicy = {
        ...user.Policy,
        MaxParentalRating: data.MaxParentalRating,
        BlockUnratedItems: data.BlockUnratedItems as any[],
        AllowedTags: data.AllowedTags || [],
        BlockedTags: data.BlockedTags || [],
      };

      await updateUserPolicy(user.Id, updatedPolicy);
      toast.success("Parental controls updated successfully");
    } catch (error) {
      console.error("Failed to update parental controls:", error);
      toast.error("Failed to update parental controls");
    } finally {
      setDashboardLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full pb-10"
      >
        <RatingSection ratings={ratings} isLoadingRatings={dashboardLoading} />
        <UnratedItemsSection />
        <TagsSection />

        <div className="flex justify-end pt-6">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
