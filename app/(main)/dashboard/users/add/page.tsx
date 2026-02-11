"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import { addUserFormSchema, AddUserFormValues } from "@/src/form-schemas/users";
import {
  createUser,
  fetchMediaFolders,
  updateUserPolicy,
  getUserById,
} from "@/src/actions";
import {
  BaseItemDto,
  UserPolicy,
} from "@jellyfin/sdk/lib/generated-client/models";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import { useSetAtom } from "jotai";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
  const router = useRouter();
  const [libraries, setLibraries] = useState<BaseItemDto[]>([]);
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const dashboardLoading = useAtomValue(dashboardLoadingAtom);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserFormSchema) as any,
    defaultValues: {
      Name: "",
      Password: "",
      EnableAllFolders: true,
      EnabledFolders: [],
    },
  });

  const enableAllFolders = useWatch({
    control: form.control,
    name: "EnableAllFolders",
  });

  useEffect(() => {
    fetchMediaFolders()
      .then(setLibraries)
      .finally(() => setDashboardLoading(false));
  }, [setDashboardLoading]);

  async function onSubmit(data: AddUserFormValues) {
    try {
      // 1. Create the user
      const createdUser = await createUser(data.Name, data.Password);

      // 2. Update library access if customized
      if (!data.EnableAllFolders && createdUser.Id) {
        // We need to fetch the fresh user to get their current policy as a base
        const freshUser = await getUserById(createdUser.Id);

        if (freshUser && freshUser.Policy) {
          const updatedPolicy: UserPolicy = {
            ...freshUser.Policy,
            EnableAllFolders: data.EnableAllFolders,
            EnabledFolders: data.EnabledFolders || [],
          };
          await updateUserPolicy(createdUser.Id, updatedPolicy);
        }
      }

      toast.success(`User "${data.Name}" created successfully`);
      router.push("/dashboard/users");
    } catch (error: any) {
      console.error("Failed to create user:", error);
      const errorMessage =
        error?.response?.data || error.message || "Failed to create user";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to create user",
      );
    }
  }

  return (
    <div className="w-full max-w-2xl pb-10">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Add New User</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Section */}
          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-foreground">General</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="User Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Optional"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Library Access Section */}
          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              Library Access
            </h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="EnableAllFolders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
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
                      if (dashboardLoading) {
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                        field.onChange([
                                          ...currentValue,
                                          libraryId,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentValue.filter(
                                            (val) => val !== libraryId,
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
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
