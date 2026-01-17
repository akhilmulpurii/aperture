import { useEffect, useReducer, useState } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { FileBrowserDropdown } from "../../components/file-browser-dropdown";
import {
  fetchDashboardGeneralData,
  updateDashboardConfiguration,
} from "../../actions";
import { toast } from "sonner";
import { LocalizationOption } from "@jellyfin/sdk/lib/generated-client/models";
import type { ServerConfiguration } from "@jellyfin/sdk/lib/generated-client/models";
import {
  dashboardGeneralReducer,
  initialGeneralFormState,
} from "../../reducer/dashboard-general-reducer";
import { useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "../../lib/atoms";

export default function DashboardGeneralPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const [formState, dispatch] = useReducer(
    dashboardGeneralReducer,
    initialGeneralFormState
  );
  const {
    configuration,
    serverName,
    cachePath,
    metadataPath,
    selectedLanguage,
    quickConnectEnabled,
    parallelLibraryScan,
    parallelImageEncoding,
  } = formState;
  const [isSaving, setIsSaving] = useState(false);
  const [languageOptions, setLanguageOptions] = useState<LocalizationOption[]>(
    []
  );
  const [serverNameError, setServerNameError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setDashboardLoading(true);
      try {
        const result = await fetchDashboardGeneralData();
        if (!isMounted) return;

        setLanguageOptions(result.localizationOptions ?? []);
        dispatch({ type: "init", configuration: result.configuration ?? null });
      } catch (error) {
        console.error("Failed to load general settings:", error);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!configuration || isSaving) return;
    if (!serverName.trim()) {
      setServerNameError("Server name is required.");
      toast.error("Server name is required.");
      return;
    }

    const nextConfig: ServerConfiguration = {
      ...configuration,
      ServerName: serverName.trim() || configuration.ServerName,
      CachePath: cachePath.trim(),
      MetadataPath: metadataPath.trim(),
      UICulture: selectedLanguage || configuration.UICulture,
      QuickConnectAvailable: quickConnectEnabled,
      LibraryScanFanoutConcurrency:
        parallelLibraryScan.trim() === ""
          ? configuration.LibraryScanFanoutConcurrency
          : Number(parallelLibraryScan),
      ParallelImageEncodingLimit:
        parallelImageEncoding.trim() === ""
          ? configuration.ParallelImageEncodingLimit
          : Number(parallelImageEncoding),
    };

    try {
      setIsSaving(true);
      setServerNameError("");
      setDashboardLoading(true);
      await updateDashboardConfiguration(nextConfig);
      dispatch({ type: "init", configuration: nextConfig });
      toast.success("Settings saved.");
    } catch (error) {
      console.error("Failed to save configuration:", error);
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
      setDashboardLoading(false);
    }
  };

  return (
    <form className="w-full space-y-8">
      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Connect</h3>
        <div className="flex items-start gap-3">
          <Checkbox
            id="quick-connect-enabled"
            checked={quickConnectEnabled}
            onCheckedChange={(value) =>
              dispatch({
                type: "set",
                field: "quickConnectEnabled",
                value: value === true,
              })
            }
          />
          <label
            htmlFor="quick-connect-enabled"
            className="text-sm font-medium leading-none"
          >
            Enable Quick Connect on this server
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground">Server Info</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="server-name">Server Name</Label>
            <Input
              id="server-name"
              type="text"
              placeholder="My Jellyfin Server"
              value={serverName}
              className={serverNameError ? "border-red-500" : ""}
              onChange={(event) =>
                dispatch({
                  type: "set",
                  field: "serverName",
                  value: event.target.value,
                })
              }
            />
            {serverNameError ? (
              <p className="text-xs text-red-500">{serverNameError}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              This name will be used to identify the server and will default to
              the server&apos;s hostname.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="server-display-language">
              Server display language
            </Label>
            <Select
              key={`Language-Select-${languageOptions.length}`}
              value={selectedLanguage || ""}
              onValueChange={(value) =>
                dispatch({
                  type: "set",
                  field: "selectedLanguage",
                  value,
                })
              }
            >
              <SelectTrigger id="server-display-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.Value} value={option.Value || ""}>
                    {option.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This setting updates the server configuration via Jellyfin
              Weblate. UI translations are not yet implemented in this app.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Paths</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cache-path">Cache Path</Label>
            <div className="relative">
              <Input
                id="cache-path"
                type="text"
                placeholder="/var/cache/jellyfin"
                className="pr-10"
                value={cachePath}
                onChange={(event) =>
                  dispatch({
                    type: "set",
                    field: "cachePath",
                    value: event.target.value,
                  })
                }
              />
              <FileBrowserDropdown
                ariaLabel="Browse cache path"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onSelect={(value) =>
                  dispatch({ type: "set", field: "cachePath", value })
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Specify a custom location for server cache files such as images.
              Leave blank to use the server default.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadata-path">Metadata Path</Label>
            <div className="relative">
              <Input
                id="metadata-path"
                type="text"
                placeholder="/var/lib/jellyfin/metadata"
                className="pr-10"
                value={metadataPath}
                onChange={(event) =>
                  dispatch({
                    type: "set",
                    field: "metadataPath",
                    value: event.target.value,
                  })
                }
              />
              <FileBrowserDropdown
                ariaLabel="Browse metadata path"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onSelect={(value) =>
                  dispatch({ type: "set", field: "metadataPath", value })
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Specify a custom location for downloaded artwork and metadata.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Performance</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="parallel-library-scan">
              Parallel Library Scan tasks limit
            </Label>
            <Input
              id="parallel-library-scan"
              type="number"
              inputMode="numeric"
              placeholder="Auto"
              value={parallelLibraryScan}
              onChange={(event) =>
                dispatch({
                  type: "set",
                  field: "parallelLibraryScan",
                  value: event.target.value,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of parallel tasks during library scans. Leaving
              this empty will choose a limit based on your systems core count.
              WARNING: Setting this number too high may cause issues with
              network file systems; if you encounter problems lower this number.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="parallel-image-encoding">
              Parallel image encoding limit
            </Label>
            <Input
              id="parallel-image-encoding"
              type="number"
              inputMode="numeric"
              placeholder="Auto"
              value={parallelImageEncoding}
              onChange={(event) =>
                dispatch({
                  type: "set",
                  field: "parallelImageEncoding",
                  value: event.target.value,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of image encodings that are allowed to run in
              parallel. Leaving this empty will choose a limit based on your
              systems core count.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
          onClick={handleSave}
          disabled={isSaving || !configuration}
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
