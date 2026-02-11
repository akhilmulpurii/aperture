"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  defaultNfoSettingsFormValues,
  nfoSettingsFormSchema,
  NfoSettingsFormValues,
} from "@/src/form-schemas/libraries/nfo-settings";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import {
  fetchXbmcMetadataConfiguration,
  updateXbmcMetadataConfiguration,
  fetchUsers,
} from "@/src/actions";
import { UserDto } from "@jellyfin/sdk/lib/generated-client/models";

export default function LibrariesNfoSettingsPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const [users, setUsers] = useState<UserDto[]>([]);
  const form = useForm<NfoSettingsFormValues>({
    resolver: zodResolver(nfoSettingsFormSchema) as any,
    defaultValues: defaultNfoSettingsFormValues,
  });

  useEffect(() => {
    const loadData = async () => {
      setDashboardLoading(true);
      try {
        const [config, usersData] = await Promise.all([
          fetchXbmcMetadataConfiguration(),
          fetchUsers(),
        ]);

        setUsers(usersData);

        form.reset({
          UserId: config.UserId || "",
          SaveImagePathsInNfo: config.SaveImagePathsInNfo || false,
          EnablePathSubstitution: config.EnablePathSubstitution || false,
          EnableExtraThumbsDuplication:
            config.EnableExtraThumbsDuplication || false,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load NFO settings");
      } finally {
        setDashboardLoading(false);
      }
    };
    loadData();
  }, [setDashboardLoading, form]);

  async function onSubmit(data: NfoSettingsFormValues) {
    setDashboardLoading(true);
    try {
      // Fetch current config to merge (good practice, though we are overwriting most fields here)
      const currentConfig = await fetchXbmcMetadataConfiguration();

      const newConfig = {
        ...currentConfig,
        UserId:
          data.UserId === "None" || data.UserId === "" ? null : data.UserId,
        SaveImagePathsInNfo: data.SaveImagePathsInNfo,
        EnablePathSubstitution: data.EnablePathSubstitution,
        EnableExtraThumbsDuplication: data.EnableExtraThumbsDuplication,
      };

      await updateXbmcMetadataConfiguration(newConfig);
      toast.success("NFO settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save NFO settings");
    } finally {
      setDashboardLoading(false);
    }
  }

  return (
    <div className="w-full pb-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
            <div className="flex flex-col space-y-1.5">
              <h3 className="text-lg font-semibold text-foreground">
                NFO Settings
              </h3>
              <p className="text-sm text-muted-foreground">
                To enable or disable NFO metadata, edit a library and find the
                &apos;Metadata savers&apos; section.
              </p>
            </div>

            <div className="space-y-6">
              <FormField
                key={`UserId-${users.length}`}
                control={form.control}
                name="UserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Save user watch data to NFO files for</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value || "None"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.Id} value={user.Id || ""}>
                            {user.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Save watch data to NFO files for other applications to
                      use.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="SaveImagePathsInNfo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Save image paths within NFO files</FormLabel>
                        <FormDescription>
                          This is recommended if you have image file names that
                          don&apos;t conform to Kodi guidelines.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="EnablePathSubstitution"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable path substitution</FormLabel>
                        <FormDescription>
                          Enable path substitution of image paths using the
                          server&apos;s path substitution settings.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="EnableExtraThumbsDuplication"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Copy extra fanart to extrathumbs</FormLabel>
                        <FormDescription>
                          When downloading images they can be saved into both
                          extrafanart and extrathumbs for maximum Kodi skin
                          compatibility.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
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
