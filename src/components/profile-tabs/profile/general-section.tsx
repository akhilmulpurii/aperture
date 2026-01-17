import { useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Checkbox } from "../../ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Upload, X } from "lucide-react";
import { ProfileFormValues } from "./schema";

interface GeneralSectionProps {
  avatarUrl: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function GeneralSection({
  avatarUrl,
  handleImageUpload,
}: GeneralSectionProps) {
  const form = useFormContext<ProfileFormValues>();
  const Name = useWatch({
    control: form.control,
    name: "Name",
  });

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">General</h3>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        {/* Avatar Picker */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <Avatar className="h-40 w-40 border-4 border-muted">
              <AvatarImage
                src={avatarUrl || undefined}
                className="object-cover"
              />
              <AvatarFallback className="text-4xl">
                {(Name || "").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer text-white flex flex-col items-center gap-1"
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs font-medium">Change</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>
          {avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={() => {
                // TODO: Implement delete image action
                console.log("Delete image");
              }}
            >
              <X className="h-4 w-4 mr-1" /> Remove Image
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="Name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} className="max-w-md" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="EnableRemoteAccess"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Allow remote connections to this server
                    </FormLabel>
                    <FormDescription>
                      If unchecked, all remote connections will be blocked.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="IsAdministrator"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow this user to manage the server
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="EnableCollectionManagement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow this user to manage collections
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="EnableSubtitleManagement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow this user to edit subtitles
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
