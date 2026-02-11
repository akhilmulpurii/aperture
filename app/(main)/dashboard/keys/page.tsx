"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Label } from "@/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { ArrowUpDown, KeyRound, Search } from "lucide-react";
import {
  createApiKey,
  fetchApiKeys,
  normalizeApiKeys,
  revokeApiKey,
} from "@/src/actions";
import type { AuthenticationInfo } from "@jellyfin/sdk/lib/generated-client/models";
import { toast } from "sonner";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import { useAtomValue, useSetAtom } from "jotai";

const PAGE_SIZE = 10;

type SortKey =
  | "AppName"
  | "AccessToken"
  | "IsActive"
  | "DateCreated"
  | "DateLastActivity";
type SortDirection = "asc" | "desc";

export default function DashboardKeysPage() {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("DateCreated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [keys, setKeys] = useState<AuthenticationInfo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [revokingKey, setRevokingKey] = useState<string | null>(null);
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const dashboardLoading = useAtomValue(dashboardLoadingAtom);

  const loadKeys = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const result = await fetchApiKeys();
      setKeys(normalizeApiKeys(result.Items ?? []));
    } catch (error) {
      console.error("Failed to load API keys:", error);
    } finally {
      setDashboardLoading(false);
    }
  }, [setDashboardLoading]);

  const filtered = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return keys.filter((item) => {
      const matchesQuery =
        !lowerQuery ||
        item.AppName?.toLowerCase().includes(lowerQuery) ||
        item.AccessToken?.toLowerCase().includes(lowerQuery) ||
        item.UserId?.toLowerCase().includes(lowerQuery);
      return matchesQuery;
    });
  }, [keys, query]);

  const sorted = useMemo(() => {
    return filtered.slice().sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      const getValue = (item: AuthenticationInfo) => {
        switch (sortKey) {
          case "IsActive":
            return item.IsActive ? 1 : 0;
          case "DateCreated":
            return new Date(item.DateCreated!).getTime();
          case "DateLastActivity":
            return new Date(item.DateLastActivity!).getTime();
          default:
            return item[sortKey] ?? "";
        }
      };
      const aValue = getValue(a);
      const bValue = getValue(b);
      if (aValue < bValue) return -1 * direction;
      if (aValue > bValue) return 1 * direction;
      return 0;
    });
  }, [filtered, sortKey, sortDirection]);

  useEffect(() => {
    let isMounted = true;
    const loadInitial = async () => {
      try {
        await loadKeys();
      } finally {
        if (isMounted) {
          setDashboardLoading(false);
        }
      }
    };

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [loadKeys, setDashboardLoading]);

  const handleCreateKey = async () => {
    const trimmed = newAppName.trim();
    if (!trimmed || isCreating) {
      if (!trimmed) {
        toast.error("App name is required.");
      }
      return;
    }

    try {
      setIsCreating(true);
      await createApiKey(trimmed);
      await loadKeys();
      setIsDialogOpen(false);
      setNewAppName("");
      toast.success("API key created.");
    } catch (error) {
      console.error("Failed to create API key:", error);
      toast.error("Failed to create API key.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (accessToken?: string | null) => {
    if (!accessToken || revokingKey) return;
    if (!window.confirm("Delete this API key?")) return;

    try {
      setRevokingKey(accessToken);
      await revokeApiKey(accessToken);
      await loadKeys();
      toast.success("API key deleted.");
    } catch (error) {
      console.error("Failed to delete API key:", error);
      toast.error("Failed to delete API key.");
    } finally {
      setRevokingKey(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (nextKey: SortKey) => {
    setPage(1);
    if (sortKey === nextKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(nextKey);
      setSortDirection("asc");
    }
  };

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">Note</h3>
            <p className="text-sm text-muted-foreground">
              External applications are required to have an API key in order to
              communicate with the server. Keys are issued by logging in with a
              normal user account or manually granting the application a key.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Input
              type="text"
              placeholder="Search by app, token, or user id"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" className="gap-2">
                New API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key-app-name">App Name</Label>
                  <Input
                    id="api-key-app-name"
                    type="text"
                    placeholder="My app"
                    value={newAppName}
                    onChange={(event) => setNewAppName(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    A human readable name for identifying API keys. This setting
                    will not affect functionality.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleCreateKey}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-left"
                  onClick={() => handleSort("AppName")}
                >
                  App Name
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </TableHead>
              <TableHead>Token</TableHead>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-left"
                  onClick={() => handleSort("IsActive")}
                >
                  Status
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-left"
                  onClick={() => handleSort("DateCreated")}
                >
                  Created
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-left"
                  onClick={() => handleSort("DateLastActivity")}
                >
                  Last Activity
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </TableHead>
              <TableHead className="text-left w-[1%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboardLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Loading API keys...
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No API keys found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item) => (
                <TableRow
                  key={`${item.AppName}-${item.AccessToken || item.Id}`}
                >
                  <TableCell className="font-medium">{item.AppName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.AccessToken}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.IsActive ? "default" : "secondary"}>
                      {item.IsActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(item.DateCreated!)}</TableCell>
                  <TableCell>{formatDate(item.DateLastActivity!)}</TableCell>
                  <TableCell className="text-left w-[1%]">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-red-500/40 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      disabled={revokingKey === item.AccessToken}
                      onClick={() => handleRevokeKey(item.AccessToken)}
                    >
                      {revokingKey === item.AccessToken
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing {paginated.length} of {sorted.length} keys
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
