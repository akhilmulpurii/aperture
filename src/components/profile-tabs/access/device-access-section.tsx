"use client";
import { useFormContext, useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "../../ui/form";
import { Checkbox } from "../../ui/checkbox";
import { DeviceInfoDto } from "@jellyfin/sdk/lib/generated-client/models";
import { AccessFormValues } from "./schema";

interface DeviceAccessSectionProps {
  devices: DeviceInfoDto[];
  isLoadingDevices: boolean;
}

export function DeviceAccessSection({
  devices,
  isLoadingDevices,
}: DeviceAccessSectionProps) {
  const form = useFormContext<AccessFormValues>();
  const enableAllDevices = useWatch({
    control: form.control,
    name: "EnableAllDevices",
  });

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Device Access</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="EnableAllDevices"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                />
              </FormControl>
              <FormLabel className="font-normal">
                Enable access from all devices
              </FormLabel>
            </FormItem>
          )}
        />

        {!enableAllDevices && (
          <div className="grid gap-3 pl-8 mt-2">
            <FormField
              control={form.control}
              name="EnabledDevices"
              render={({ field }) => {
                if (isLoadingDevices) {
                  return (
                    <div className="text-sm text-muted-foreground">
                      Loading devices...
                    </div>
                  );
                }

                if (devices.length === 0) {
                  return (
                    <div className="text-sm text-muted-foreground">
                      No devices found.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {devices.map((device) => {
                      const deviceId = device.Id;
                      if (!deviceId) return null;

                      return (
                        <FormItem
                          key={deviceId}
                          className="flex flex-row items-center gap-2 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(deviceId)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, deviceId]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (value: string) => value !== deviceId,
                                    ),
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm cursor-pointer break-all">
                            {device.Name || device.AppName || "Unknown Device"}
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
          This only applies to devices that can be uniquely identified and will
          not prevent browser access. Filtering user device access will prevent
          them from using new devices until they&apos;ve been approved here.
        </p>
      </div>
    </div>
  );
}
