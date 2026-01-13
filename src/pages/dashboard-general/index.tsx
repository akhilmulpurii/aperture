import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";

export default function DashboardGeneralPage() {
  return (
    <form className="max-w-3xl space-y-8">
      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="server-name">Server Name</Label>
          <Input
            id="server-name"
            type="text"
            placeholder="My Jellyfin Server"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Paths</h3>
        <div className="space-y-2">
          <Label htmlFor="cache-path">Cache Path</Label>
          <div className="relative">
            <Input
              id="cache-path"
              type="text"
              placeholder="/var/cache/jellyfin"
              className="pr-10"
            />
            <button
              type="button"
              aria-label="Browse cache path"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="metadata-path">Metadata Path</Label>
          <div className="relative">
            <Input
              id="metadata-path"
              type="text"
              placeholder="/var/lib/jellyfin/metadata"
              className="pr-10"
            />
            <button
              type="button"
              aria-label="Browse metadata path"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Quick Connect
        </h3>
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border/70 bg-muted/10 px-3 py-2">
          <Checkbox id="quick-connect-enabled" />
          <label
            htmlFor="quick-connect-enabled"
            className="text-sm font-medium leading-none"
          >
            Enable Quick Connect on this server
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Performance</h3>
        <div className="space-y-2">
          <Label htmlFor="parallel-library-scan">
            Parallel Library Scan tasks limit
          </Label>
          <Input
            id="parallel-library-scan"
            type="number"
            inputMode="numeric"
            placeholder="Auto"
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of parallel tasks during library scans. Leaving this
            empty will choose a limit based on your systems core count. WARNING:
            Setting this number too high may cause issues with network file
            systems; if you encounter problems lower this number.
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
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of image encodings that are allowed to run in
            parallel. Leaving this empty will choose a limit based on your
            systems core count.
          </p>
        </div>
      </div>
    </form>
  );
}
